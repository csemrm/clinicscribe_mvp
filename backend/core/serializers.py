from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Clinic, User, Patient, Encounter, Document, Attachment, AuditEvent

class ClinicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clinic
        fields = ["id", "name"]

class UserSerializer(serializers.ModelSerializer):
    clinic = ClinicSerializer(read_only=True)
    class Meta:
        model = User
        fields = ["id", "email", "role", "clinic"]

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    clinic_name = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        email = validated_data["email"]
        password = validated_data["password"]
        clinic_name = validated_data.get("clinic_name") or "Demo Clinic"
        clinic, _ = Clinic.objects.get_or_create(name=clinic_name)
        user = User.objects.create_user(email=email, password=password, clinic=clinic, role=User.Role.CLINICIAN)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(email=attrs["email"], password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        attrs["user"] = user
        return attrs

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ["id", "name", "dob", "mrn", "phone", "email", "address", "context", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]

class EncounterSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    patient_id = serializers.IntegerField(write_only=True)
    clinician = UserSerializer(read_only=True)
    clinician_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Encounter
        fields = ["id", "patient", "patient_id", "clinician", "clinician_id", "visit_type", "occurred_at", "raw_notes", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id", "file", "uploaded_by", "created_at"]
        read_only_fields = ["uploaded_by", "created_at"]

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id","encounter","type","status","ai_draft_text","final_text","structured_json","version",
            "created_by","reviewed_by","created_at","updated_at","reviewed_at","finalized_at"
        ]
        read_only_fields = ["created_by","reviewed_by","created_at","updated_at","reviewed_at","finalized_at","status","version","ai_draft_text"]

class DocumentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["final_text", "structured_json"]

class AuditEventSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    class Meta:
        model = AuditEvent
        fields = ["id","action","actor","from_status","to_status","timestamp","metadata"]
