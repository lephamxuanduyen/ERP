# Generated by Django 5.1.7 on 2025-03-30 16:17

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_rewardtier_customer_tier'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='loyaltyprogram',
            name='reward_tier',
        ),
        migrations.AddField(
            model_name='loyaltyprogram',
            name='last_updated',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='rewardtier',
            name='min_points',
            field=models.IntegerField(default=0),
        ),
        migrations.CreateModel(
            name='LoyaltyReward',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reward_type', models.CharField(blank=True, choices=[('DISCOUNT', 'Discount'), ('COUPON', 'Coupon')], max_length=10, null=True)),
                ('coupon', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.coupon')),
                ('discount', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.discount')),
                ('tier', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.rewardtier')),
            ],
        ),
        migrations.CreateModel(
            name='PointTransactions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points_earned', models.FloatField(default=0)),
                ('points_used', models.FloatField(default=0)),
                ('customer', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.customer')),
                ('order', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.order')),
            ],
        ),
        migrations.DeleteModel(
            name='LoyaltyDiscount',
        ),
    ]
