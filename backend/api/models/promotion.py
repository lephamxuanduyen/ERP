from django.db import models
from .product import ProductVariant, Unit


class Discount(models.Model):
    class DiscountType(models.TextChoices):
        DISCOUNT = "DISCOUNT", "Discount"
        BUY_X_GET_Y = "BUY_X_GET_Y", "Buy-X-Get-Y"
        
    class PromotionValueType(models.TextChoices):
        FIX = "FIX", "Fix"
        PERCENTAGE = "PERCENTAGE", "Percentage"
    
    discount_name = models.CharField(max_length=100, null=True, blank=True)
    discount_type = models.CharField(max_length=15, choices=DiscountType.choices, default=DiscountType.DISCOUNT)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    promotion_value = models.IntegerField(null=True, blank=True)
    promotion_value_type = models.CharField(max_length=10, choices=PromotionValueType.choices, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name="discount", null=True, blank=True)
    qty = models.IntegerField(default=0, null=True, blank=True)
    def __str__(self):
        return self.discount_name
    
class PromotionCondition(models.Model):
    min_purchase_qty = models.IntegerField(default=0)
    min_purchase_amount = models.IntegerField(default=0)
    discount = models.ForeignKey(Discount, related_name='conditions', on_delete=models.CASCADE, null=True, blank=True)
    order = models.CharField(max_length=50, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.order:
            self.order = str(self.id)
            self.save(update_fields=['order'])


class GiftProduct(models.Model):
    qty = models.IntegerField()
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE)
    
    class Meta:
        unique_together = ('variant', 'discount')
        
        
class Coupon(models.Model):
    class PromotionValueType(models.TextChoices):
        FIX = "FIX", "Fix"
        PERCENTAGE = "PERCENTAGE", "Percentage"
        
    code = models.CharField(max_length=20)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    promotion_value = models.IntegerField(null=True, blank=True)
    promotion_value_type = models.CharField(max_length=10, choices=PromotionValueType.choices, null=True, blank=True)
    

class RewardTier(models.Model):
    tier_name = models.CharField(max_length=50)
    min_points = models.IntegerField(default=0)
    exchange_rate = models.FloatField()
    
    
class Customer(models.Model):
    cus_name = models.CharField(max_length=100)
    cus_phone = models.CharField(max_length=10, unique=True)
    cus_mail = models.CharField(max_length=100, null=True, blank=True)
    cus_address = models.CharField(max_length=100, null=True, blank=True)
    create_at = models.DateField(auto_now_add=True)
    tier = models.ForeignKey(RewardTier, on_delete=models.CASCADE, related_name='customer', blank=True, null=True)
    debt_amount = models.IntegerField(default=0)
    
    def __str__(self):
        return self.cus_name 
    
    def save(self, *args, **kwargs):
        if not self.tier:
            try:
                self.tier = RewardTier.objects.get(pk=1)
            except RewardTier.DoesNotExist:
                pass  # Hoặc raise lỗi nếu cần
        super().save(*args, **kwargs)  
       
    
class LoyaltyReward(models.Model):
    
    class Type(models.TextChoices):
        DISCOUNT = "DISCOUNT", "Discount"
        COUPON = "COUPON", "Coupon"
    
    reward_type = models.CharField(max_length=10, null=True, blank=True, choices=Type.choices)
    points_required = models.IntegerField(default=0)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    discount = models.ForeignKey(Discount, on_delete=models.SET_NULL, null=True, blank=True)
    tier = models.ForeignKey(RewardTier, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.reward_tier 
    
    
class LoyaltyProgram(models.Model):
    points = models.IntegerField(default=0)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='loyalty') 
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Customer ID: {self.customer} - {self.reward_tier}"