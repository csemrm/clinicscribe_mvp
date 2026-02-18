from django.contrib import admin
from .models import Clinic, User, Patient, Encounter, Document, Attachment, AuditEvent

@admin.register(Clinic)
class ClinicAdmin(admin.ModelAdmin):
    list_display = ("id", "name")

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "role", "clinic", "is_staff")
    search_fields = ("email",)

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "dob", "mrn", "clinic")
    search_fields = ("name", "mrn")

@admin.register(Encounter)
class EncounterAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "clinician", "visit_type", "occurred_at", "clinic")
    list_filter = ("clinic", "visit_type")

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "status", "encounter", "version", "created_by", "reviewed_by")
    list_filter = ("type", "status")

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("id", "encounter", "uploaded_by", "created_at")

@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("id", "document", "action", "actor", "from_status", "to_status", "timestamp")
    list_filter = ("action",)
