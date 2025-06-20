# Generated by Django 5.1.7 on 2025-04-12 17:52

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0028_delete_returnorder'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ReturnOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('return_date', models.DateField(auto_now=True)),
                ('total_refurn', models.IntegerField(default=0)),
                ('note', models.CharField(max_length=1000)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('APPROVE', 'Approved'), ('CANCELED', 'Canceled'), ('REFUNDED', 'Refunded')], default='PENDING', max_length=10)),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.customer')),
                ('handled_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.order')),
            ],
        ),
    ]
