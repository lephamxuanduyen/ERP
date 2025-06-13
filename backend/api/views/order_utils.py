from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import transaction
from ..serializers import OrderSerializer, MergeOrderSerializer, SplitOrderSerializer, ReturnOrderSerializer
from ..models import Order


class MergeOrderAPIView(generics.GenericAPIView):
    serializer_class = MergeOrderSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        order_ids = request.data.get("order_id", [])
        
        try: 
            with transaction.atomic():
                orders = Order.objects.filter(id__in=order_ids, status=Order.Status.PENDING)
                
                if orders.count() != len(order_ids):
                    return Response({"error": "Một số đơn hàng không hợp lệ hoặc không ở trạng thái PENDING"}, status=status.HTTP_400_BAD_REQUEST)
                
                base_order = orders.first()
                total = base_order.total_amount
                
                for order in orders.exclude(id=base_order.id):
                    for detail in order.details.all():
                        detail.order = base_order
                        detail.save()
                        total += detail.total
                    order.status = Order.Status.CANCEL
                    order.save()
                
                base_order.total_amount = total
                base_order.save()
                
                return Response({"message": "Gộp đơn thành công", "merged_order_id": base_order.id})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                        
    
class SplitOrderAPIview(generics.GenericAPIView):
    serializer_class = SplitOrderSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        order_id = serializer.validated_data["order_id"]
        split_items = serializer.validated_data["split_items"]

        try:
            with transaction.atomic():
                original_order = Order.objects.get(id=order_id, status=Order.Status.PENDING)

                # Tạo đơn mới
                new_order = Order.objects.create(
                    customer=original_order.customer,
                    employee=original_order.employee,
                    status=Order.Status.PENDING,
                )

                total_new = 0

                for item in split_items:
                    detail = OrderDetail.objects.get(id=item["detail_id"], order=original_order)
                    split_qty = item["qty"]

                    if split_qty >= detail.qty or split_qty <= 0:
                        raise ValueError(f"Số lượng tách không hợp lệ cho item {detail.id}")

                    # Cập nhật lại đơn gốc
                    detail.qty -= split_qty
                    detail.total = detail.qty * detail.variant.variant_price
                    detail.save()

                    # Thêm vào đơn mới
                    total = split_qty * detail.variant.variant_price
                    OrderDetail.objects.create(
                        variant=detail.variant,
                        order=new_order,
                        qty=split_qty,
                        total=total,
                        unit=detail.unit,
                    )
                    total_new += total

                new_order.total_amount = total_new
                new_order.save()

                return Response(OrderSerializer(new_order).data, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

class ReturnOrderAPIView(generics.GenericAPIView):
    serializer_class = ReturnOrderSerializer
    permission_classes = [AllowAny]  # Thêm quyền nếu cần

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        return_details = data.pop('return_details')

        try:
            with transaction.atomic():
                return_order = ReturnOrder.objects.create(**data)
                total_refund = 0

                for detail in return_details:
                    refund_amount = detail['qty'] * detail['unit_price']
                    ReturnDetail.objects.create(
                        return_order=return_order,
                        variant=detail['variant'],
                        qty=detail['qty'],
                        unit_price=detail['unit_price'],
                        refund_amount=refund_amount,
                        reason=detail['reason'],
                        unit=detail['unit']
                    )
                    total_refund += refund_amount

                    # Cập nhật tồn kho (Inventory)
                    inventory, _ = Inventory.objects.get_or_create(
                        variant=detail['variant'],
                        unit=detail['unit'],
                        defaults={'quantity_in': 0, 'quantity_out': 0, 'balance': 0}
                    )
                    inventory.quantity_in += detail['qty']
                    inventory.balance += detail['qty']
                    inventory.save()

                    # Cập nhật batch: bạn có thể xử lý theo nguyên tắc nhập mới
                    InventoryBatch.objects.create(
                        variant=detail['variant'],
                        unit=detail['unit'],
                        qty=detail['qty'],
                        expiry_date=timezone.now().date() + timedelta(days=180),  # Giả sử 6 tháng
                        purchase_price=detail['unit_price']
                    )

                return_order.total_refurn = total_refund
                return_order.save()

                return Response(ReturnOrderSerializer(return_order).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
