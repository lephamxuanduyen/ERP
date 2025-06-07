from django.db import models


class Category(models.Model):
    cate_name = models.CharField(max_length=100)
    cate_desc = models.TextField(max_length=1000, null=True, blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.cate_name
    

class Unit(models.Model):
    unit_name = models.CharField(max_length=100)
    contains = models.FloatField(null=True, blank=True)
    reference_unit = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.unit_name
    
    
class Product(models.Model):
    class Type(models.TextChoices):
        GOOD = 'GOOD', 'Good'
        SERVICE = 'SERVICE', 'Service'
    
    prod_name = models.CharField(max_length=100)
    prod_type = models.CharField(max_length=10, choices=Type.choices, default=Type.GOOD)
    barcode = models.CharField(max_length=13, unique=True, null=True, blank=True)
    prod_price = models.IntegerField(default=0)
    prod_cost_price = models.IntegerField(default=0)
    taxes = models.IntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='product')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    order = models.CharField(max_length=50, null=True, blank=True)
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.order:
            self.order = str(self.id)
            self.save(update_fields=['order'])
       
    def __str__(self):
        return self.prod_name
    
    
class Attribute(models.Model):
    class Display_type(models.TextChoices):
        RADIO = 'RADIO', 'Radio'
        SELECTION = 'SELECTION', 'Selection'
        COLOR = 'COLOR', 'Color'
    
    att_name = models.CharField(max_length=50)
    display_type = models.CharField(max_length=10, choices=Display_type.choices, default=Display_type.RADIO)
    
    def __str__(self):
        return self.att_name
    

class AttributeValue(models.Model):
    value = models.CharField(max_length=100)
    default_extra_price = models.IntegerField(null=True, blank=True, default=0)
    color = models.CharField(max_length=50,null=True, blank=True)
    attribute = models.ForeignKey(Attribute, related_name='values', on_delete=models.CASCADE, null=True, blank=True)
    order = models.CharField(max_length=50, null=True, blank=True)
    image = models.ImageField(upload_to='attribute_images/', null=True, blank=True)
    
    class Meta:
        unique_together = ('id', 'value')
    
    def __str__(self):
        return self.value
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.order:
            self.order = str(self.id)
            self.save(update_fields=['order'])
            
            
class ProductVariant(models.Model):
    variant_name = models.CharField(max_length=100, null=True, blank=True)
    sku = models.CharField(max_length=50, null=True, blank=True)
    variant_price = models.IntegerField(default=0)
    variant_cost_price = models.IntegerField(default=0)
    product = models.ForeignKey(Product, models.CASCADE, null=True, default=True)
    order = models.CharField(max_length=50, null=True, blank=True)
    image = models.ImageField(upload_to='variant_images/', null=True, blank=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not self.order:
            self.order=str(self.id)
            self.save(update_fields=['order'])
    

class VariantAttribute(models.Model):
    value = models.ForeignKey(AttributeValue, related_name="variantattribute", on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['value', 'variant'], name='primary_key_variant_value')
        ]
        