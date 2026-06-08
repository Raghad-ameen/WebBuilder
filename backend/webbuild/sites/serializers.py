from rest_framework import serializers
from .models import Website,UserSite,User
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_staff'] = self.user.is_staff
        data['username'] = self.user.username
        return data
    
    
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class WebsiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Website
        fields = '__all__'
        read_only_fields = ['owner']
        
        
        
        
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    
    
class UserSiteSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Website
        fields = [
            'id', 
            'name', 
            'user_username', 
            'is_active', 
            'created_at'
        ]