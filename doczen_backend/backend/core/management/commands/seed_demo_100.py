from __future__ import annotations

import random
from datetime import date, timedelta, datetime, time

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.db import transaction
from django.utils import timezone

from backend.core.models import Clinic, User, Patient, Encounter, Document, AuditEvent


FIRST_NAMES = [
    "John", "Jane", "Alex", "Ava", "Mia", "Noah", "Liam", "Emma", "Olivia", "Ethan",
    "Sophia", "Lucas", "Mason", "Isabella", "Amelia", "Elijah", "Charlotte", "James",
    "Benjamin", "Harper", "Evelyn", "Michael", "Daniel", "Henry", "Ella", "Grace",
    "Leo", "Nora", "Zoe", "Leo"
]

LAST_NAMES = [
    "Doe", "Smith", "Johnson", "Brown", "Williams", "Jones", "Miller", "Davis",
    "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas",
    "Moore", "Jackson", "Martin", "Lee", "Perez"
]

CHIEF_COMPLAINTS = [
    "headache and mild fever",
    "cough and nasal congestion",
    "abdominal pain after meals",
    "lower back pain",
    "fatigue and dizziness",
    "sore throat and cough",
    "follow-up for hypertension",
    "annual physical exam",
    "knee pain after exercise",
    "skin rash on arms",
]

SOAP_TEMPLATES = [
    "S: {cc}\nO: Vitals stable. No acute distress.\nA: Likely self-limited condition.\nP: Rest, hydration, OTC guidance, follow-up if worse.",
    "S: {cc}\nO: Exam limited but reassuring.\nA: Symptomatic presentation.\nP: Conservative management and return precautions.",
    "S: {cc}\nO: Mild symptoms observed.\nA: Low-risk outpatient issue.\nP: Supportive care and primary care follow-up.",
]

AVS_TEMPLATES = [
    "Follow the home care instructions. Drink fluids, rest, and return for worsening symptoms.",
    "Take medications only as directed. Seek care if fever persists or symptoms worsen.",
    "Monitor symptoms, keep hydrated, and follow up with your primary care clinician.",
]

FORM_TEMPLATES = [
    "Work note: Patient may return to work after symptoms improve.",
    "Referral form: Recommend primary care follow-up within 1-2 weeks.",
    "School note: Patient should rest at home until feeling better.",
]


class Command(BaseCommand):
    help = "Seed 100 demo patients with related encounters and documents for UI testing."

    def add_arguments(self, parser):
        parser.add_argument("--patients", type=int, default=100)
        parser.add_argument("--clinic-name", type=str, default="Doczen Clinic")
        parser.add_argument("--email", type=str, default="demo@doczen.com")
        parser.add_argument("--password", type=str, default="demo123")

    @transaction.atomic
    def handle(self, *args, **options):
        num_patients = options["patients"]
        clinic_name = options["clinic_name"]
        email = options["email"]
        password = options["password"]

        clinic, _ = Clinic.objects.get_or_create(name=clinic_name)

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "clinic": clinic,
                "password": make_password(password),
                "is_active": True,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if not created:
            user.clinic = clinic
            user.is_active = True
            user.is_staff = True
            user.is_superuser = True
            if not user.password:
                user.password = make_password(password)
            user.save()

        created_patients = 0
        created_encounters = 0
        created_documents = 0
        created_audits = 0

        today = date.today()

        for i in range(num_patients):
            first = FIRST_NAMES[i % len(FIRST_NAMES)]
            last = LAST_NAMES[i % len(LAST_NAMES)]
            date_of_birth = date(1945 + (i % 45), ((i % 12) + 1), ((i % 27) + 1))

            patient_external_id = f"demo-patient-{i+1:04d}"

            patient, p_created = Patient.objects.get_or_create(
                clinic=clinic,
                external_id=patient_external_id,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "date_of_birth": date_of_birth,
                    "mrn": f"MRN-{i+1:04d}",
                    "sex": random.choice(["female", "male", "other"]),
                    "notes": f"Demo patient #{i+1}",
                },
            )
            if p_created:
                created_patients += 1

            cc = CHIEF_COMPLAINTS[i % len(CHIEF_COMPLAINTS)]
            encounter_date = timezone.make_aware(datetime.combine(today - timedelta(days=i % 90), time.min))

            encounter, e_created = Encounter.objects.get_or_create(
                clinic=clinic,
                patient=patient,
                visit_date=encounter_date,
                defaults={
                    "raw_notes": f"Patient presents with {cc}. Demo encounter #{i+1}.",
                    "status": "open",
                },
            )
            if e_created:
                created_encounters += 1

            soap = SOAP_TEMPLATES[i % len(SOAP_TEMPLATES)].format(cc=cc)
            avs = AVS_TEMPLATES[i % len(AVS_TEMPLATES)]
            form = FORM_TEMPLATES[i % len(FORM_TEMPLATES)]

            for kind, content, title in [
                ("soap", soap, f"SOAP Note - {first} {last}"),
                ("avs", avs, f"AVS - {first} {last}"),
                ("form", form, f"Form - {first} {last}"),
            ]:
                doc, d_created = Document.objects.get_or_create(
                    encounter=encounter,
                    kind=kind,
                    defaults={
                        "status": "draft",
                        "content": content,
                        "title": title,
                    },
                )
                if d_created:
                    created_documents += 1

                AuditEvent.objects.get_or_create(
                    clinic=clinic,
                    actor=user,
                    entity_type="document",
                    entity_id=str(doc.id),
                    action="seed",
                    defaults={
                        "payload": {
                            "encounter_id": encounter.id,
                            "patient_id": patient.id,
                            "document_kind": kind,
                            "title": title,
                            "details": f"Seeded {kind.upper()} demo content for patient {patient.id}.",
                        },
                    },
                )
                created_audits += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seeded clinic='{clinic.name}' | patients={created_patients} "
            f"encounters={created_encounters} documents={created_documents} audits={created_audits}"
        ))
        self.stdout.write(self.style.SUCCESS(f"Demo login: {email} / {password}"))