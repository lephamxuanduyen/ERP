from rest_framework import serializers
from ..models import Unit, Attribute, AttributeValue
from django.db import transaction       


class UnitSerializer(serializers.ModelSerializer):
    reference_unit_name = serializers.CharField(source='unit_name', read_only=True)
    class Meta:
        model = Unit
        fields = ['id', 'unit_name', 'contains', 'reference_unit', 'reference_unit_name']
        

class AttributeValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeValue
        fields = ['id', 'value', 'default_extra_price', 'color', 'attribute', 'order', 'image']
        extra_kwargs = {
            'id': { 'read_only': True },
            'color': { 'allow_null':True, 'allow_blank':True },
            # 'attribute': { 'read_only': True },
        }
        
        
class AttributeSerializer(serializers.ModelSerializer):
    values = AttributeValueSerializer(
        many=True,
        required=False, 
        read_only=False
        )
    
    class Meta: 
        model = Attribute
        fields = ['id', 'att_name', 'display_type', 'values']
        
    def create(self, validated_data):
        values_data = validated_data.pop('values', [])
        with transaction.atomic():
            attribute = Attribute.objects.create(**validated_data)
            values = []
            for value_data in values_data:
                attribute_value = AttributeValue(
                    attribute=attribute,
                    value=value_data['value'],
                    color=value_data['color'],
                    default_extra_price=value_data['default_extra_price'],
                    order=None
                )
                values.append(attribute_value)
            # Bulk create
            created_values = AttributeValue.objects.bulk_create(values)
            # Cập nhật Order
            for value in created_values:
                value.order = str(value.id)
            # Bulk update
            if created_values:
                AttributeValue.objects.bulk_update(created_values, ['order'])
        return attribute
    
    def update(self, instance, validated_data):
        values_data = validated_data.pop('values', [])
        
        with transaction.atomic():
            # Cập nhật các thuộc tính của Attribute
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            # Lấy danh sách các Value của values trong request
            new_value = {value_data.get('value') for value_data in values_data if value_data.get('value')}
            # Lấy danh sách các value hiện có trong database
            existing_value = set(instance.values.values_list('value', flat=True))
            # Xóa các AttributeValue không có trong request
            instance.values.filter(value__in=existing_value - new_value).delete()

            for value_data in values_data:
                value = value_data.get('value')
                if value and value in existing_value:
                    # Nếu ID tồn tại => Cập nhật
                    AttributeValue.objects.filter(value=value).update(
                        value=value_data.get('value', ''),
                        default_extra_price=value_data.get('default_extra_price', 0),
                        color=value_data.get('color', ''),
                        order=value_data.get('order', '')
                    )
                else:
                    # Nếu không có ID => Tạo mới
                    created_attribute = AttributeValue.objects.create(
                        attribute=instance,
                        value=value_data.get('value'),
                        default_extra_price=value_data.get('default_extra_price', 0),
                        color=value_data.get('color', ''),
                        order=None
                    )
                    # Cập nhật ORDER
                    AttributeValue.objects.filter(id=created_attribute.id).update(order=created_attribute.id)
        return instance