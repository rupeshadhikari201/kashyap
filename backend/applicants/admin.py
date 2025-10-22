from django.contrib import admin
from .models import Applicant, Academic


class AcademicInline(admin.TabularInline):
    model = Academic
    extra = 1
    fields = (
        'degree_level', 'degree_title', 'institution', 
        'passed_year', 'course_start_date', 'course_end_date', 'obtained_mark'
    )


@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = (
        'full_name', 'email', 'interested_course', 
        'test_type', 'overall_score', 'created_by', 'created_at'
    )
    list_filter = ('interested_course', 'test_type', 'country', 'created_at')
    search_fields = ('full_name', 'email', 'phone_number', 'created_by__full_name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Created By', {
            'fields': ('created_by',)
        }),
        ('Personal Information', {
            'fields': ('full_name', 'email', 'phone_number', 'interested_course')
        }),
        ('Address', {
            'fields': ('country', 'city', 'state', 'zipcode', 'street')
        }),
        ('Test Score', {
            'fields': (
                'test_type', 'overall_score', 'reading_score', 
                'listening_score', 'writing_score', 'speaking_score', 'attended_date'
            )
        }),
        ('Document', {
            'fields': ('document',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    inlines = [AcademicInline]
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('created_by')


@admin.register(Academic)
class AcademicAdmin(admin.ModelAdmin):
    list_display = (
        'applicant', 'degree_level', 'degree_title', 
        'institution', 'passed_year', 'obtained_mark'
    )
    list_filter = ('degree_level', 'passed_year')
    search_fields = ('applicant__full_name', 'degree_title', 'institution')
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Applicant', {
            'fields': ('applicant',)
        }),
        ('Degree Information', {
            'fields': (
                'degree_level', 'degree_title', 'institution', 
                'passed_year', 'obtained_mark'
            )
        }),
        ('Course Duration', {
            'fields': ('course_start_date', 'course_end_date')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('applicant')