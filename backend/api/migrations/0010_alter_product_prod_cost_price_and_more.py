# Generated by Django 5.1.7 on 2025-03-23 02:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_remove_inventory_product_inventory_variant'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='prod_cost_price',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='product',
            name='prod_price',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='product',
            name='taxes',
            field=models.IntegerField(default=0),
        ),
    ]
