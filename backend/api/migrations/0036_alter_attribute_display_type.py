# Generated by Django 5.1.7 on 2025-04-21 03:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0035_attributevalue_image_product_image_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='attribute',
            name='display_type',
            field=models.CharField(choices=[('RADIO', 'Radio'), ('SELECTION', 'Selection'), ('COLOR', 'Color')], default='RADIO', max_length=10),
        ),
    ]
