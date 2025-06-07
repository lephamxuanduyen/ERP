from django.db import models
from .product import ProductVariant, Unit
from django.contrib.auth.models import User
from .promotion import Customer, Coupon, Discount


class Order(models.Model):
    class Status(models.TextChoices):
        COMPLETE = "COMPLETE", "Complete"
        PENDING = "PENDING", "Pending"
        CANCEL = "CANCEL", "Cancel"
        
    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        TRANSFER = "TRANSFER", "Transfer"
    
    total_amount = models.IntegerField(default=0)
    payment_method = models.CharField(max_length=10, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    order_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, null=True, blank=True, related_name='order_coupon')
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, null=True, blank=True, related_name="order_discount")


class OrderDetail(models.Model):
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='details', null=True, blank=True)
    qty = models.IntegerField(default=1)
    total = models.IntegerField(default=0)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    
    
class Invoice(models.Model):
    class PaymentStatus(models.TextChoices):
        UNPAID = "UNPAID", "Unpaid"
        PAID = "PAID", "Paid"
        PARTIALLY_PAID = "PARTIALLY_PAID", "Partially-part"
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='invoice_order')    
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices)
    create_at = models.DateField(auto_now_add=True)
    total_amount = models.IntegerField(default=0)
    amount_received = models.IntegerField(default=0)
    amount_change = models.IntegerField(default=0)
    
    def save(self, *args, **kwargs):
        self.amount_change = self.amount_received - self.total_amount
        super.save(*args, **kwargs)
        
        
class PointTransactions(models.Model):
    points_earned = models.FloatField(default=0)
    points_used = models.FloatField(default=0)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)