from django.urls import path, include
from rest_framework.routers import DefaultRouter

from backend.core.views import DocumentViewSet, EncounterViewSet, MeView, PatientViewSet, RegisterView

router = DefaultRouter()
router.register(r"patients", PatientViewSet, basename="patient")
router.register(r"encounters", EncounterViewSet, basename="encounter")
router.register(r"documents", DocumentViewSet, basename="document")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("", include(router.urls)),
]
