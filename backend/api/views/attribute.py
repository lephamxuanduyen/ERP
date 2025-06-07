from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.pagination import LimitOffsetPagination
from ..serializers import AttributeSerializer, AttributeValueSerializer
from ..models import Attribute, AttributeValue


class AttributeListCreate(generics.ListCreateAPIView):
    serializer_class = AttributeSerializer
    pagination_class = LimitOffsetPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        name = self.request.query_params.get('name')
        if name:
            return Attribute.objects.filter(att_name__icontains=name)
        return Attribute.objects.prefetch_related('values').all()
    

class AttributeDetail(generics.RetrieveAPIView):
    serializer_class = AttributeSerializer
    permission_classes = [AllowAny]
    queryset = Attribute.objects.all()
    

class AttributeUpdate(generics.UpdateAPIView):
    serializer_class = AttributeSerializer
    permission_classes = [AllowAny]
    queryset = Attribute.objects.all()
    
    
class AttributeDelete(generics.DestroyAPIView):
    serializer_class = AttributeSerializer
    queryset = Attribute.objects.all()
    permission_classes = [AllowAny]
    
    
class AttributeValueListCreate(generics.ListCreateAPIView):
    serializer_class = AttributeValueSerializer
    queryset = AttributeValue.objects.all()
    permission_classes = [AllowAny]


class AttributeValueDetail(generics.RetrieveAPIView):
    serializer_class = AttributeValueSerializer
    queryset = AttributeValue.objects.all()
    permission_classes = [AllowAny]
    
    
class AttributeValueUpdate(generics.UpdateAPIView):
    serializer_class = AttributeValueSerializer
    queryset = AttributeValue.objects.all()
    permission_classes = [AllowAny]
    
    
class AttributeValueDelete(generics.DestroyAPIView):
    serializer_class = AttributeValueSerializer
    queryset = AttributeValue.objects.all()
    permission_classes = [AllowAny]