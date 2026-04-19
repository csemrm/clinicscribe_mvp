from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from backend.core.models import AuditEvent, Attachment, Clinic, Document, Encounter, Patient, User


@admin.register(Clinic)
class ClinicAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "created_at")
    search_fields = ("name", "slug")


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (("Clinic", {"fields": ("clinic",)}),)
    list_display = BaseUserAdmin.list_display + ("clinic",)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "clinic", "last_name", "first_name", "mrn", "updated_at")
    search_fields = ("first_name", "last_name", "mrn", "external_id")
    list_filter = ("clinic",)


@admin.register(Encounter)
class EncounterAdmin(admin.ModelAdmin):
    list_display = ("id", "clinic", "patient", "status", "visit_date", "updated_at")
    list_filter = ("clinic", "status")
    search_fields = ("patient__first_name", "patient__last_name", "chief_complaint", "raw_notes")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "encounter", "kind", "status", "updated_at")
    list_filter = ("kind", "status")


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("id", "encounter", "filename", "created_at")


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("id", "clinic", "entity_type", "entity_id", "action", "created_at")
    list_filter = ("clinic", "entity_type", "action")
