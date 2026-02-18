from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class Clinic(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("role", User.Role.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = "ADMIN"
        CLINICIAN = "CLINICIAN"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLINICIAN)
    clinic = models.ForeignKey(Clinic, on_delete=models.PROTECT, related_name="users", null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = "email"
    objects = UserManager()

    def __str__(self):
        return self.email

class Patient(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name="patients")
    name = models.CharField(max_length=255)
    dob = models.DateField()
    mrn = models.CharField(max_length=64, blank=True, null=True)
    phone = models.CharField(max_length=64, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    context = models.TextField(blank=True, null=True, help_text="Medical history summary / patient context")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Encounter(models.Model):
    clinic = models.ForeignKey(Clinic, on_delete=models.CASCADE, related_name="encounters")
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="encounters")
    clinician = models.ForeignKey(User, on_delete=models.PROTECT, related_name="encounters")
    visit_type = models.CharField(max_length=100)
    occurred_at = models.DateTimeField()
    raw_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Document(models.Model):
    class Type(models.TextChoices):
        SOAP = "SOAP"
        AVS = "AVS"
        FORM_PRIOR_AUTH = "FORM_PRIOR_AUTH"
        FORM_REFERRAL = "FORM_REFERRAL"
        FORM_EXCUSE = "FORM_EXCUSE"
        FORM_MED_NECESSITY = "FORM_MED_NECESSITY"

    class Status(models.TextChoices):
        DRAFT_AI = "DRAFT_AI"
        REVIEWED = "REVIEWED"
        FINAL = "FINAL"

    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name="documents")
    type = models.CharField(max_length=40, choices=Type.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT_AI)

    ai_draft_text = models.TextField(blank=True, null=True)
    final_text = models.TextField(blank=True, null=True)
    structured_json = models.JSONField(blank=True, null=True)

    version = models.PositiveIntegerField(default=1)

    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="documents_created")
    reviewed_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="documents_reviewed", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    finalized_at = models.DateTimeField(null=True, blank=True)

class Attachment(models.Model):
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="attachments/")
    uploaded_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="attachments_uploaded")
    created_at = models.DateTimeField(auto_now_add=True)

class AuditEvent(models.Model):
    class Action(models.TextChoices):
        GENERATED = "GENERATED"
        EDITED = "EDITED"
        SUBMIT_REVIEW = "SUBMIT_REVIEW"
        FINALIZED = "FINALIZED"

    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="audit_events")
    action = models.CharField(max_length=30, choices=Action.choices)
    actor = models.ForeignKey(User, on_delete=models.PROTECT, related_name="audit_events")
    from_status = models.CharField(max_length=20, blank=True, null=True)
    to_status = models.CharField(max_length=20, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ["-timestamp"]
