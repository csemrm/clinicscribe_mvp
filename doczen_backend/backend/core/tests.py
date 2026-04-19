from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from backend.core.models import Clinic, Document, Encounter, Patient

User = get_user_model()


class DoczenAPITestCase(APITestCase):
    def setUp(self):
        self.clinic = Clinic.objects.create(name="Doczen Clinic", slug="doczen-clinic")
        self.user = User.objects.create_user(username="docuser", password="pass12345", clinic=self.clinic)
        refresh = RefreshToken.for_user(self.user)
        self.access = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        self.patient = Patient.objects.create(clinic=self.clinic, first_name="Jane", last_name="Doe")

    def test_me(self):
        resp = self.client.get(reverse("me"))
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["username"], "docuser")

    def test_create_patient(self):
        resp = self.client.post(reverse("patient-list"), {"first_name": "John", "last_name": "Smith"}, format="json")
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Patient.objects.count(), 2)

    def test_create_encounter_and_generate_document(self):
        resp = self.client.post(
            reverse("encounter-list"),
            {"patient": self.patient.id, "chief_complaint": "follow-up", "raw_notes": "Patient reports severe chest pain."},
            format="json",
        )
        self.assertEqual(resp.status_code, 201)
        encounter_id = resp.data["id"]
        gen = self.client.post(reverse("encounter-generate-soap", args=[encounter_id]), {"prompt": "use SOAP"}, format="json")
        self.assertEqual(gen.status_code, 201)
        doc = Document.objects.get(id=gen.data["id"])
        self.assertIn("Subjective", doc.content)
        self.assertTrue(doc.content_json.get("red_flags"))

    def test_finalize_and_pdf_gate(self):
        encounter = Encounter.objects.create(clinic=self.clinic, patient=self.patient, created_by=self.user, raw_notes="notes")
        doc = Document.objects.create(encounter=encounter, kind=Document.Kind.SOAP, title="SOAP Note", content="hello")
        finalize = self.client.post(reverse("document-finalize", args=[doc.id]), {"confirm": True}, format="json")
        self.assertEqual(finalize.status_code, 200)
        pdf = self.client.get(reverse("document-export-pdf", args=[doc.id]))
        self.assertEqual(pdf.status_code, 200)
        self.assertEqual(pdf["Content-Type"], "application/pdf")
