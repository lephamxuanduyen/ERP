from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from ..models import InventoryBatch, ProductVariant, Inventory
from ..serializers import InventoryBatchExpiryWarningSerializer, InvertorySerializer
from rest_framework.permissions import AllowAny

class ExpiryWarningAPIView(GenericAPIView):
    serializer_class = InventoryBatchExpiryWarningSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        today = timezone.now().date()
        warning_date = today + timedelta(days=10)
        
        return InventoryBatch.objects.filter(expiry_date__range=(today, warning_date))

    def get(self, request, *args, **kwargs):
        expiring_batches = self.get_queryset()
        serializer = self.get_serializer(expiring_batches, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)


class QuantityVariantByAttributeAPIView(GenericAPIView):
    serializer_class = InvertorySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        product = self.request.query_params.get('product')
        attribute_value = self.request.query_params.get('attribute-value')
        variant_id = self.request.query_params.get('variant_id')

        if variant_id:
            return Inventory.objects.filter(variant=variant_id)

        if not product or not attribute_value: 
            return Inventory.objects.none()
        
        variants = ProductVariant.objects.filter(
            product=product,
            variantattribute__value=attribute_value
        )
        if not variants.exists():
            return Inventory.objects.none()
        
        return Inventory.objects.filter(
            variant=variants.first().id
        )
    
    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        if not queryset.exists():
            return Response({"detail": "No inventory found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)