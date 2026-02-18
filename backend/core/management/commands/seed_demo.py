from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import Clinic, User, Patient, Encounter

class Command(BaseCommand):
    help = "Seed demo data for ClinicScribe MVP"

    def handle(self, *args, **options):
        clinic, _ = Clinic.objects.get_or_create(name="Demo Clinic")
        admin, _ = User.objects.get_or_create(email="admin@demo.com", defaults={"role": User.Role.ADMIN, "clinic": clinic, "is_staff": True})
        if not admin.has_usable_password():
            admin.set_password("Passw0rd!")
            admin.save()

        clinician, _ = User.objects.get_or_create(email="clinician@demo.com", defaults={"role": User.Role.CLINICIAN, "clinic": clinic})
        if not clinician.has_usable_password():
            clinician.set_password("Passw0rd!")
            clinician.save()

        p, _ = Patient.objects.get_or_create(clinic=clinic, name="Jane Doe", dob="1990-01-02", defaults={"mrn": "MRN-001", "context": "History of hypertension. No known drug allergies."})
        Encounter.objects.get_or_create(
            clinic=clinic,
            patient=p,
            clinician=clinician,
            visit_type="Follow-up",
            occurred_at=timezone.now(),
            defaults={"raw_notes": "Patient reports mild headache. Vitals taken. Discussed lifestyle changes. No suicidal ideation."}
        )
        self.stdout.write(self.style.SUCCESS("Seeded demo data."))
