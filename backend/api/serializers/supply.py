from rest_framework import serializers
from ..models import Supplier, PurchaseDetail, PurchaseOrder, ProductVariant, Inventory, InventoryBatch
from django.db import transaction

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'sup_name', 'contact_person', 'sup_phone', 'sup_mail', 'sup_add']
        extra_kwargs = {
            'contact_person': { 'allow_null':True, 'allow_blank':True }
        }


class PurchaseDetailSerializer(serializers.ModelSerializer):
    expiry_date = serializers.DateField(required=False)
    id = serializers.IntegerField(required=False)
    
    class Meta: 
        model = PurchaseDetail
        fields = ['id', 'qty', 'total', 'unit', 'variant', 'expiry_date']
        
        
class PurchaseOrderSerializer(serializers.ModelSerializer):
    purchase_details = PurchaseDetailSerializer(
        many=True,
        required=False
    )
    
    def validate_status(self, value):
        """
        Kiểm tra xem giá trị status mới có hợp lệ không.
        """
        instance = getattr(self, 'instance', None)
        if instance:  # Nếu là update
            if instance.status == PurchaseOrder.Status.CANCELED and value != PurchaseOrder.Status.CANCELED:
                raise serializers.ValidationError("Cannot change status from CANCELED.")
            if instance.status == PurchaseOrder.Status.RECEIVE and value != PurchaseOrder.Status.RECEIVE:
                raise serializers.ValidationError("Cannot change status from RECEIVE.")
        return value
    
    class Meta:
        model = PurchaseOrder
        fields = ['id', 'total_amount', 'status', 'supplier', 'employee', 'purchase_details', 'create_at']
        
    def create(self, validated_data):
        """
        Tạo Purchase Order với status PENDING.
        Chỉ tạo PurchaseDetail, KHÔNG cập nhật kho.
        expiry_date không bắt buộc khi tạo.
        """
        details_data = validated_data.pop('purchase_details', [])
        
        with transaction.atomic():
            # Tạo Purchase Order với status PENDING
            purchase = PurchaseOrder.objects.create(**validated_data)
            
            # Tạo Purchase Details
            purchase_details = []
            for detail_data in details_data:
                purchase_detail = PurchaseDetail(
                    qty=detail_data.get('qty', 1),
                    total=detail_data.get('total'),
                    unit=detail_data.get('unit'),
                    variant=detail_data.get('variant'),
                    purchase_order=purchase,
                    # expiry_date=detail_data.get('expiry_date')  # Có thể null khi tạo
                )
                purchase_details.append(purchase_detail)
            
            PurchaseDetail.objects.bulk_create(purchase_details)
            
        return purchase
    
    def _update_inventory_and_batch(self, purchase_order_instance: PurchaseOrder, expiry_map: dict):
        """
        Cập nhật Inventory và tạo InventoryBatch khi status = RECEIVE.
        """
        with transaction.atomic():
            for detail in purchase_order_instance.purchase_details.all():
                variant_id = detail.variant.id
                
                # 1. Update giá cost của ProductVariant
                if detail.qty > 0:
                    new_cost_price = detail.total / detail.qty
                    ProductVariant.objects.filter(id=variant_id).update(
                        variant_cost_price=new_cost_price
                    )
                
                # 2. Cập nhật Inventory
                inventory, created = Inventory.objects.get_or_create(
                    variant=detail.variant,
                    defaults={ 
                        'quantity_in': 0, 
                        'quantity_out': 0, 
                        'balance': 0,
                        'unit': detail.unit
                    }
                )
                
                inventory.quantity_in += detail.qty
                inventory.balance = inventory.quantity_in - inventory.quantity_out
                inventory.save()
                
                expiry_date = expiry_map.get(detail.id)
                
                # 3. Tạo InventoryBatch
                InventoryBatch.objects.create(
                    qty=detail.qty,
                    expiry_date=expiry_date,
                    purchase_price=detail.total,
                    variant=detail.variant,
                    unit=detail.unit
                )

    def update(self, instance: PurchaseOrder, validated_data):
        """
        Cho phép cập nhật status và purchase_details.
        - Nếu PENDING -> RECEIVE: cập nhật kho
        - Nếu PENDING -> CANCELED: không cập nhật kho
        - Cho phép sửa qty và expiry_date của detail khi chuyển sang RECEIVE
        """
        new_status = validated_data.get('status', "")
        details_data = validated_data.pop('purchase_details', None)
        existing_variant_ids = list(
            instance.purchase_details.values_list('variant', flat=True)
        )
        expiry_map = {}
        
        with transaction.atomic():
            # 1. Xử lý cập nhật purchase_details nếu có
            if details_data is not None:
                # Chỉ cho phép cập nhật details khi đang PENDING
                if instance.status != PurchaseOrder.Status.PENDING:
                    raise serializers.ValidationError(
                        "Can only update purchase details when status is PENDING."
                    )
                
                # Lấy danh sách detail IDs từ request
                detail_ids_from_request = [d.get('id') for d in details_data if d.get('id')]
                existing_detail_ids = list(instance.purchase_details.values_list('id', flat=True))
                expiry_map = {
                    d['id']: d.get('expiry_date') for d in details_data if 'id' in d
                }
                
                # Kiểm tra không được thêm variant mới (chỉ update existing details)
                for detail_data in details_data:
                    if not detail_data.get('id'):
                        raise serializers.ValidationError(
                            "Cannot add new variants. Only existing details can be updated."
                        )
                        
                    if detail_data.get('variant').id not in existing_variant_ids:
                        raise serializers.ValidationError(
                            f"Cannot add new variants. Only existing variants in this order can be updated (variant_id={detail_data.get('variant').id})."
                        )
                    
                    detail_id = detail_data.get('id')
                    if detail_id not in existing_detail_ids:
                        raise serializers.ValidationError(
                            f"Purchase detail with id {detail_id} does not exist in this order."
                        )
                
                # Cập nhật từng detail
                for detail_data in details_data:
                    detail_id = detail_data.get('id')
                    try:
                        detail = PurchaseDetail.objects.get(id=detail_id, purchase_order=instance)
                        
                        # Cập nhật qty, total, expiry_date
                        detail.qty = detail_data.get('qty', detail.qty)
                        detail.total = detail_data.get('total', detail.total)
                        # detail.expiry_date = detail_data.get('expiry_date', detail.expiry_date)
                        detail.save()
                        
                    except PurchaseDetail.DoesNotExist:
                        raise serializers.ValidationError(
                            f"Purchase detail with id {detail_id} not found."
                        )
            
            # 2. Xử lý cập nhật status
            if instance.status == PurchaseOrder.Status.PENDING:
                if new_status == PurchaseOrder.Status.RECEIVE:
                    # Cập nhật kho khi chuyển sang RECEIVE
                    self._update_inventory_and_batch(instance, expiry_map)
                    instance.status = new_status
                    
                elif new_status == PurchaseOrder.Status.CANCELED:
                    # Chỉ đổi status, không cập nhật kho
                    instance.status = new_status
                    
                elif new_status == PurchaseOrder.Status.PENDING:
                    # Giữ nguyên PENDING, có thể cập nhật details
                    pass                   
                else:
                    raise serializers.ValidationError(
                        "Can only change status from PENDING to RECEIVE or CANCELED."
                    )
                instance.save()
            else:
                # Nếu không phải PENDING, không cho phép đổi status
                if new_status != instance.status:
                    raise serializers.ValidationError(
                        f"Cannot change status from {instance.get_status_display()}."
                    )
            
            # Cập nhật các trường khác nếu có
            # for field, value in validated_data.items():
            #     if field != 'status':  # status đã xử lý ở trên
            #         setattr(instance, field, value)
            
            # instance.save()
        
        return instance

    def to_representation(self, instance):
        """Thêm các trường bổ sung vào response."""
        representation = super().to_representation(instance)
        
        representation['supplier_name'] = instance.supplier.sup_name if instance.supplier else None
        representation['status_display'] = instance.get_status_display()
        
        # Chi tiết đơn hàng
        purchase_details_qs = instance.purchase_details.all()
        representation['purchase_details'] = PurchaseDetailSerializer(purchase_details_qs, many=True).data
        
        return representation