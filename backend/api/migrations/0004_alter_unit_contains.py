# Generated by Django 5.1.7 on 2025-03-20 12:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_alter_purchaseorder_employee_alter_order_employee_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='unit',
            name='contains',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
