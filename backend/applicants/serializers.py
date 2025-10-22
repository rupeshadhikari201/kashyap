from rest_framework import serializers
from .models import Applicant, Academic
import json


class AcademicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Academic
        fields = [
            'id',
            'degree_level',
            'degree_title',
            'institution',
            'passed_year',
            'course_start_date',
            'course_end_date',
            'obtained_mark',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ApplicantSerializer(serializers.ModelSerializer):
    academics = AcademicSerializer(many=True, read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    document_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Applicant
        fields = [
            'id',
            'created_by',
            'created_by_email',
            'created_by_name',
            
            # Personal Info
            'full_name',
            'email',
            'phone_number',
            'interested_course',
            
            # Address
            'country',
            'city',
            'state',
            'zipcode',
            'street',
            
            # Test Score
            'test_type',
            'overall_score',
            'reading_score',
            'listening_score',
            'writing_score',
            'speaking_score',
            'attended_date',
            
            # Document
            'document',
            'document_url',
            
            # Academics
            'academics',
            
            # Timestamps
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'document_url']
    
    def get_document_url(self, obj):
        if obj.document:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.document.url)
            return obj.document.url
        return None


class ApplicantCreateSerializer(serializers.ModelSerializer):
    academics = serializers.JSONField(write_only=True)
    document = serializers.FileField(required=True)
    
    class Meta:
        model = Applicant
        fields = [
            # Personal Info
            'full_name',
            'email',
            'phone_number',
            'interested_course',
            
            # Address
            'country',
            'city',
            'state',
            'zipcode',
            'street',
            
            # Test Score
            'test_type',
            'overall_score',
            'reading_score',
            'listening_score',
            'writing_score',
            'speaking_score',
            'attended_date',
            
            # Document
            'document',
            
            # Academics
            'academics',
        ]
    
    # field-level validation for document
    def validate_document(self, value):
        # Validate file type
        if not value.name.endswith('.pdf'):
            raise serializers.ValidationError("Only PDF files are allowed")
        
        # Validate file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size must be less than 10MB")
        
        return value

    # field-level validation for academics
    def validate_academics(self, value):
        # Parse JSON if it's a string
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Invalid JSON format for academics")
        
        # Validate that it's a list
        if not isinstance(value, list):
            raise serializers.ValidationError("Academics must be a list")
        
        # Validate that at least one academic record exists
        if len(value) < 1:
            raise serializers.ValidationError("At least one academic record is required")
        
        # Validate each academic record
        required_fields = [
            'degree_level', 'degree_title', 'institution', 
            'passed_year', 'course_start_date', 'course_end_date', 'obtained_mark'
        ]
        
        for idx, academic in enumerate(value):
            for field in required_fields:
                if field not in academic or not academic[field]:
                    raise serializers.ValidationError(
                        f"Academic record {idx + 1}: {field} is required"
                    )
        
        return value
    
    # object-level validation (object level attrs contains all fields)
    def validate(self, attrs):
        email = attrs.get('email')
        if Applicant.objects.filter(email=email).exists():
            raise serializers.ValidationError("An applicant with this email already exists.")
        return attrs


    def create(self, validated_data):

        # check if email already exists in Applicant model
        email = validated_data.get('email')
        if Applicant.objects.filter(email=email).exists():
            raise serializers.ValidationError("An applicant with this email already exists.")

        academics_data = validated_data.pop('academics')
        
        # Get the authenticated user from context
        user = self.context['request'].user
        
        # Create applicant
        applicant = Applicant.objects.create(
            created_by=user,
            **validated_data
        )
        
        # Create academic records
        for academic_data in academics_data:
            Academic.objects.create(
                applicant=applicant,
                **academic_data
            )
        
        return applicant


class ApplicantUpdateSerializer(serializers.ModelSerializer):
    academics = serializers.JSONField(write_only=True, required=False)
    document = serializers.FileField(required=False)
    
    class Meta:
        model = Applicant
        fields = [
            
            # Personal Info
            'full_name',
            'email',
            'phone_number',
            'interested_course',
            
            # Address
            'country',
            'city',
            'state',
            'zipcode',
            'street',
            
            # Test Score
            'test_type',
            'overall_score',
            'reading_score',
            'listening_score',
            'writing_score',
            'speaking_score',
            'attended_date',
            
            # Document
            'document',
            
            # Academics
            'academics',
        ]
    
    def validate_document(self, value):
        if value:
            # Validate file type
            if not value.name.endswith('.pdf'):
                raise serializers.ValidationError("Only PDF files are allowed")
            
            # Validate file size (max 10MB)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size must be less than 10MB")
        
        return value
    
    def validate_academics(self, value):
        if value:
            # Parse JSON if it's a string
            if isinstance(value, str):
                try:
                    value = json.loads(value)
                except json.JSONDecodeError:
                    raise serializers.ValidationError("Invalid JSON format for academics")
            
            # Validate that it's a list
            if not isinstance(value, list):
                raise serializers.ValidationError("Academics must be a list")
            
            # Validate that at least one academic record exists
            if len(value) < 1:
                raise serializers.ValidationError("At least one academic record is required")
        
        return value
    
    def update(self, instance, validated_data):
        academics_data = validated_data.pop('academics', None)
        
        # Update applicant fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update academic records if provided
        if academics_data is not None:
            # Delete existing academic records
            instance.academics.all().delete()
            
            # Create new academic records
            for academic_data in academics_data:
                Academic.objects.create(
                    applicant=instance,
                    **academic_data
                )
        
        return instance