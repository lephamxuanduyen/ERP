from rest_framework import generics
from ..models import Supplier, PurchaseOrder
from ..serializers import SupplierSerializer, PurchaseOrderSerializer
from rest_framework.permissions import AllowAny, DjangoModelPermissions
from rest_framework.pagination import LimitOffsetPagination


class SupplierListCreate(generics.ListCreateAPIView):
    serializer_class = SupplierSerializer
    permission_classes = [AllowAny]
    pagination_class = LimitOffsetPagination
    
    def get_queryset(self):
        name = self.request.query_params.get('name')
        phone = self.request.query_params.get('phone')
        address = self.request.query_params.get('address')
        contact = self.request.query_params.get('contact')
        if phone: 
            return Supplier.objects.filter(sup_phone=phone)
        if name:
            return Supplier.objects.filter(sup_name__icontains=name)
        if address: 
            return Supplier.objects.filter(sup_add__icontains=address)
        if contact:
            return Supplier.objects.filter(contact_person__icontains=contact)
        return Supplier.objects.all()
    
    
class SupplierDetail(generics.RetrieveAPIView):
    serializer_class = SupplierSerializer
    queryset = Supplier.objects.all()
    permission_classes = [AllowAny]
    
    
class SupplierDelete(generics.DestroyAPIView):
    serializer_class = SupplierSerializer
    queryset = Supplier.objects.all()
    permission_classes = [AllowAny]
    
    
class SupplierUpdate(generics.UpdateAPIView):
    serializer_class = SupplierSerializer
    queryset = Supplier.objects.all()
    permission_classes = [AllowAny]
    
    
class PurchaseOrderListCreate(generics.ListCreateAPIView):
    serializer_class=PurchaseOrderSerializer
    pagination_class=LimitOffsetPagination
    permission_classes=[AllowAny]
    
    def get_queryset(self):
        return PurchaseOrder.objects.all()
    
    
class PurchaseOrderDetail(generics.RetrieveAPIView):
    serializer_class=PurchaseOrderSerializer
    queryset=PurchaseOrder.objects.all()
    permission_classes=[AllowAny]
    
# Không cho phép sửa/xóa PurchaseOrder


class PurchaseOrderUpdate(generics.UpdateAPIView):
    serializer_class=PurchaseOrderSerializer
    queryset=PurchaseOrder.objects.all()
    permission_classes=[AllowAny]