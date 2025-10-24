from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate, get_user_model
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from users.utils import send_sendgrid_mail  

from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer,
    UserSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate verification token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create verification URL
            frontend_url = settings.FRONTEND_URL
            verification_url = f"{frontend_url}/verify-email/{uid}/{token}/"
            
            # Send verification email
            subject = 'Verify Your Email'
            message = f'''
            Hello {user.full_name},
            
            Thank you for registering. Please verify your email by clicking the link below:
            
            {verification_url}
            
            This link will expire in 24 hours.
            
            If you didn't create this account, please ignore this email.
            
            Best regards,
            Team
            '''
            sent = send_sendgrid_mail(user.email, subject, message)
            if not sent:
                return Response(
                    {'error': 'User created but failed to send verification email. Please contact support.'},
                    status=status.HTTP_201_CREATED
                )
            
            return Response(
                {
                    'message': 'Registration successful. Please check your email to verify your account.',
                    'email': user.email
                },
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateUserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'message': 'Profile updated successfully',
                    'user': UserSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, uidb64, token):
        try:
            print(token)
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Invalid verification link'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user.is_verified:
            return Response(
                {'message': 'Email already verified. Please login.'},
                status=status.HTTP_200_OK
            )
        
        if default_token_generator.check_token(user, token):
            user.is_verified = True
            user.save()
            return Response(
                {'message': 'Email verified successfully. You can now login.'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Invalid or expired verification link'},
                status=status.HTTP_400_BAD_REQUEST
            )


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            user = authenticate(request, username=email, password=password)
            
            if user is not None:
                if not user.is_verified:
                    return Response(
                        {'error': 'Please verify your email before logging in.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'message': 'Login successful',
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Invalid email or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Return success message even if user doesn't exist (security best practice)
                return Response(
                    {'message': 'If an account exists with this email, a password reset link has been sent.'},
                    status=status.HTTP_200_OK
                )
            
            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Create password reset URL
            frontend_url = settings.FRONTEND_URL
            reset_url = f"{frontend_url}/reset-password/{uid}/{token}/"
            
            # Send password reset email
            subject = 'Password Reset Request'
            message = f'''
            Hello {user.full_name},
            
            We received a request to reset your password. Click the link below to create a new password:
            
            {reset_url}
            
            This link will expire in 24 hours.
            
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            
            Best regards,
            Team
            '''
            
            sent = send_sendgrid_mail(user.email, subject, message)
            if not sent:
                return Response(
                    {'error': 'Error Sending Password reset Request. Please contact support.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response(
                {'message': 'If an account exists with this email, a password reset link has been sent.'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    authentication_classes = [] # no csrf
    permission_classes = [AllowAny]
    
    def post(self, request, uidb64, token):
        # print(request.data, uidb64, token)
        serializer = ResetPasswordSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            print(serializer.data)
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response(
                    {'error': 'Invalid password reset link'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'error': 'Invalid or expired password reset link'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            new_password = serializer.validated_data['password']
            user.set_password(new_password)
            user.save()
            
            # Send confirmation email
            subject = 'Password Reset Successful'
            message = f'''
            Hello {user.full_name},
            
            Your password has been successfully reset.
            
            If you did not make this change, please contact support immediately.
            
            Best regards,
            Team
            '''
            sent = send_sendgrid_mail(user.email, subject, message)
            if not sent:
                return Response(
                    {'error': 'Error sending password reset sucessfull message. Please contact support.'},
                    status=status.HTTP_201_CREATED
                )
            
            return Response(
                {'message': 'Password has been reset successfully. You can now login with your new password.'},
                status=status.HTTP_200_OK
            )
        print(serializer.errors )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class CurrentUserView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        """Return the user attached to the incoming token."""
        return self.request.user
    

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        print(new_password, confirm_password, 'new and confirm password')

        # check if current password is correct
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # check if new password is same as current password
        if current_password == new_password:
            return Response(
                {'error': 'New password cannot be the same as the current password'},
                status=status.HTTP_400_BAD_REQUEST
            )  
        
        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )
    

