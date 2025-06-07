from rest_framework import generics
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.permissions import AllowAny
from ..serializers import UnitSerializer
from ..models import Unit


class UnitListCreate(generics.ListCreateAPIView):
    serializer_class = UnitSerializer
    pagination_class = LimitOffsetPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        name = self.request.query_params.get('name')
        if name:
            return Unit.objects.filter(unit_name__icontains=name)
        return Unit.objects.all()
    

class UnitDetail(generics.RetrieveAPIView):
    serializer_class = UnitSerializer
    queryset = Unit.objects.all()
    permission_classes = [AllowAny]
    
    
class UnitUpdate(generics.UpdateAPIView):
    serializer_class = UnitSerializer
    queryset = Unit.objects.all()
    permission_classes = [AllowAny]
    
    
class UnitDelete(generics.DestroyAPIView):
    serializer_class = UnitSerializer
    queryset = Unit.objects.all()
    permission_classes = [AllowAny]