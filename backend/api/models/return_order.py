from django.db import models
from django.contrib.auth.models import User
from .promotion import Customer
from .order import Order
from .product import ProductVariant, Unit


class ReturnOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        APPROVED = "APPROVE", "Approved"
        CANCELED = "CANCELED", "Canceled"
        REFUNDED = "REFUNDED", "Refunded"
    
    return_date = models.DateField(auto_now=True)
    total_refurn = models.IntegerField(default=0)
    handled_by = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.CharField(max_length=1000)
    status = models.CharField(max_length=10, default=Status.PENDING, choices=Status.choices)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=True, blank=True)
    

class ReturnDetail(models.Model):
    qty = models.IntegerField(default=0)
    unit_price = models.IntegerField()
    refund_amount = models.IntegerField()
    reason = models.CharField(max_length=1000)
    return_order = models.ForeignKey(ReturnOrder, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)