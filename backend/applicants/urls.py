from django.urls import path
from .views import ApplicantListCreateView, ApplicantDetailView, AnalyticsView

urlpatterns = [
    # List all applicants and create new applicant
    path('', ApplicantListCreateView.as_view(), name='applicant-list-create'),
    
    # Retrieve, update, delete specific applicant
    path('<int:pk>/', ApplicantDetailView.as_view(), name='applicant-detail'),

     path('analytics/', AnalyticsView.as_view(), name='analytics'),
]