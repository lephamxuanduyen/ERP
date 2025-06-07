from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.pagination import LimitOffsetPagination
from ..serializers import OrderSerializer
from ..models import Order


class OrderListCreate(generics.ListCreateAPIView):
    serializer_class=OrderSerializer
    pagination_class=LimitOffsetPagination
    permission_classes=[AllowAny]
    
    def get_queryset(self):
        return Order.objects.all()
    
    
class OrderDetail(generics.RetrieveAPIView):
    serializer_class=OrderSerializer
    queryset=Order.objects.all()
    permission_classes=[AllowAny]
    
    
class OrderUpdate(generics.UpdateAPIView):
    serializer_class=OrderSerializer
    queryset=Order.objects.all()
    permission_classes=[AllowAny]