# Generated by Django 5.1.7 on 2025-04-21 06:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0036_alter_attribute_display_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='prod_type',
            field=models.CharField(choices=[('GOOD', 'Good'), ('SERVICE', 'Service')], default='GOOD', max_length=10),
        ),
    ]
