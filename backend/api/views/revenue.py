from django.db.models import Sum
from django.db.models.functions import TruncWeek, TruncMonth, TruncYear
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework import status
from ..models import Order
from ..serializers import EmptySerializer


class RevenueStatisticsAPIView(APIView):
    # serializer_class = EmptySerializer
    permission_classes = [AllowAny]
    
    def get(self, request):
        period = request.query_params.get("period", "month").lower()  # default: month
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        queryset = Order.objects.filter(status=Order.Status.COMPLETE)

        # Lọc theo khoảng thời gian nếu có
        if start_date:
            queryset = queryset.filter(order_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(order_date__lte=end_date)

        # Chọn kiểu thống kê
        if period == "week":
            trunc_func = TruncWeek
        elif period == "year":
            trunc_func = TruncYear
        else:  # mặc định là theo tháng
            trunc_func = TruncMonth

        data = (
            queryset
            .annotate(period=trunc_func("order_date"))
            .values("period")
            .annotate(total=Sum("total_amount"))
            .order_by("period")
        )
        
        # Chuyển định dạng datetime -> string cho JSON
        formatted_data = [
            {
                'period': item['period'].strftime('%Y-%m-%d'),
                'total_amount': item['total']
            }
            for item in data
        ]

        return Response(formatted_data, status=status.HTTP_200_OK)
