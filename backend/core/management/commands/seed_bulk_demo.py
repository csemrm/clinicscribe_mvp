import random
import string
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Clinic, User, Patient, Encounter, Document, AuditEvent

FIRST_NAMES = ["Alex", "Jamie", "Taylor", "Jordan", "Sam", "Casey", "Riley", "Morgan", "Avery", "Cameron"]
LAST_NAMES = ["Lee", "Patel", "Nguyen", "Garcia", "Kim", "Smith", "Brown", "Lopez", "Chen", "Ali"]

VISIT_TYPES = ["Follow-up", "New patient", "Annual check", "Urgent visit", "Medication refill", "Telehealth"]

SAFE_RAW_NOTES = [
    "Patient reports improving symptoms since last visit. Reviewed medications and adherence.",
    "Discussed lifestyle changes, hydration, sleep hygiene. Vitals recorded. No acute distress noted.",
    "Reviewed history and ROS. Patient asked questions about next steps and follow-up timing.",
    "Provided education on self-care and when to return. Updated problem list and plan.",
]

FORM_TYPES = [
    Document.Type.FORM_PRIOR_AUTH,
    Document.Type.FORM_REFERRAL,
    Document.Type.FORM_EXCUSE,
    Document.Type.FORM_MED_NECESSITY,
]

def rword(n=6):
    return "".join(random.choices(string.ascii_lowercase, k=n))

def rand_dob(min_age=18, max_age=85):
    today = date.today()
    age = random.randint(min_age, max_age)
    # random day in that year range
    start = today - timedelta(days=365 * age + 364)
    end = today - timedelta(days=365 * age)
    return start + timedelta(days=random.randint(0, (end - start).days))

def fake_soap():
    return (
        "Subjective:\n"
        "- Patient reports follow-up concerns and general progress.\n\n"
        "Objective:\n"
        "- Vitals reviewed. General exam unremarkable.\n\n"
        "Assessment:\n"
        "- Documentation-only summary based on encounter notes.\n\n"
        "Plan:\n"
        "- Continue current plan, provide education, follow up as needed.\n"
    )

def fake_avs():
    return (
        "After-Visit Summary:\n"
        "- Thanks for coming in today.\n"
        "- We reviewed your concerns and discussed next steps.\n"
        "- Please follow the plan we discussed and schedule follow-up if needed.\n"
    )

def fake_form(form_type: str):
    titles = {
        Document.Type.FORM_PRIOR_AUTH: "Prior Authorization Request",
        Document.Type.FORM_REFERRAL: "Referral Letter",
        Document.Type.FORM_EXCUSE: "Work/School Excuse Note",
        Document.Type.FORM_MED_NECESSITY: "Medical Necessity Letter",
    }
    return f"{titles.get(form_type, 'Form')}\n\nThis is a demo draft for administrative documentation."

def fake_structured(form_type: str):
    # Minimal synthetic structured payload
    if form_type == Document.Type.FORM_PRIOR_AUTH:
        return {
            "medication_or_service": "Demo Service",
            "diagnosis_summary": "Demo summary (non-diagnostic)",
            "clinical_justification": "Demo justification for administrative purposes.",
            "requested_duration": "30 days",
        }
    if form_type == Document.Type.FORM_REFERRAL:
        return {"referred_to": "Demo Specialist", "reason_for_referral": "Demo reason", "pertinent_history": "Demo history"}
    if form_type == Document.Type.FORM_EXCUSE:
        return {"excuse_dates": "2026-02-17 to 2026-02-18", "limitations": "As tolerated"}
    if form_type == Document.Type.FORM_MED_NECESSITY:
        return {"service_or_device": "Demo device", "need_summary": "Demo need summary", "duration": "3 months"}
    return {}

class Command(BaseCommand):
    help = "Seed bulk synthetic demo data (patients/encounters/documents/audit) for ClinicScribe"

    def add_arguments(self, parser):
        parser.add_argument("--patients", type=int, default=200)
        parser.add_argument("--encounters", type=int, default=250)
        parser.add_argument("--documents", type=int, default=500)

    def handle(self, *args, **opts):
        random.seed(42)

        clinic, _ = Clinic.objects.get_or_create(name="Demo Clinic")

        admin, _ = User.objects.get_or_create(
            email="admin@demo.com",
            defaults={"role": User.Role.ADMIN, "clinic": clinic, "is_staff": True, "is_superuser": True},
        )
        if not admin.has_usable_password():
            admin.set_password("Passw0rd!")
            admin.save()

        clinician, _ = User.objects.get_or_create(
            email="clinician@demo.com",
            defaults={"role": User.Role.CLINICIAN, "clinic": clinic},
        )
        if not clinician.has_usable_password():
            clinician.set_password("Passw0rd!")
            clinician.save()

        patients_n = opts["patients"]
        encounters_n = opts["encounters"]
        documents_n = opts["documents"]

        self.stdout.write(self.style.WARNING("Seeding synthetic demo data (no real PHI)…"))

        patients = []
        for i in range(patients_n):
            name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
            mrn = f"MRN-{i:05d}"
            p = Patient.objects.create(
                clinic=clinic,
                name=name,
                dob=rand_dob(),
                mrn=mrn,
                phone=f"555-01{i%100:02d}-{i%10000:04d}",
                email=f"patient{i}@example.com",
                address=f"{random.randint(100,999)} {random.choice(['Oak','Pine','Maple','Cedar'])} St",
                context="Synthetic patient context for demo use only.",
            )
            patients.append(p)

        encounters = []
        now = timezone.now()
        for i in range(encounters_n):
            p = random.choice(patients)
            e = Encounter.objects.create(
                clinic=clinic,
                patient=p,
                clinician=clinician,
                visit_type=random.choice(VISIT_TYPES),
                occurred_at=now - timedelta(days=random.randint(0, 120), hours=random.randint(0, 23)),
                raw_notes=random.choice(SAFE_RAW_NOTES),
            )
            encounters.append(e)

        # Documents: mix SOAP/AVS/Forms with required workflow state & audit trail
        for i in range(documents_n):
            e = random.choice(encounters)
            doc_kind = random.choices(
                ["SOAP", "AVS", "FORM"],
                weights=[0.45, 0.25, 0.30],
                k=1
            )[0]

            if doc_kind == "SOAP":
                dtype = Document.Type.SOAP
                ai = fake_soap()
                structured = None
            elif doc_kind == "AVS":
                dtype = Document.Type.AVS
                ai = fake_avs()
                structured = None
            else:
                dtype = random.choice(FORM_TYPES)
                ai = fake_form(dtype)
                structured = fake_structured(dtype)

            # Random status distribution
            status_choice = random.choices(
                [Document.Status.DRAFT_AI, Document.Status.REVIEWED, Document.Status.FINAL],
                weights=[0.55, 0.30, 0.15],
                k=1
            )[0]

            doc = Document.objects.create(
                encounter=e,
                type=dtype,
                status=status_choice,
                ai_draft_text=ai,
                final_text=ai if status_choice == Document.Status.DRAFT_AI else ai + "\n\n(Edited by clinician)",
                structured_json=structured,
                version=1,
                created_by=clinician,
                reviewed_by=clinician if status_choice in [Document.Status.REVIEWED, Document.Status.FINAL] else None,
                reviewed_at=now if status_choice in [Document.Status.REVIEWED, Document.Status.FINAL] else None,
                finalized_at=now if status_choice == Document.Status.FINAL else None,
            )

            # Audit events
            AuditEvent.objects.create(
                document=doc,
                action=AuditEvent.Action.GENERATED,
                actor=clinician,
                from_status=None,
                to_status=Document.Status.DRAFT_AI,
                metadata={"seed": True},
            )
            if status_choice != Document.Status.DRAFT_AI:
                AuditEvent.objects.create(
                    document=doc,
                    action=AuditEvent.Action.EDITED,
                    actor=clinician,
                    from_status=Document.Status.DRAFT_AI,
                    to_status=Document.Status.DRAFT_AI,
                    metadata={"seed": True},
                )
                AuditEvent.objects.create(
                    document=doc,
                    action=AuditEvent.Action.SUBMIT_REVIEW,
                    actor=clinician,
                    from_status=Document.Status.DRAFT_AI,
                    to_status=Document.Status.REVIEWED,
                    metadata={"seed": True},
                )
                if status_choice == Document.Status.FINAL:
                    AuditEvent.objects.create(
                        document=doc,
                        action=AuditEvent.Action.FINALIZED,
                        actor=clinician,
                        from_status=Document.Status.REVIEWED,
                        to_status=Document.Status.FINAL,
                        metadata={"seed": True},
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Done. Created: {patients_n} patients, {encounters_n} encounters, {documents_n} documents (+ audits)."
        ))
