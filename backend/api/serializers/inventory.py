from rest_framework import serializers
from ..models import InventoryBatch, Inventory


class InventoryBatchExpiryWarningSerializer(serializers.ModelSerializer):
    variant_name = serializers.CharField(source='variant.variant_name', read_only=True)
    unit_name = serializers.CharField(source='unit.unit_name', read_only=True)

    class Meta:
        model = InventoryBatch
        fields = ['id', 'qty', 'received_date', 'expiry_date', 'purchase_price', 'variant_name', 'unit_name']


class InvertorySerializer(serializers.ModelSerializer):
    variant_name = serializers.CharField(source='variant.variant_name', read_only=True)
    unit_name = serializers.CharField(source='unit.unit_name', read_only=True)
    
    class Meta: 
        model = Inventory
        fields = ['id', 'quantity_in', 'quantity_out', 'balance', 'variant_name', 'unit_name']