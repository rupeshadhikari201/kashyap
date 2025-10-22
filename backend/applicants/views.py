from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Applicant, Academic
from .serializers import (
    ApplicantSerializer,
    ApplicantCreateSerializer,
    ApplicantUpdateSerializer
)
from django.utils import timezone

# from .permissions import IsAdminOrDocumentationOfficer, IsAdminOrOwner

User = get_user_model()


class ApplicantListCreateView(APIView):
    """
    GET: List all applicants (with filtering based on user role)
    POST: Create a new applicant
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        """List all applicants"""
        user = request.user

        applicants = Applicant.objects.all()
       
        # Optional filtering by query params
        interested_course = request.query_params.get('interested_course')
        if interested_course:
            applicants = applicants.filter(interested_course=interested_course)
        
        search = request.query_params.get('search')
        if search:
            applicants = applicants.filter(
                full_name__icontains=search
            ) | applicants.filter(
                email__icontains=search
            )
        
        serializer = ApplicantSerializer(
            applicants,
            many=True,
            context={'request': request}
        )
        
        return Response({
            'count': applicants.count(),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new applicant"""
        serializer = ApplicantCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            applicant = serializer.save()
            
            # Return the created applicant with all details
            response_serializer = ApplicantSerializer(
                applicant,
                context={'request': request}
            )
            
            return Response(
                {
                    'message': 'Applicant created successfully',
                    'data': response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        
        print(serializer.errors, 'errors in applicant creation')
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ApplicantDetailView(APIView):
    """
    GET: Retrieve a single applicant
    PUT/PATCH: Update an applicant
    DELETE: Delete an applicant
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_object(self, pk, user):
        """Get applicant object with permission check"""
        applicant = get_object_or_404(Applicant, pk=pk)
        
        return applicant
    
    def get(self, request, pk):
        """Retrieve applicant details"""
        applicant = self.get_object(pk, request.user)
        
        if not applicant:
            return Response(
                {'error': 'You do not have permission to view this applicant'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ApplicantSerializer(
            applicant,
            context={'request': request}
        )
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk):
        """Update applicant (full update)"""
        applicant = self.get_object(pk, request.user)
        
        if not applicant:
            return Response(
                {'error': 'You do not have permission to update this applicant'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ApplicantUpdateSerializer(
            applicant,
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            updated_applicant = serializer.save()
            
            response_serializer = ApplicantSerializer(
                updated_applicant,
                context={'request': request}
            )
            
            return Response(
                {
                    'message': 'Applicant updated successfully',
                    'data': response_serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        """Partially update applicant"""
        applicant = self.get_object(pk, request.user)
        
        if not applicant:
            return Response(
                {'error': 'You do not have permission to update this applicant'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ApplicantUpdateSerializer(
            applicant,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            updated_applicant = serializer.save()
            
            response_serializer = ApplicantSerializer(
                updated_applicant,
                context={'request': request}
            )
            
            return Response(
                {
                    'message': 'Applicant updated successfully',
                    'data': response_serializer.data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete applicant"""
        user = request.user

        
        applicant = get_object_or_404(Applicant, pk=pk)
        
        # Delete the document file if it exists
        if applicant.document:
            applicant.document.delete()
        
        applicant.delete()
        
        return Response(
            {'message': 'Applicant deleted successfully'},
            status=status.HTTP_200_OK
        )
    
class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        start_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        total = Applicant.objects.count()
        this_month = Applicant.objects.filter(created_at__gte=start_this_month).count()

        completed = 0
        pending = total - completed  

        return Response(
            {
                "total_applicants": total,
                "this_month": this_month,
                "completed_applications": completed,
                "pending_applications": pending,
            }
        )