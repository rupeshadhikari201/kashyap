from django.urls import path
from .views import (ForgotPasswordView, 
                    RegisterView, 
                    ResetPasswordView, 
                    UpdateUserProfileView, 
                    VerifyEmailView, 
                    LoginView,
                    CurrentUserView,
                    ChangePasswordView,
                    )

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('login/', LoginView.as_view(), name='login'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<str:uidb64>/<str:token>/', ResetPasswordView.as_view(), name='reset-password'),
    path('update-profile/', UpdateUserProfileView.as_view(), name='update-profile'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
   
]