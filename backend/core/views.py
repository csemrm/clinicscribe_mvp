from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.throttling import UserRateThrottle

from django.shortcuts import get_object_or_404

from rest_framework_simplejwt.tokens import RefreshToken

from .models import Patient, Encounter, Document, Attachment, AuditEvent, Clinic, User
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    PatientSerializer, EncounterSerializer, DocumentSerializer, DocumentUpdateSerializer,
    AttachmentSerializer, AuditEventSerializer
)
from .querysets import clinic_filtered_queryset
from .red_flags import has_red_flag
from .tasks import generate_soap, generate_avs, generate_form
from .services import submit_review, finalize_document, create_audit
from .pdf_export import render_document_pdf
from .forms_library import FORM_TEMPLATES

class GenerateThrottle(UserRateThrottle):
    scope = "generate"

def issue_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response({"user": UserSerializer(user).data, "tokens": issue_tokens(user)})

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        ser = LoginSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.validated_data["user"]
        return Response({"user": UserSerializer(user).data, "tokens": issue_tokens(user)})

class MeView(APIView):
    def get(self, request):
        return Response({"user": UserSerializer(request.user).data})

class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSerializer

    def get_queryset(self):
        return clinic_filtered_queryset(Patient.objects.all().order_by("-updated_at"), self.request.user)

    def perform_create(self, serializer):
        serializer.save(clinic=self.request.user.clinic)

class EncounterViewSet(viewsets.ModelViewSet):
    serializer_class = EncounterSerializer

    def get_queryset(self):
        qs = Encounter.objects.select_related("patient","clinician").all().order_by("-occurred_at")
        return clinic_filtered_queryset(qs, self.request.user)

    def perform_create(self, serializer):
        clinician_id = serializer.validated_data.get("clinician_id") or self.request.user.id
        serializer.save(clinic=self.request.user.clinic, clinician_id=clinician_id)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], throttle_classes=[GenerateThrottle])
    def generate_soap(self, request, pk=None):
        enc = self.get_object()
        job = generate_soap.delay(enc.id, request.user.id)
        return Response({"job_id": job.id, "red_flag": has_red_flag(enc.raw_notes)})

    @action(detail=True, methods=["post"], throttle_classes=[GenerateThrottle])
    def generate_avs(self, request, pk=None):
        enc = self.get_object()
        job = generate_avs.delay(enc.id, request.user.id)
        return Response({"job_id": job.id, "red_flag": has_red_flag(enc.raw_notes)})

    @action(detail=True, methods=["post"], throttle_classes=[GenerateThrottle])
    def generate_form(self, request, pk=None):
        enc = self.get_object()
        form_type = request.data.get("form_type")
        extra_fields = request.data.get("extra_fields") or {}
        if form_type not in FORM_TEMPLATES:
            return Response({"detail": "Invalid form_type"}, status=400)
        job = generate_form.delay(enc.id, request.user.id, form_type, extra_fields)
        return Response({"job_id": job.id, "red_flag": has_red_flag(enc.raw_notes)})

    @action(detail=True, methods=["post"])
    def upload_attachment(self, request, pk=None):
        enc = self.get_object()
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "file is required"}, status=400)
        att = Attachment.objects.create(encounter=enc, file=file, uploaded_by=request.user)
        return Response(AttachmentSerializer(att).data, status=201)

    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        enc = self.get_object()
        docs = enc.documents.all().order_by("-created_at")
        return Response(DocumentSerializer(docs, many=True).data)

class DocumentViewSet(viewsets.GenericViewSet):
    queryset = Document.objects.select_related("encounter__patient","encounter__clinic").all()
    serializer_class = DocumentSerializer

    def get_queryset(self):
        return clinic_filtered_queryset(self.queryset, self.request.user)

    def retrieve(self, request, pk=None):
        doc = self.get_object()
        data = DocumentSerializer(doc).data
        data["audit_events"] = AuditEventSerializer(doc.audit_events.all(), many=True).data
        return Response(data)

    def update(self, request, pk=None):
        doc = self.get_object()
        ser = DocumentUpdateSerializer(doc, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        create_audit(doc, action=AuditEvent.Action.EDITED, actor=request.user, from_status=doc.status, to_status=doc.status, metadata={"fields": list(ser.validated_data.keys())})
        return Response(DocumentSerializer(doc).data)

    @action(detail=True, methods=["post"])
    def submit_review(self, request, pk=None):
        doc = self.get_object()
        try:
            submit_review(doc, actor=request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(DocumentSerializer(doc).data)

    @action(detail=True, methods=["post"])
    def finalize(self, request, pk=None):
        doc = self.get_object()
        try:
            finalize_document(doc, actor=request.user)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(DocumentSerializer(doc).data)

    @action(detail=True, methods=["get"])
    def export_json(self, request, pk=None):
        doc = self.get_object()
        return Response({"structured_json": doc.structured_json or {}})

    @action(detail=True, methods=["get"])
    def export_pdf(self, request, pk=None):
        doc = self.get_object()
        if doc.status != Document.Status.FINAL:
            return Response({"detail": "Document must be FINAL to export."}, status=400)
        enc = doc.encounter
        clinic_name = enc.clinic.name
        patient_name = enc.patient.name
        occurred_at = enc.occurred_at.strftime("%Y-%m-%d %H:%M")
        title = f"{doc.type} ({doc.status})"
        body = doc.final_text or ""
        pdf_bytes = render_document_pdf(
            clinic_name=clinic_name,
            patient_name=patient_name,
            occurred_at=occurred_at,
            doc_title=title,
            body_text=body,
        )
        from django.http import HttpResponse
        resp = HttpResponse(pdf_bytes, content_type="application/pdf")
        resp["Content-Disposition"] = f'attachment; filename="document_{doc.id}.pdf"'
        return resp
