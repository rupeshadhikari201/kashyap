from django.db import models
from django.conf import settings
from django.utils import timezone

class Applicant(models.Model):
    BACHELORS = 'Bachelors'
    MASTERS = 'Masters'
    PHD = 'Phd'
    
    COURSE_CHOICES = [
        (BACHELORS, 'Bachelors'),
        (MASTERS, 'Masters'),
        (PHD, 'PhD'),
    ]
    
    # Created by user 
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applicants'
    )
    
    # Personal Information
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    interested_course = models.CharField(max_length=20, choices=COURSE_CHOICES)
    
    # Address
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zipcode = models.CharField(max_length=20)
    street = models.TextField()
    
    # Test Score
    test_type = models.CharField(max_length=10)  # IELTS, PTE, TOEFL
    overall_score = models.DecimalField(max_digits=4, decimal_places=2)
    reading_score = models.DecimalField(max_digits=4, decimal_places=2)
    listening_score = models.DecimalField(max_digits=4, decimal_places=2)
    writing_score = models.DecimalField(max_digits=4, decimal_places=2)
    speaking_score = models.DecimalField(max_digits=4, decimal_places=2)
    attended_date = models.DateField()
    
    # Document (stored locally for now, will move to S3 later)
    document = models.FileField(upload_to='applicant_documents/', max_length=500)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'applicants'
        ordering = ['-created_at']
        verbose_name = 'Applicant'
        verbose_name_plural = 'Applicants'
    
    def __str__(self):
        return f"{self.full_name} - {self.interested_course}"


class Academic(models.Model):
    INTERMEDIATE = 'Intermediate'
    BACHELORS = 'Bachelors'
    MASTERS = 'Masters'
    
    DEGREE_LEVEL_CHOICES = [
        (INTERMEDIATE, 'Intermediate'),
        (BACHELORS, 'Bachelors'),
        (MASTERS, 'Masters'),
    ]
    
    applicant = models.ForeignKey(
        Applicant,
        on_delete=models.CASCADE,
        related_name='academics'
    )
    
    degree_level = models.CharField(max_length=20, choices=DEGREE_LEVEL_CHOICES)
    degree_title = models.CharField(max_length=255)
    institution = models.CharField(max_length=255)
    passed_year = models.CharField(max_length=4)
    course_start_date = models.DateField()
    course_end_date = models.DateField()
    obtained_mark = models.DecimalField(max_digits=5, decimal_places=2)
    
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        db_table = 'academics'
        ordering = ['degree_level', '-passed_year']
        verbose_name = 'Academic Record'
        verbose_name_plural = 'Academic Records'
    
    def __str__(self):
        return f"{self.applicant.full_name} - {self.degree_level}"