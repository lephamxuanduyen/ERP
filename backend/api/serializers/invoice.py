from rest_framework import serializers
from ..models import Invoice, Order, LoyaltyReward, PointTransactions, LoyaltyProgram, RewardTier
from django.db import transaction


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model=Invoice
        fields=['id', 'order', 'payment_status', 'create_at', 'total_amount', 'amount_received', 'amount_change']
        read_only_fields = ['amount_change', 'payment_status']
        
    def create(self, validate_data):
        order_id = validate_data.get('order')
        order = Order.objects.get(id=order_id)
        if order and order.status=="PENDING" or order.status=="Pending":
            total_amount = validate_data.get('total_amount', 0)
            amount_received = validate_data.get('amount_received', 0)
            validate_data['amount_change'] = amount_received - total_amount
            order_id = validate_data['order']
            order = Order.objects.get(id=order_id)
            coupon_id = order.coupon.id
            customer = order.customer
            loyalty_reward = LoyaltyReward.objects.filter(tier=customer.tier.id, coupon=coupon_id).first()
            points_used = loyalty_reward.points_required
            exchange_rate = customer.tier.exchange_rate
            points_earned = total_amount // exchange_rate
            points = LoyaltyProgram.objects.get(customer=customer).points - points_used
            with transaction.atomic:
                invoice = Invoice.objects.create(**validate_data)
                PointTransactions.objects.create(
                    points_earned = points_earned,
                    points_used = points_used,
                    customer = customer.id,
                    order = order.id
                )
                LoyaltyProgram.objects.update(points=points + points_earned - points_used)
                
                # Tìm tier của khách hàng => customer.tier.min_points
                
                # For tier trong tất cả Tiers: 
                #   nếu poins > min_points: update hàng của khách hàng => customer.tier = tier, break
                
                for tier in RewardTier.objects.all().order_by('-min_points'):
                    if points > tier.min_points:
                        customer.tier = tier
                        break
                
                if amount_received==0: # khách chưa trả tiền
                    invoice.objects.update(payment_status="UNPAID")
                elif amount_received>=0: # Đã trả hết tiền
                    invoice.objects.update(payment_status="PAID")
                    order.objects.update(status="COMPLETE")
                elif amount_received < 0: # Thiếu tiền, mới trả một phần
                    invoice.objects.update(payment_status="PARTIALLY_PAID")
                    customer.objects.update(customer.debt_amount - invoice.amount_change)   
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