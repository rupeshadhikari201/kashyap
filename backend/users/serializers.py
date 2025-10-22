from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'full_name', 'company_name', 'phone_no',  'password', 'confirm_password')
        extra_kwargs = {
            'full_name': {'required': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password'],
            company_name=validated_data.get('company_name', ''),
            phone_no=validated_data.get('phone_no', '')
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'company_name', 'phone_no', 'is_verified', 'created_at')
        read_only_fields = ('id', 'is_verified', 'created_at')


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    # uidb64 and token will be passed via URL, not in the serializer data   
    # can i print atters here

    def validate(self, attrs):
        print(attrs, 'attrs in reset serializer')
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'is_verified']   # whatever you need