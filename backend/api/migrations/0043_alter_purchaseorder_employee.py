# Generated by Django 4.2.8 on 2025-06-02 14:49

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0042_alter_order_employee'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchaseorder',
            name='employee',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
