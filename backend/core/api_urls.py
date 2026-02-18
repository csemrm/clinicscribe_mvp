from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, MeView, PatientViewSet, EncounterViewSet, DocumentViewSet

router = DefaultRouter()
router.register("patients", PatientViewSet, basename="patients")
router.register("encounters", EncounterViewSet, basename="encounters")
router.register("documents", DocumentViewSet, basename="documents")

urlpatterns = [
    path("auth/register", RegisterView.as_view()),
    path("auth/login", LoginView.as_view()),
    path("auth/me", MeView.as_view()),
    path("", include(router.urls)),
]
