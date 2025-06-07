from rest_framework import serializers
from ..models import PromotionCondition, Discount, Coupon, LoyaltyProgram, Customer, LoyaltyReward, RewardTier, GiftProduct
from django.db import transaction


class LoyaltyProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyProgram
        fields = ['id', 'points', 'customer', 'last_updated']
        extra_kwargs = {
            'points': { 'required':True },
        }
        
        
class RewardTierSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardTier
        fields = ['id', 'tier_name', 'min_points', 'exchange_rate']
    
    def create(self, validated_data):
        reward_tier = RewardTier.objects.create(**validated_data)
        loyalty_programs = LoyaltyProgram.objects.filter(points__gte=reward_tier.min_points)
        for program in loyalty_programs:
            cus = Customer.objects.get(id=program.customer)
            cus.tier = reward_tier
            cus.save()
        return reward_tier
    
    def update(self, instance, validated_data):
        old_min_points = instance.min_points
        # Cập nhật Reward Tier
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        # Cập nhập Customer.tier
        if old_min_points != instance.min_points: # Nếu min_points thay đổi
            customers = Customer.objects.filter(tier=instance)
            loyalty_programs = LoyaltyProgram.objects.filter(customer__in=customers)
            for program in loyalty_programs:
                if program.points < instance.min_points:
                    tier = None # Xóa tier cho Customer không đủ điểm
                else:
                    tier = instance # Cập nhật tier cho Customer đủ điểm 
                Customer.objects.filter(id=program.customer).update(tier=tier)
        return instance


class CustomerSerializer(serializers.ModelSerializer):
    loyalty_program = LoyaltyProgramSerializer(
        many=False,
        required=False
    )
    class Meta: 
        model = Customer
        fields = ['id',  'cus_name', 'cus_phone', 'cus_mail', 'cus_address', 'create_at', 'loyalty_program', 'tier']
        extra_kwargs = {
            'cus_name': { 'required':True },
            'cus_phone': { 'required':True },
            'cus_mail': { 'allow_null':True, 'allow_blank':True},
            'cus_address': { 'allow_null':True, 'allow_blank':True},
        }

    def create(self, validated_data):
        customer = Customer.objects.create(**validated_data)
        LoyaltyProgram.objects.create(
            points=0,
            customer=customer,
        )
        return customer
    

class PromotionConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromotionCondition
        fields = ['id', 'min_purchase_qty', 'min_purchase_amount', 'discount']
       
       
class GiftProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftProduct
        fields = ['id', 'variant', 'qty']
 
        
class DiscountSerializer(serializers.ModelSerializer):
    conditions = PromotionConditionSerializer(
        many=True,
        required=False
    )
    
    gift_products = GiftProductSerializer(
        many=True,
        required=False
    )
    
    class Meta:
        model = Discount
        fields = [
            'id',
            'discount_name',
            'discount_type',
            'start_date', 
            'end_date', 
            'usage_limit', 
            'promotion_value', 
            'promotion_value_type', 
            'variant', 
            'qty',
            'conditions', 
            'gift_products'
        ]
    
    def create(self, validated_data):
        discount_type = validated_data.get("discount_type")
        conditions_data = validated_data.pop('conditions', [])
        with transaction.atomic():
            if not validated_data.get("usage_limit"): validated_data["usage_limit"] = None
            discount = Discount.objects.create(**validated_data)
            conditions = []
            for condition_data in conditions_data:
                condition = PromotionCondition(
                    min_purchase_qty=condition_data['min_purchase_qty'],
                    min_purchase_amount=condition_data['min_purchase_amount'],
                    discount=discount
                )
                conditions.append(condition)
            # Bulk create
            PromotionCondition.objects.bulk_create(conditions)
            
            # Nếu discount_type == "BUY_X_GET_Y" => Tạo mới Gift Product
            if discount_type == "BUY_X_GET_Y" or discount_type == "Buy-X-Get-Y":
                GiftProduct.objects.create(
                    discount=discount,
                    variant=discount.variant,
                    qty=discount.qty * discount.usage_limit
                )
            elif discount_type == "DISCOUNT" or discount_type == "Discount":
                if "promotion_value" not in validated_data or "promotion_value_type" not in validated_data:
                # Kiểm tra nếu thiếu promotion_value hoặc promation_value_type thì báo lỗi
                    raise serializers.ValidationError("Discount type 'DISCOUNT' requires promotion_value and promotion_value_type.")
        return discount
    
    def update(self, instance, validated_data):
        old_discount_type = instance.discount_type
        new_discount_type = validated_data.get("discount_type", instance.discount_type)
        conditions_data = validated_data.pop('conditions', [])
        with transaction.atomic():
            # Cập nhật các thuộc tính của Discount
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            # Lấy danh sách các ID của CONDITIONS trong request
            new_condition_ids = {condition_data.get('order') for condition_data in conditions_data if condition_data.get('order')}
            # Lấy danh sách các ID của CONDITIONS có trong database
            existing_condition_ids = set(instance.conditions.values_list('order', flat=True))
            # Xóa các CONDITION không có trong request
            instance.conditions.filter(order__in=existing_condition_ids - new_condition_ids).delete()
            
            for condition_data in conditions_data:
                condition_id = condition_data.get('order')
                if condition_id and condition_id in existing_condition_ids:
                    # Nếu ID tồn tại => Cập nhật
                    PromotionCondition.objects.filter(order=condition_id).update(
                        min_purchase_qty=condition_data.get('min_purchase_qty', ''),
                        min_purchase_amount=condition_data.get('min_purchase_amount', ''),
                        order=condition_data.get('order')
                    )
                else: # Nếu không có ID => Tạo mới
                    created_condition = PromotionCondition.objects.create(
                        min_purchase_qty=condition_data.get('min_purchase_qty', ''),
                        min_purchase_amount=condition_data.get('min_purchase_amount', ''),
                        order=None,
                        discount=instance
                    )
                    # Cập nhật ORDER
                    # PromotionCondition.objects.filter(id=created_condition).update(order=created_condition)
                    created_condition.order = str(created_condition.id)
                    created_condition.save(update_fields=['order'])
                
            # Nếu từ DISCOUNT sang BUY_X_GET_Y => Tạo mới gift product
            if old_discount_type.lower()=="discount" and (new_discount_type == "BUY_X_GET_Y" or new_discount_type == "Buy-X-Get-Y"):
                GiftProduct.objects.create(
                    discount=instance,
                    variant=instance.variant,
                    qty=instance.qty * instance.usage_limit
                )
            # Nếu từ BUY_X_GET_Y sang DISCOUNT => Xóa GiftProduct
            elif (old_discount_type == "BUY_X_GET_Y" or old_discount_type == "Buy-X-Get-Y") and new_discount_type.lower()=="discount":
                GiftProduct.objects.filter(discount=instance).delete()
            # Nếu vẫn là BUY_X_GET_Y => cập nhật gift product
            elif (old_discount_type == "BUY_X_GET_Y" or old_discount_type == "Buy-X-Get-Y") and (new_discount_type == "BUY_X_GET_Y" or new_discount_type == "Buy-X-Get-Y"):
                GiftProduct.objects.filter(discount=instance).update(
                    variant=instance,
                    qty=instance.qty * instance.usage_limit
                )
            # Nếu vẫn là DISCOUNT => Kiểm tra promotion_value
            elif old_discount_type.lower()=="discount" and new_discount_type.lower()=="discount":
                if "promotion_value" not in validated_data or "promotion_value_type" not in validated_data:
                # Nếu thiếu promotion_value hoặc promation_value_type thì báo lỗi
                    raise serializers.ValidationError("Discount type 'DISCOUNT' requires promotion_value and promotion_value_type.")
        return instance
    
    
class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'start_date', 'end_date', 'usage_limit', 'promotion_value', 'promotion_value_type']
        
        
class LoyaltyRewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyReward
        fields = ['id', 'reward_type', 'coupon', 'discount', 'tier']