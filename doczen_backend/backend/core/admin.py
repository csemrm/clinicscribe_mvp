from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html

from backend.core.models import AuditEvent, Attachment, Clinic, Document, Encounter, Patient, User


@admin.register(Clinic)
class ClinicAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug", "created_at")
    search_fields = ("name", "slug")
    ordering = ("name",)
    list_per_page = 25
    readonly_fields = ("created_at",)
    fieldsets = (
        (None, {"fields": ("name", "slug")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "clinic", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active", "clinic")
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("username",)
    list_select_related = ("clinic",)
    autocomplete_fields = ("clinic",)
    fieldsets = BaseUserAdmin.fieldsets + (("Clinic", {"fields": ("clinic",)}),)


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "clinic", "patient_name", "mrn", "external_id", "updated_at")
    search_fields = ("first_name", "last_name", "mrn", "external_id")
    list_filter = ("clinic",)
    ordering = ("last_name", "first_name")
    list_per_page = 25
    autocomplete_fields = ("clinic",)
    readonly_fields = ("updated_at",)
    fieldsets = (
        ("Patient", {"fields": ("clinic", "first_name", "last_name", "mrn", "external_id")}),
        ("Timestamps", {"fields": ("updated_at",)}),
    )

    @admin.display(description="Patient name", ordering="last_name")
    def patient_name(self, obj):
        return f"{obj.last_name}, {obj.first_name}"


@admin.register(Encounter)
class EncounterAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "clinic",
        "patient",
        "status_badge",
        "visit_date",
        "updated_at",
    )
    list_filter = ("clinic", "status", "visit_date")
    search_fields = ("patient__first_name", "patient__last_name", "chief_complaint", "raw_notes")
    ordering = ("-visit_date", "-updated_at")
    list_select_related = ("clinic", "patient")
    autocomplete_fields = ("clinic", "patient")
    date_hierarchy = "visit_date"
    readonly_fields = ("updated_at",)
    fieldsets = (
        ("Encounter", {"fields": ("clinic", "patient", "status", "visit_date", "chief_complaint", "raw_notes")}),
        ("Timestamps", {"fields": ("updated_at",)}),
    )

    @admin.display(description="Status")
    def status_badge(self, obj):
        palette = {
            "draft": "#f59e0b",
            "review": "#38bdf8",
            "final": "#22c55e",
            "archived": "#64748b",
        }
        color = palette.get((obj.status or "").lower(), "#94a3b8")
        label = (obj.status or "unknown").replace("_", " ").title()
        return format_html(
            '<span style="display:inline-flex;align-items:center;padding:0.25rem 0.65rem;border-radius:999px;background:{}20;color:{};font-size:12px;font-weight:700;">{}</span>',
            color,
            color,
            label,
        )


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "document_patient", "document_clinic", "document_visit_date", "kind_badge", "status_badge", "updated_at")
    list_filter = ("kind", "status", "encounter__clinic")
    search_fields = (
        "encounter__patient__first_name",
        "encounter__patient__last_name",
        "encounter__clinic__name",
        "encounter__clinic__slug",
        "kind",
        "status",
    )
    ordering = ("-updated_at",)
    list_select_related = ("encounter", "encounter__patient", "encounter__clinic")
    autocomplete_fields = ("encounter",)
    readonly_fields = ("updated_at",)
    fieldsets = (
        ("Document", {"fields": ("encounter", "kind", "status")}),
        ("Related Info", {"fields": ("document_patient", "document_clinic", "document_visit_date")}),
        ("Timestamps", {"fields": ("updated_at",)}),
    )

    @admin.display(description="Patient", ordering="encounter__patient__last_name")
    def document_patient(self, obj):
        patient = getattr(obj.encounter, "patient", None)
        if not patient:
            return "-"
        return f"{patient.last_name}, {patient.first_name}"

    @admin.display(description="Clinic", ordering="encounter__clinic__name")
    def document_clinic(self, obj):
        clinic = getattr(obj.encounter, "clinic", None)
        if not clinic:
            return "-"
        return clinic.name

    @admin.display(description="Visit date", ordering="encounter__visit_date")
    def document_visit_date(self, obj):
        encounter = getattr(obj, "encounter", None)
        if not encounter or not encounter.visit_date:
            return "-"
        return encounter.visit_date

    @admin.display(description="Kind")
    def kind_badge(self, obj):
        kind = (obj.kind or "unknown").replace("_", " ").title()
        return format_html(
            '<span style="display:inline-flex;align-items:center;padding:0.25rem 0.65rem;border-radius:999px;background:#2563eb20;color:#2563eb;font-size:12px;font-weight:700;">{}</span>',
            kind,
        )

    @admin.display(description="Status")
    def status_badge(self, obj):
        palette = {
            "draft": "#f59e0b",
            "review": "#38bdf8",
            "final": "#22c55e",
            "archived": "#64748b",
        }
        color = palette.get((obj.status or "").lower(), "#94a3b8")
        label = (obj.status or "unknown").replace("_", " ").title()
        return format_html(
            '<span style="display:inline-flex;align-items:center;padding:0.25rem 0.65rem;border-radius:999px;background:{}20;color:{};font-size:12px;font-weight:700;">{}</span>',
            color,
            color,
            label,
        )


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("id", "attachment_patient", "attachment_clinic", "attachment_visit_date", "filename", "created_at")
    list_filter = ("encounter__clinic",)
    search_fields = (
        "filename",
        "encounter__patient__first_name",
        "encounter__patient__last_name",
        "encounter__clinic__name",
        "encounter__clinic__slug",
    )
    ordering = ("-created_at",)
    list_select_related = ("encounter", "encounter__patient", "encounter__clinic")
    autocomplete_fields = ("encounter",)
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Attachment", {"fields": ("encounter", "filename")}),
        ("Related Info", {"fields": ("attachment_patient", "attachment_clinic", "attachment_visit_date")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )

    @admin.display(description="Patient", ordering="encounter__patient__last_name")
    def attachment_patient(self, obj):
        patient = getattr(obj.encounter, "patient", None)
        if not patient:
            return "-"
        return f"{patient.last_name}, {patient.first_name}"

    @admin.display(description="Clinic", ordering="encounter__clinic__name")
    def attachment_clinic(self, obj):
        clinic = getattr(obj.encounter, "clinic", None)
        if not clinic:
            return "-"
        return clinic.name

    @admin.display(description="Visit date", ordering="encounter__visit_date")
    def attachment_visit_date(self, obj):
        encounter = getattr(obj, "encounter", None)
        if not encounter or not encounter.visit_date:
            return "-"
        return encounter.visit_date


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("id", "clinic", "entity_type", "entity_id", "action_badge", "created_at")
    list_filter = ("clinic", "entity_type", "action")
    search_fields = ("entity_type", "entity_id", "action")
    ordering = ("-created_at",)
    list_select_related = ("clinic",)
    autocomplete_fields = ("clinic",)
    readonly_fields = ("created_at",)
    fieldsets = (
        ("Event", {"fields": ("clinic", "entity_type", "entity_id", "action")}),
        ("Timestamps", {"fields": ("created_at",)}),
    )

    @admin.display(description="Action")
    def action_badge(self, obj):
        color = "#2563eb"
        if (obj.action or "").lower() in {"delete", "archive"}:
            color = "#dc2626"
        elif (obj.action or "").lower() in {"finalize", "export"}:
            color = "#16a34a"
        label = (obj.action or "unknown").replace("_", " ").title()
        return format_html(
            '<span style="display:inline-flex;align-items:center;padding:0.25rem 0.65rem;border-radius:999px;background:{}20;color:{};font-size:12px;font-weight:700;">{}</span>',
            color,
            color,
            label,
        )
