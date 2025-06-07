from rest_framework import serializers
from django.db import transaction
from ..models import Order, OrderDetail, ProductVariant, Inventory, InventoryBatch, Discount, Coupon, GiftProduct
from django.db.models import F
from django.utils import timezone
from rest_framework.exceptions import ValidationError


class OrderDetailSerializer(serializers.ModelSerializer):
    class Meta: 
        model = OrderDetail
        fields = ['id', 'order', 'variant', 'qty', 'total', 'unit']
        
        
class OrderSerializer(serializers.ModelSerializer):
    details = OrderDetailSerializer(
        many=True,
        required=False
    )
    class Meta:
        model = Order
        fields = ['id', 'total_amount', 'payment_method', 'order_date', 'status', 'customer', 'coupon', 'discount', 'employee', 'details']
    
    def create(self, validated_data):
        details_data = validated_data.pop('details', [])
        # Gán giá trị status là PENDING
        validated_data['status']="PENDING"
        total_amount = 0
        
        discount = None
        coupon = None
        discount_id = validated_data.get('discount', None)
        coupon_id = validated_data.get('coupon', None)

        if discount_id:
            discount = Discount.objects.select_for_update().get(id=discount_id)
        if coupon_id:
            coupon = Coupon.objects.select_for_update().get(id=coupon_id)
        
        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            
            order_details = []
            for detail_data in details_data:
                variant = detail_data['variant']
                qty = detail_data['qty']
                unit = detail_data['unit']
                price=ProductVariant.objects.get(id=variant.id).variant_price
                total = price * qty
                total_amount += total
                
                # Kiểm tra và cập nhật tồn kho
                inventory = Inventory.objects.select_for_update().get(variant=variant)
                if inventory.balance < qty:
                    raise serializers.ValidationError(f"Sản phẩm {variant} không đủ tồn kho")
                inventory.quantity_out = F('quantity_out') + qty
                inventory.balance = F('balance') - qty
                inventory.save()
                
                # Trừ hàng từ các batch theo FIFO
                self._deduct_from_batches(variant, qty)
                
                # Tạo OrderDetail
                detail = OrderDetail(
                    variant=variant,
                    order=order,
                    qty=qty,
                    total=total,
                    unit=unit,
                )
                order_details.append(detail)
            OrderDetail.objects.bulk_create(order_details)
            
            # Xử lý discount
            if discount:
                total_amount = self._apply_discount(order, discount, discount_id, total_amount)
            
            # Xử lý coupon
            if coupon: 
                total_amount = self._apply_coupon(coupon, total_amount)

            order.total_amount = max(total_amount, 0)
            order.save()
        return order
    
    def update(self, instance, validate_data):
        order_details_data = validate_data.pop('order_details', [])
        discount_id = validate_data.get('discount', None)
        coupon_id = validate_data.get('coupon', None)
        total_amount = 0
        
        if discount_id: new_discount = Discount.objects.select_for_update().get(id=discount_id)
        if coupon_id: new_coupon = Coupon.objects.select_for_update().get(id=coupon_id)
        
        with transaction.atomic():
            # Hoàn lại discount/ Coupon/ Gift Product
            self._rollback_old_promotions(instance)
            
            # cập nhật các thuộc tính của Order
            for attr, value in validate_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Nếu Order đang ở trạng thái PENDING (chưa thanh toán/hủy) => Cho phép cập nhật OrderDetail
            if instance.status=="PENDING":
                # DS ID của các order_detail trong request
                new_order_details = {validate_data.get('id') for order_detail in order_details_data if order_detail.get('id')}
                # DS ID của các order_detail có trong db
                old_order_details = set(instance.details.values_list('id', flat=True))
                
                # Hoàn lại tồn kho cho những Order detail cũ
                for old_detail_id in old_order_details:
                    # Từ Old Order Detail => Lấy Old Variant & Old Quantity
                    order_detail = OrderDetail.objects.get(order=instance)
                    old_variant = order_detail.variant
                    old_qty = order_detail.qty
                    # Cập nhật Inventory => qty_out -= Old Quantity; balance += Old Quantity
                    inventory = Inventory.objects.get(variant=old_variant)
                    inventory.quantity_out -= old_qty
                    inventory.balance += old_qty
                    inventory.save()
                    # Cập nhât Inventory Batch (FIFO) order by receive date (Lấy First Batch) => qty += Old Quantity
                    batch = InventoryBatch.objects.filter(variant=old_variant).order_by('received_date').first()
                    batch.qty += old_qty
                    batch.save()
                
                # Xóa các order_detail không có trong request
                instance.details.filter(id__in=old_order_details - new_order_details).delete()
                
                # Cập nhật Order Detail
                for detail_data in order_details_data:
                    detail_id=detail_data.get('id', '')
                    price=ProductVariant.objects.get(detail_id).variant_price
                    
                    if detail_id and detail_id in old_order_details:
                        # Nếu order_detail có trong instance => cập nhật
                        OrderDetail.objects.filter(id=detail_id).update(
                            variant=detail_data.get('variant', ''),
                            order=instance,
                            qty=detail_data.get('qty', 1),
                            total=detail_data.get('qty', 1)*price,
                            unit=detail_data.get('unit','')
                        )
                    else:
                    # Nếu order_detail không có trong instance => Tạo mới
                        OrderDetail.objects.create(
                            variant=detail_data.get('variant', ''),
                            order=instance,
                            qty=detail_data.get('qty', 1),
                            total=detail_data.get('qty', 1)*price,
                            unit=detail_data.get('unit','')
                        )    
                    total_amount += detail_data.get('qty', 1)*price
                      
            # Áp dụng discount mới
                total_amount = self._apply_discount(instance, new_discount, discount_id, total_amount)
            # Áp dụng coupon mới
                total_amount = self._apply_coupon(new_coupon, total_amount)

            instance.total_amount = max(total_amount, 0)
            instance.save()
        return instance
    
    def _apply_discount(self, order, discount, discount_id, total_amount):
        now = timezone.now()
        if discount:
            if discount.usage_limit == 0:
                raise ValidationError("Mã giảm giá đã hết lượt sử dụng.")
            if not (discount.start_date <= now.date() <= discount.end_date):
                raise ValidationError("Mã giảm giá không còn hiệu lực")
            
            discount.usage_limit -=1
            discount.save()
            
            if discount.discount_type == "BUY_X_GET_Y" or discount.discount_type == "Buy-X-Get-Y":
                self._apply_gift_product(order, discount_id)
            else:
                if discount.promotion_value_type == 'PERCENTAGE' or discount.promotion_value_type == 'Percentage':
                    total_amount *= (1 - discount.promotion_value/100)
                elif discount.promotion_value_type == 'FIX' or discount.promotion_value_type == 'Fix':
                    total_amount -= discount.promotion_value 
        return total_amount
    
    def _apply_coupon(self, coupon, total_amount):
        now = timezone.now()
        if coupon: 
            if coupon.usage_limit is not None:
                if coupon.usage_limit == 0:
                    raise ValidationError('Mã coupon đã hết lượt sử dụng.')
                if not (coupon.start_date <= now.date() <= coupon.end_date):
                    raise ValidationError('Mã coupon không còn hiệu lực.')
                coupon.usage_limit -= 1
                coupon.save()
                if coupon.promotion_value_type == 'PERCENTAGE' or coupon.promotion_value_type == 'Percentage':
                        total_amount *= (1 - coupon.promotion_value/100)
                elif coupon.promotion_value_type == 'FIX' or coupon.promotion_value_type == 'Fix':
                        total_amount -= coupon.promotion_value 
        return total_amount
    
    def _apply_gift_product(self, order, discount_id):
        gift_variant = GiftProduct.objects.get(discount=discount_id)
        gift_qty = gift_variant.qty
        OrderDetail.objects.create(
            order=order,
            variant=gift_variant,
            qty=gift_qty,
            total=0,
            unit=gift_variant.unit
        )
        
        gift_inventory = Inventory.objects.select_for_update().get(variant=gift_variant)
        gift_inventory.quantity_out = F('quantity_out') + gift_qty
        gift_inventory.balance = F('balance') - gift_qty
        gift_inventory.save()
        
        gift_batches = InventoryBatch.objects.filter(variant=gift_variant).order_by('receied_date')
        remaining_qty = gift_qty
        for batch in gift_batches:
            if batch.qty >= remaining_qty:
                batch.qty -= remaining_qty
                batch.save()
                break
            else:
                remaining_qty -= batch.qty
                batch.qty = 0
                batch.save()
    
    def _rollback_old_promotions(self, instance):
        old_discount = instance.discount
        old_coupon = instance.coupon
        
        # Hoàn lại usage_limit cho discount cũ
        if old_discount and old_discount.usage_limit is not None:
            old_discount.usage_limit +=1
            old_discount.save()
            
        # Hoàn lại usage_limit cho coupon cũ
        if old_coupon and old_coupon.usage_limit is not None:
            old_coupon.usage_limit +=1
            old_coupon.save()
            
        if old_discount and (old_discount.discount_type == "BUY_X_GET_Y" or old_discount.discount_type == "Buy-X-Get-Y"):
            GiftProduct.objects.filter(id=old_discount.id).delete()
    
    def _deduct_from_batches(self, variant, qty_needed):
        # Trừ số lượng từ InventoryBatch theo FIFO cho 1 variant.
        
        batches = InventoryBatch.objects.select_for_update().filter(
            variant=variant,
            qty__gt=0
        ).order_by('received_date')

        for batch in batches:
            if qty_needed <= 0:
                break

            if batch.qty >= qty_needed:
                batch.qty -= qty_needed
                batch.save()
                qty_needed = 0
            else:
                qty_needed -= batch.qty
                batch.qty = 0
                batch.save()

        if qty_needed > 0:
            raise serializers.ValidationError(
                f"Tồn kho theo lô không đủ để đáp ứng số lượng yêu cầu cho variant {variant.id}"
            )