from __future__ import annotations

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import update_last_login
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from backend.core.forms_library import FORMS_LIBRARY
from backend.core.models import Attachment, AuditEvent, Clinic, Document, Encounter, Patient, User
from backend.core.red_flags import detect_red_flags
from backend.core.services import generate_document_content


class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = ["id", "name", "slug", "created_at"]


class UserSerializer(serializers.ModelSerializer):
    clinic = ClinicSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "clinic"]


class RegisterSerializer(serializers.Serializer):
    clinic_name = serializers.CharField(max_length=255)
    clinic_slug = serializers.SlugField()
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        with transaction.atomic():
            clinic = Clinic.objects.create(
                name=validated_data["clinic_name"],
                slug=validated_data["clinic_slug"],
            )
            user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data.get("email", ""),
                password=validated_data["password"],
                first_name=validated_data.get("first_name", ""),
                last_name=validated_data.get("last_name", ""),
                clinic=clinic,
            )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs.get("username"),
            password=attrs.get("password"),
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        update_last_login(None, user)
        attrs["user"] = user
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["clinic_id"] = user.clinic_id
        token["username"] = user.username
        return token


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            "id",
            "external_id",
            "first_name",
            "last_name",
            "date_of_birth",
            "sex",
            "mrn",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):
        clinic = self.context["request"].user.clinic
        external_id = attrs.get("external_id", "")
        if external_id and Patient.objects.filter(clinic=clinic, external_id=external_id).exists():
            raise serializers.ValidationError({"external_id": "Patient with this external_id already exists in this clinic."})
        return attrs

    def create(self, validated_data):
        clinic = self.context["request"].user.clinic
        return Patient.objects.create(clinic=clinic, **validated_data)


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id", "filename", "file", "created_at"]
        read_only_fields = ["created_at"]


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id",
            "encounter",
            "kind",
            "status",
            "title",
            "content",
            "content_json",
            "review_notes",
            "finalized_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["finalized_at", "created_at", "updated_at"]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        if instance and instance.status == Document.Status.FINAL:
            raise serializers.ValidationError("Final documents are read-only.")
        return attrs

    def update(self, instance, validated_data):
        request = self.context["request"]
        before = {"content": instance.content, "content_json": instance.content_json, "review_notes": instance.review_notes}
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if instance.status != Document.Status.FINAL and validated_data:
            instance.status = Document.Status.DRAFT
        instance.save()
        AuditEvent.objects.create(
            clinic=request.user.clinic,
            actor=request.user,
            entity_type="Document",
            entity_id=str(instance.id),
            action="updated",
            payload={"before": before, "after": validated_data},
        )
        return instance


class EncounterSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    documents = DocumentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Encounter
        fields = [
            "id",
            "patient",
            "patient_name",
            "visit_date",
            "chief_complaint",
            "raw_notes",
            "status",
            "red_flags",
            "metadata",
            "documents",
            "attachments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["red_flags", "created_at", "updated_at", "documents", "attachments"]

    def get_patient_name(self, obj):
        return f"{obj.patient.last_name}, {obj.patient.first_name}"

    def validate(self, attrs):
        patient = attrs.get("patient") or getattr(self.instance, "patient", None)
        if patient and patient.clinic_id != self.context["request"].user.clinic_id:
            raise serializers.ValidationError({"patient": "Patient does not belong to your clinic."})
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        clinic = request.user.clinic
        encounter = Encounter.objects.create(clinic=clinic, created_by=request.user, **validated_data)
        encounter.red_flags = detect_red_flags(encounter.raw_notes or encounter.chief_complaint or "")
        encounter.save(update_fields=["red_flags"])
        AuditEvent.objects.create(
            clinic=clinic,
            actor=request.user,
            entity_type="Encounter",
            entity_id=str(encounter.id),
            action="created",
            payload={"patient_id": encounter.patient_id},
        )
        return encounter

    def update(self, instance, validated_data):
        request = self.context["request"]
        before = {"chief_complaint": instance.chief_complaint, "raw_notes": instance.raw_notes, "status": instance.status}
        if instance.status == Encounter.Status.FINAL:
            raise serializers.ValidationError("Final encounters are locked through finalized documents.")
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.red_flags = detect_red_flags(instance.raw_notes or instance.chief_complaint or "")
        instance.save()
        AuditEvent.objects.create(
            clinic=request.user.clinic,
            actor=request.user,
            entity_type="Encounter",
            entity_id=str(instance.id),
            action="updated",
            payload={"before": before, "after": validated_data},
        )
        return instance


class GenerateRequestSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=False, allow_blank=True, default="")


class ReviewRequestSerializer(serializers.Serializer):
    review_notes = serializers.CharField(required=False, allow_blank=True, default="")


class FinalizeRequestSerializer(serializers.Serializer):
    confirm = serializers.BooleanField(default=True)


class FormKindSerializer(serializers.Serializer):
    form_kind = serializers.ChoiceField(choices=[("soap", "SOAP"), ("avs", "AVS"), ("form", "FORM")])

    def validate_form_kind(self, value):
        if value == "form":
            return value
        return value
