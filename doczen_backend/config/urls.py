from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from backend.core.views import LoginView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("backend.core.urls")),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
