from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import User

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)

class IsClinicMember(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.clinic_id is not None)
