from django.db import models
from .product import ProductVariant, Unit


class Inventory(models.Model):
    quantity_in = models.IntegerField(default=0)
    quantity_out = models.IntegerField(default=0)
    balance = models.IntegerField(default=0)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return self.balance
    
    
class InventoryBatch(models.Model):
    qty = models.IntegerField(default=0)
    received_date = models.DateField(auto_now=True)
    expiry_date = models.DateField(blank=True, null=True)
    purchase_price = models.IntegerField(default=0)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name='variant')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True, blank=True)    