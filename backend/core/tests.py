from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from core.models import Clinic, User, Patient, Encounter, Document
from django.conf import settings

class BaseAPITest(TestCase):
    def setUp(self):
        self.clinic1 = Clinic.objects.create(name="Clinic One")
        self.clinic2 = Clinic.objects.create(name="Clinic Two")
        self.u1 = User.objects.create_user(email="u1@c1.com", password="Passw0rd!", clinic=self.clinic1, role=User.Role.CLINICIAN)
        self.u2 = User.objects.create_user(email="u2@c2.com", password="Passw0rd!", clinic=self.clinic2, role=User.Role.CLINICIAN)
        self.p1 = Patient.objects.create(clinic=self.clinic1, name="P1", dob="2000-01-01")
        self.p2 = Patient.objects.create(clinic=self.clinic2, name="P2", dob="2000-01-01")
        self.e1 = Encounter.objects.create(clinic=self.clinic1, patient=self.p1, clinician=self.u1, visit_type="Test", occurred_at=timezone.now(), raw_notes="notes")
        self.e2 = Encounter.objects.create(clinic=self.clinic2, patient=self.p2, clinician=self.u2, visit_type="Test", occurred_at=timezone.now(), raw_notes="notes")

        self.client1 = APIClient()
        res = self.client1.post("/api/auth/login", {"email": self.u1.email, "password": "Passw0rd!"}, format="json")
        self.client1.credentials(HTTP_AUTHORIZATION=f"Bearer {res.data['tokens']['access']}")

        self.client2 = APIClient()
        res2 = self.client2.post("/api/auth/login", {"email": self.u2.email, "password": "Passw0rd!"}, format="json")
        self.client2.credentials(HTTP_AUTHORIZATION=f"Bearer {res2.data['tokens']['access']}")

class ClinicIsolationTests(BaseAPITest):
    def test_patient_list_is_clinic_scoped(self):
        r = self.client1.get("/api/patients/")
        ids = [x["id"] for x in r.data]
        self.assertIn(self.p1.id, ids)
        self.assertNotIn(self.p2.id, ids)

    def test_encounter_retrieve_forbidden_cross_clinic(self):
        r = self.client1.get(f"/api/encounters/{self.e2.id}/")
        self.assertEqual(r.status_code, 404)

class DocumentWorkflowTests(BaseAPITest):
    def test_status_transitions(self):
        doc = Document.objects.create(encounter=self.e1, type=Document.Type.SOAP, created_by=self.u1, ai_draft_text="a", final_text="a")
        r = self.client1.post(f"/api/documents/{doc.id}/submit_review/")
        self.assertEqual(r.status_code, 200)
        doc.refresh_from_db()
        self.assertEqual(doc.status, Document.Status.REVIEWED)

        r2 = self.client1.post(f"/api/documents/{doc.id}/finalize/")
        self.assertEqual(r2.status_code, 200)
        doc.refresh_from_db()
        self.assertEqual(doc.status, Document.Status.FINAL)

    def test_cannot_finalize_without_review(self):
        doc = Document.objects.create(encounter=self.e1, type=Document.Type.SOAP, created_by=self.u1, ai_draft_text="a", final_text="a")
        r = self.client1.post(f"/api/documents/{doc.id}/finalize/")
        self.assertEqual(r.status_code, 400)

class GenerationEnqueueTests(BaseAPITest):
    def test_generate_enqueues_job(self):
        # Ensure returns a job_id and doesn't error
        r = self.client1.post(f"/api/encounters/{self.e1.id}/generate_soap/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("job_id", r.data)
