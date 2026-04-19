from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class Clinic(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.name


class User(AbstractUser):
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name="users", null=True, blank=True)


class Patient(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name="patients")
    external_id = models.CharField(max_length=64, blank=True, default="")
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    sex = models.CharField(max_length=32, blank=True, default="")
    mrn = models.CharField(max_length=64, blank=True, default="")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("clinic", "external_id")
        ordering = ["-updated_at", "-id"]

    def __str__(self) -> str:
        return f"{self.last_name}, {self.first_name}"


class Encounter(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_REVIEW = "in_review", "In review"
        FINAL = "final", "Final"

    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name="encounters")
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="encounters")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_encounters")
    visit_date = models.DateTimeField(default=timezone.now)
    chief_complaint = models.CharField(max_length=255, blank=True, default="")
    raw_notes = models.TextField(blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    red_flags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-visit_date", "-id"]


class Document(models.Model):
    class Kind(models.TextChoices):
        SOAP = "soap", "SOAP"
        AVS = "avs", "AVS"
        FORM = "form", "FORM"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        IN_REVIEW = "in_review", "In review"
        FINAL = "final", "Final"

    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name="documents")
    kind = models.CharField(max_length=20, choices=Kind.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, default="")
    content_json = models.JSONField(default=dict, blank=True)
    review_notes = models.TextField(blank=True, default="")
    finalized_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("encounter", "kind")
        ordering = ["-updated_at", "-id"]


class Attachment(models.Model):
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="attachments/%Y/%m/%d/")
    filename = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="uploaded_attachments")
    created_at = models.DateTimeField(auto_now_add=True)


class AuditEvent(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name="audit_events")
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_events")
    entity_type = models.CharField(max_length=50)
    entity_id = models.CharField(max_length=64)
    action = models.CharField(max_length=50)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]
