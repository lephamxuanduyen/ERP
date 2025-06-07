from rest_framework import generics
from django.contrib.auth.models import User
from ..serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework.permissions import AllowAny, DjangoModelPermissions
from rest_framework_simplejwt.views import TokenObtainPairView

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    

class DeleteUser(generics.DestroyAPIView):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    
    

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer