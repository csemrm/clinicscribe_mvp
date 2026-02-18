# Generated manually for MVP
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Clinic",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name="User",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, help_text="Designates that this user has all permissions without explicitly assigning them.", verbose_name="superuser status")),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("role", models.CharField(choices=[("ADMIN","ADMIN"),("CLINICIAN","CLINICIAN")], default="CLINICIAN", max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("is_staff", models.BooleanField(default=False)),
                ("date_joined", models.DateTimeField(default=django.utils.timezone.now)),
                ("clinic", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="users", to="core.clinic")),
                ("groups", models.ManyToManyField(blank=True, help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups")),
                ("user_permissions", models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions")),
            ],
            options={"abstract": False},
        ),
        migrations.CreateModel(
            name="Patient",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("dob", models.DateField()),
                ("mrn", models.CharField(blank=True, max_length=64, null=True)),
                ("phone", models.CharField(blank=True, max_length=64, null=True)),
                ("email", models.EmailField(blank=True, max_length=254, null=True)),
                ("address", models.TextField(blank=True, null=True)),
                ("context", models.TextField(blank=True, help_text="Medical history summary / patient context", null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("clinic", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="patients", to="core.clinic")),
            ],
        ),
        migrations.CreateModel(
            name="Encounter",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("visit_type", models.CharField(max_length=100)),
                ("occurred_at", models.DateTimeField()),
                ("raw_notes", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("clinic", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="encounters", to="core.clinic")),
                ("clinician", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="encounters", to="core.user")),
                ("patient", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="encounters", to="core.patient")),
            ],
        ),
        migrations.CreateModel(
            name="Document",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("type", models.CharField(choices=[("SOAP","SOAP"),("AVS","AVS"),("FORM_PRIOR_AUTH","FORM_PRIOR_AUTH"),("FORM_REFERRAL","FORM_REFERRAL"),("FORM_EXCUSE","FORM_EXCUSE"),("FORM_MED_NECESSITY","FORM_MED_NECESSITY")], max_length=40)),
                ("status", models.CharField(choices=[("DRAFT_AI","DRAFT_AI"),("REVIEWED","REVIEWED"),("FINAL","FINAL")], default="DRAFT_AI", max_length=20)),
                ("ai_draft_text", models.TextField(blank=True, null=True)),
                ("final_text", models.TextField(blank=True, null=True)),
                ("structured_json", models.JSONField(blank=True, null=True)),
                ("version", models.PositiveIntegerField(default=1)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("finalized_at", models.DateTimeField(blank=True, null=True)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="documents_created", to="core.user")),
                ("reviewed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="documents_reviewed", to="core.user")),
                ("encounter", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="documents", to="core.encounter")),
            ],
        ),
        migrations.CreateModel(
            name="Attachment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("file", models.FileField(upload_to="attachments/")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("encounter", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attachments", to="core.encounter")),
                ("uploaded_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="attachments_uploaded", to="core.user")),
            ],
        ),
        migrations.CreateModel(
            name="AuditEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("action", models.CharField(choices=[("GENERATED","GENERATED"),("EDITED","EDITED"),("SUBMIT_REVIEW","SUBMIT_REVIEW"),("FINALIZED","FINALIZED")], max_length=30)),
                ("from_status", models.CharField(blank=True, max_length=20, null=True)),
                ("to_status", models.CharField(blank=True, max_length=20, null=True)),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("metadata", models.JSONField(blank=True, null=True)),
                ("actor", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="audit_events", to="core.user")),
                ("document", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="audit_events", to="core.document")),
            ],
            options={"ordering": ["-timestamp"]},
        ),
    ]
