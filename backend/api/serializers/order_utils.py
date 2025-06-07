from rest_framework import serializers
from ..models import ReturnDetail, ReturnOrder


class MergeOrderSerializer(serializers.Serializer):
    order_ids = serializers.ListField(
        child = serializers.IntegerField(), min_length=2,
        help_text="List of order IDs to merge"
    )   
    
    def validate(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("Phải chọn ít nhất 2 đơn để gộp.")
        return value
    
    
class SplitItemSerializer(serializers.Serializer):
    detail_id = serializers.IntegerField()
    qty = serializers.IntegerField(min_value=1)
   
    
class SplitOrderSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    split_items = SplitItemSerializer(many=True)
    
    def validate(self, data):
        if not data.get("split_items"):
            raise serializers.ValidationError("Danh sách split_items không được rỗng.")
        return data
    

class ReturnDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnDetail
        fields = ['id', 'qty', 'unit_price', 'refund_amount', 'reason', 'variant', 'unit']
    
    
class ReturnOrderSerializer(serializers.ModelSerializer):
    return_details = ReturnDetailSerializer(many=True, write_only=True)

    class Meta:
        model = ReturnOrder
        fields = ['id', 'return_date', 'total_refurn', 'handled_by', 'note', 'status', 'customer', 'order', 'return_details']