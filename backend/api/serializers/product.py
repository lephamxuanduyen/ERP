from rest_framework import serializers
from django.db import transaction
from ..models import Category, Product, ProductVariant, VariantAttribute, AttributeValue, Inventory

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.cate_name', read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'cate_name', 'cate_desc', 'parent', 'parent_name']
        extra_kwargs = {
            'cate_name': { 'required':True },
            'cate_desc': { 'allow_null':True, 'allow_blank':True },
        }   
        
        
class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.prod_name', read_only=True)
    class Meta:
        model = ProductVariant
        fields = ['id', 'sku', 'variant_name', 'variant_price', 'variant_cost_price', 'product_name', 'image']
        
        
class ValueAttributeSerializer(serializers.ModelSerializer):
    attribute_id = serializers.IntegerField()
    class Meta:
        model = AttributeValue
        fields = ['id', 'value', 'default_extra_price', 'color', 'attribute_id', 'order']
      

class ProductSerializer(serializers.ModelSerializer):
    attributes=ValueAttributeSerializer(
        many=True,
        required=True,
        write_only=True
    )
    attributes_display = serializers.SerializerMethodField(read_only=True)
    total_inventory = serializers.SerializerMethodField(read_only=True)

    class Meta: 
        model = Product
        fields = ['id', 'prod_name', 'prod_type', 'barcode', 'prod_price', 'prod_cost_price', 'taxes', 'category', 'unit', 'order', 'image', 'attributes', 'total_inventory', 'attributes_display']
    
    def get_attributes_display(self, obj):
        variants = ProductVariant.objects.filter(product=obj)
        result = []
        for variant in variants:
            attribute = VariantAttribute.objects.filter(variant=variant).first()
            if attribute:
                result.append({
                    "value": attribute.value.value,  
                    "default_extra_price": variant.variant_price - obj.prod_price,
                    "order": variant.order if variant.order else None
                })
        return result


    def get_total_inventory(self, obj):
        variants = ProductVariant.objects.filter(product=obj)
        total = 0
        for variant in variants:
            inventories = Inventory.objects.filter(variant=variant.id)
            for inventory in inventories:
                total += inventory.balance or 0
        return total

        
    def create(self, validated_data):
        attributes_data = validated_data.pop('attributes', [])
        with transaction.atomic():
            product = Product.objects.create(**validated_data)
            product.order = product.id
            product.save()
            if attributes_data: #(nếu sản phẩm có biến thể)
                for attribute_data in attributes_data:
                    # CREATE PRODUCT_VARIANT
                    variant = ProductVariant.objects.create(
                        variant_name=f"{validated_data.get('prod_name', '')} ({attribute_data.get('value', '')})",
                        sku="",
                        variant_price=validated_data.get('prod_price', 0) + attribute_data.get('default_extra_price', 0),
                        variant_cost_price=validated_data.get('prod_cost_price', 0) + attribute_data.get('default_extra_price', 0),
                        product=product,
                        order=None
                    )
                    # Cập nhật ORDER
                    ProductVariant.objects.update(order=variant.id)
                    # CREATE VARIANT_ATTRIBUTE
                    attribute_id = attribute_data.get('attribute_id')
                    VariantAttribute.objects.create(
                        value=AttributeValue.objects.get(value=attribute_data.get('value', ''), attribute=attribute_id),
                        variant=variant
                    )
            else: # nếu sản phẩm không có biến thể
                # Create PRODUCT_VARIANT
                ProductVariant.objects.create(
                    variant_name=product.prod_name,
                    sku="",
                    variant_price=product.prod_price,
                    variant_cost_price=product.prod_cost_price,
                    product=product
                )
        return product
    
    def update(self, instance, validated_data):
        attributes_data = validated_data.pop('attributes', [])
        with transaction.atomic():
            # Cập nhật các thuộc tính của PRODUCT
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            if attributes_data: # Nếu có biến thể
                # Lấy danh sách các ORDER của attribute_values trong request
                new_att_value_ids = {att.get('order') for att in attributes_data if att.get('order')}
                # Lấy danh sách các VALUE của attribute_values hiện có trong database
                existing_variant_ids = {variant.id for variant in ProductVariant.objects.filter(product=instance)}
                existing_att_value_ids = []
                for id in existing_variant_ids:
                    existing_att_value_ids.append(str(VariantAttribute.objects.filter(variant=id).first().value.id))
                existing_value_ids_set = set(existing_att_value_ids)
                # Xóa các ATTRIBUTE_VALUE, PRODUCT_VARIANT không có trong request
                if existing_value_ids_set - new_att_value_ids:
                    for variant_attribute in VariantAttribute.objects.filter(value__in=existing_value_ids_set - new_att_value_ids):
                        variant_attribute.delete()
                        ProductVariant.objects.filter(id=variant_attribute.variant).delete()
                
                for attribute in attributes_data:
                    attribute_id = attribute.get('order')
                    # Nếu ID tồn tại => Cập nhật VARIANT_ATTRIBUTE, PRODUCT_VARIANT
                    if attribute_id and attribute_id in existing_att_value_ids:
                        variant_ids = {i.get('variant') for i in VariantAttribute.objects.filter(id=attribute_id)}
                        update_variant_id = [x for x in variant_ids if x in existing_variant_ids]
                        for id in update_variant_id:
                            VariantAttribute.objects.filter(variant=id).update(
                                value=attribute_id,
                                variant=id
                            )
                            ProductVariant.objects.filter(order=id).update(
                                variant_name=f"{validated_data.get('prod_name', '')} ({attribute.get('value', '')})",
                                sku="",
                                variant_price=validated_data.get('prod_price', 0) + attribute.get('default_extra_price', 0),
                                variant_cost_price=validated_data.get('prod_cost_price', 0) + attribute.get('default_extra_price', 0),
                                order=None
                            )
                    else: #Nếu không có ID => Tạo mới VARIANT_ATTRIBUTE và PRODUCT_VARIANT
                        # Tạo mới PRODUCT_VARIANT
                        created_variant = ProductVariant.objects.create(
                            variant_name=f"{validated_data.get('prod_name', '')} ({attribute.get('value', '')})",
                            sku="",
                            variant_price=validated_data.get('prod_price', 0) + attribute.get('default_extra_price', 0),
                            variant_cost_price=validated_data.get('prod_cost_price', 0) + attribute.get('default_extra_price', 0),
                            product=instance,
                            order=None
                        )
                        # Cập nhật ORDER
                        ProductVariant.objects.filter(id=created_variant.id).update(order=created_variant)
                        # Tạo mới VARIANT_ATTRIBUTE
                        VariantAttribute.objects.create(
                            value=AttributeValue.objects.get(value=attribute.get('value', '')),
                            variant=created_variant.id
                        )
            else: #Nếu không còn biến thể
                existing_variants = ProductVariant.objects.filter(product=instance)
                if not existing_variants.filter(variant_name=None): # Nếu Product ko có biến thể
                    existing_variants.delete() # Xóa các biến thể hiện có
                ProductVariant.objects.create(
                    variant_name=instance.prod_name,
                    sku="",
                    variant_price=instance.prod_price,
                    variant_cost_price=instance.prod_cost_price,
                    product=instance
                )
        return instance