from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()


class IsAdminOrDocumentationOfficer(permissions.BasePermission):
    """
    Permission to allow both admin and documentation officer to access
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_verified and
            request.user.role in [User.ADMIN, User.DOCUMENTATION_OFFICER]
        )


class IsAdminOrOwner(permissions.BasePermission):
    """
    Permission to allow admin to access all, and documentation officer to access only their own
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_verified
        )
    
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.role == User.ADMIN:
            return True
        
        # Documentation officer can only access their own applicants
        # For delete operation, only admin is allowed (handled in view)
        if request.method == 'DELETE':
            return False
        
        return obj.created_by == request.user


class IsAdmin(permissions.BasePermission):
    """
    Permission to allow only admin users
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_verified and
            request.user.role == User.ADMIN
        )