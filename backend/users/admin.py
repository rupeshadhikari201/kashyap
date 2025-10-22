from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'is_verified', 'is_staff', 'created_at')
    list_filter = ('is_verified', 'is_staff', 'is_superuser', 'created_at')
    search_fields = ('email', 'full_name', 'company_name', 'phone_no')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'company_name', 'phone_no', )}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_verified', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'company_name', 'phone_no', 'password1', 'password2', 'is_staff', 'is_superuser'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')