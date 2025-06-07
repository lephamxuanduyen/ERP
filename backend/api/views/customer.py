from rest_framework import generics
from ..serializers import CustomerSerializer
from ..models import Customer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import LimitOffsetPagination


class CustomerListCreate(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]
    pagination_class = LimitOffsetPagination
    
    def get_queryset(self):
        queryset = Customer.objects.all()
        phone = self.request.query_params.get('phone')
        name = self.request.query_params.get('name')
        address = self.request.query_params.get('address')
        tier = self.request.query_params.get('tier')
        
        if phone:
            return Customer.objects.filter(cus_phone=phone)
        if name:
            return Customer.objects.filter(cus_name__icontains=name)
        if address: 
            return Customer.objects.filter(cus_address__icontains=address)
        if tier:
            return Customer.objects.filter(tier__tier_name__icontains=tier)
        return queryset
    
    
class CustomerDetail(generics.RetrieveAPIView):
    serializer_class = CustomerSerializer
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]
    queryset = Customer.objects.all()
    

class CustomerDelete(generics.DestroyAPIView):
    serializer_class = CustomerSerializer
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]
    queryset = Customer.objects.all()
    

class CustomerUpdate(generics.UpdateAPIView):
    serializer_class = CustomerSerializer
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]
    queryset = Customer.objects.all()