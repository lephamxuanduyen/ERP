from django.db import models
from .product import Unit, ProductVariant
from django.contrib.auth.models import User


class Supplier(models.Model):
    sup_name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100)
    sup_phone = models.CharField(max_length=11)
    sup_mail = models.CharField(max_length=100)
    sup_add = models.CharField(max_length=100)
    
    def __str__(self):
        return self.sup_name
    
    
class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        RECEIVE = "RECEIVE", "Receive"
        CANCELED = "CANCELED", "Canceled"
    
    total_amount = models.IntegerField(default=0)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.RECEIVE)
    supplier = models.ForeignKey(Supplier, on_delete=models.CASCADE)
    employee = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    create_at = models.DateField(auto_now_add=True)
    
    
class PurchaseDetail(models.Model):
    qty = models.IntegerField(default=0)
    total = models.IntegerField(default=0)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='purchase_details', null=True, blank=True)