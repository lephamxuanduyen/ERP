from rest_framework import serializers
from ..models import Invoice, Order, LoyaltyReward, PointTransactions, LoyaltyProgram, RewardTier
from django.db import transaction


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model=Invoice
        fields=['id', 'order', 'payment_status', 'create_at', 'total_amount', 'amount_received', 'amount_change']
        read_only_fields = ['amount_change', 'payment_status']
        
    def create(self, validated_data):
        order = validated_data.get('order')

        if not order or order.status.upper() != "PENDING":
            raise serializers.ValidationError("Order must be in PENDING status.")

        total_amount = validated_data.get('total_amount', 0)
        amount_received = validated_data.get('amount_received', 0)
        validated_data['amount_change'] = amount_received - total_amount

        customer = order.customer
        coupon = order.coupon
        coupon_id = coupon.id if coupon else None

        loyalty_reward = LoyaltyReward.objects.filter(
            tier=customer.tier.id,
            coupon=coupon_id
        ).first()
        points_used = loyalty_reward.points_required if loyalty_reward else 0
        exchange_rate = customer.tier.exchange_rate or 1
        points_earned = total_amount // exchange_rate

        loyalty_program = LoyaltyProgram.objects.get(customer=customer)
        new_points = loyalty_program.points + points_earned - points_used

        with transaction.atomic():
            # Tạo invoice
            invoice = Invoice.objects.create(**validated_data)

            # Ghi nhận giao dịch điểm
            PointTransactions.objects.create(
                points_earned=points_earned,
                points_used=points_used,
                customer=customer,
                order=order
            )

            # Cập nhật điểm mới
            loyalty_program.points = new_points
            loyalty_program.save()

            # Cập nhật tier nếu cần
            for tier in RewardTier.objects.all().order_by('-min_points'):
                if new_points >= tier.min_points:
                    customer.tier = tier
                    break
            customer.save()

            # Cập nhật trạng thái thanh toán và nợ
            if amount_received == 0:
                invoice.payment_status = "UNPAID"
            elif amount_received >= total_amount:
                invoice.payment_status = "PAID"
                order.status = "COMPLETE"
                order.save()
            else:
                invoice.payment_status = "PARTIALLY_PAID"
                customer.debt_amount += (total_amount - amount_received)
                customer.save()

            invoice.save()
            return invoice
'''
Tạo mới Invoice
Invoice => Lấy Order => Lấy coupon => lấy Loyalty_Reward => points_required
Invoice => Lấy Order => Lấy Customer => Lấy Loyalty_Program => points
Invoice => Lấy Order => Lấy Customer => Tier => exchange_rate
Invoice => Lấy Order => total_amount

if total_paid = 0 => status = UNPAID [OK]
if total_amount<=total_paid => status = PAID, Order.Status = COMPLETED [OK]
if total_amount> total_paid => status = PARTIALLY_PAID, update Customer.debt_amount += total_amount - total_paid [OK]

=> Tạo mới Point_Transactions
{
    points_earned: total_amount / exchange_rate,
    points_used: point_required,
    customer,
    order
}
=> Update Loyalty_Program
{
    points: points + points_earned - points_used
}
'''