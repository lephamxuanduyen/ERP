from django.contrib.auth.models import User, Group
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSerializer(serializers.ModelSerializer):
    groups = serializers.SlugRelatedField(
        queryset=Group.objects.all(),
        slug_field='name',
        many=True,
        required=False
    )
    
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'last_name', 'first_name', 'email', 'groups']
        extra_kwargs = {'password': {"write_only": True}}
        
    def create(self, validated_data):
        groups_data = validated_data.pop('groups', [])
        user = User.objects.create_user(**validated_data)
        # user.groups.set(groups_data)
        for group in groups_data: 
            user.groups.add(group)
        return user
    
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['groups'] = list(user.groups.values_list('name', flat=True))
        return token
        