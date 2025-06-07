from rest_framework import generics
from rest_framework.permissions import AllowAny
from ..models import Invoice
from ..serializers import InvoiceSerializer

class InvoiceListCreate(generics.ListCreateAPIView):
    serializer_class=InvoiceSerializer
    queryset=Invoice.objects.all()
    permission_classes=[AllowAny]
    
    
class InvoiceDetail(generics.RetrieveAPIView):
    serializer_class=InvoiceSerializer
    queryset=Invoice.objects.all()
    permission_classes=[AllowAny]