from __future__ import annotations

from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from backend.core.models import Attachment, AuditEvent, Clinic, Document, Encounter, Patient
from backend.core.pdf_export import build_final_pdf
from backend.core.serializers import (
    AttachmentSerializer,
    CustomTokenObtainPairSerializer,
    DocumentSerializer,
    EncounterSerializer,
    FinalizeRequestSerializer,
    GenerateRequestSerializer,
    LoginSerializer,
    PatientSerializer,
    RegisterSerializer,
    ReviewRequestSerializer,
    UserSerializer,
)
from backend.core.services import extract_chief_complaint, upsert_generated_document

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        data = {
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ClinicScopedViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(clinic=self.request.user.clinic)


class PatientViewSet(ClinicScopedViewSet):
    serializer_class = PatientSerializer
    queryset = Patient.objects.select_related("clinic")

    def perform_create(self, serializer):
        serializer.save()


class EncounterViewSet(ClinicScopedViewSet):
    serializer_class = EncounterSerializer
    queryset = Encounter.objects.select_related("clinic", "patient", "created_by").prefetch_related("documents", "attachments")

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def generate_soap(self, request, pk=None):
        return self._generate(request, pk, Document.Kind.SOAP)

    @action(detail=True, methods=["post"])
    def generate_avs(self, request, pk=None):
        return self._generate(request, pk, Document.Kind.AVS)

    @action(detail=True, methods=["post"])
    def generate_form(self, request, pk=None):
        kind = request.data.get("form_kind", "form")
        return self._generate(request, pk, kind)

    @action(detail=True, methods=["post"])
    def upload_attachment(self, request, pk=None):
        encounter = self.get_object()
        upload = request.FILES.get("file")
        if not upload:
            return Response({"detail": "file is required"}, status=status.HTTP_400_BAD_REQUEST)
        attachment = Attachment.objects.create(
            encounter=encounter,
            file=upload,
            filename=upload.name,
            uploaded_by=request.user,
        )
        AuditEvent.objects.create(
            clinic=request.user.clinic,
            actor=request.user,
            entity_type="Attachment",
            entity_id=str(attachment.id),
            action="uploaded",
            payload={"filename": upload.name},
        )
        return Response(AttachmentSerializer(attachment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def documents(self, request, pk=None):
        encounter = self.get_object()
        docs = encounter.documents.all()
        return Response(DocumentSerializer(docs, many=True, context={"request": request}).data)

    def _generate(self, request, pk, kind):
        encounter = self.get_object()
        prompt = request.data.get("prompt", "")
        document = upsert_generated_document(encounter, kind=kind, user=request.user, prompt=prompt)
        return Response(DocumentSerializer(document, context={"request": request}).data, status=status.HTTP_201_CREATED)


class ChiefComplaintPreviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        raw_notes = request.data.get("raw_notes", "")
        chief_complaint, meta = extract_chief_complaint(raw_notes)
        return Response({"chief_complaint": chief_complaint, "metadata": meta})


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    queryset = Document.objects.select_related("encounter", "encounter__clinic", "encounter__patient")

    def get_queryset(self):
        return self.queryset.filter(encounter__clinic=self.request.user.clinic)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"])
    def submit_review(self, request, pk=None):
        document = self.get_object()
        if document.status == Document.Status.FINAL:
            return Response({"detail": "Final documents cannot be submitted for review."}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ReviewRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document.status = Document.Status.IN_REVIEW
        document.review_notes = serializer.validated_data["review_notes"]
        document.save(update_fields=["status", "review_notes", "updated_at"])
        AuditEvent.objects.create(
            clinic=request.user.clinic,
            actor=request.user,
            entity_type="Document",
            entity_id=str(document.id),
            action="submitted_review",
            payload={"review_notes": document.review_notes},
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def finalize(self, request, pk=None):
        document = self.get_object()
        serializer = FinalizeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if document.status == Document.Status.FINAL:
            return Response(DocumentSerializer(document, context={"request": request}).data)
        document.status = Document.Status.FINAL
        document.finalized_at = timezone.now()
        document.encounter.status = Encounter.Status.FINAL
        document.encounter.save(update_fields=["status", "updated_at"])
        document.save(update_fields=["status", "finalized_at", "updated_at"])
        AuditEvent.objects.create(
            clinic=request.user.clinic,
            actor=request.user,
            entity_type="Document",
            entity_id=str(document.id),
            action="finalized",
            payload={"confirm": True},
        )
        return Response(DocumentSerializer(document, context={"request": request}).data)

    @action(detail=True, methods=["get"])
    def export_json(self, request, pk=None):
        document = self.get_object()
        if document.status != Document.Status.FINAL:
            return Response({"detail": "Only final documents can be exported."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(DocumentSerializer(document, context={"request": request}).data)

    @action(detail=True, methods=["get"])
    def export_pdf(self, request, pk=None):
        document = self.get_object()
        try:
            pdf_bytes = build_final_pdf(document)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="document-{document.id}.pdf"'
        return response


class MeRegisterLoginHintView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return JsonResponse({"detail": "Use POST /api/register/ or POST /api/login/."})
