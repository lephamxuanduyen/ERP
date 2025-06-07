from rest_framework.permissions import AllowAny
from rest_framework.pagination import LimitOffsetPagination
from rest_framework import generics
from ..serializers import DiscountSerializer, CouponSerializer, RewardTierSerializer, LoyaltyRewardSerializer, PromotionConditionSerializer
from ..models import Discount, Coupon, RewardTier, LoyaltyReward, PromotionCondition

class DiscountListCreate(generics.ListCreateAPIView):
    serializer_class = DiscountSerializer
    pagination_class = LimitOffsetPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        name=self.request.query_params.get('name')
        product = self.request.query_params.get('product')
        prod_id = self.request.query_params.get('prod_id')
         
        if prod_id:
            return Discount.objects.filter(variant=prod_id)
        if name: 
            return Discount.objects.filter(discount_name__icontains=name)
        if product: 
            return Discount.objects.filter(
            variant__variant_name__icontains=product
        ) | Discount.objects.filter(
            variant__sku__icontains=product
        )
        return Discount.objects.all()
    

class DiscountDetail(generics.RetrieveAPIView):
    serializer_class = DiscountSerializer
    queryset = Discount.objects.all()
    permission_classes = [AllowAny]
    
    
class DiscountUpdate(generics.UpdateAPIView):
    serializer_class = DiscountSerializer
    queryset = Discount.objects.all()
    permission_classes = [AllowAny]
    
    
class DiscountDelete(generics.DestroyAPIView):
    serializer_class = DiscountSerializer
    queryset = Discount.objects.all()
    permission_classes = [AllowAny]
    
    
class CouponListCreate(generics.ListCreateAPIView):
    serializer_class = CouponSerializer
    pagination_class = LimitOffsetPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        code = self.request.query_params.get('code')
        if code:
            return Coupon.objects.filter(code__icontains=code)
        return Coupon.objects.all()


class CouponDetail(generics.RetrieveAPIView):
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    permission_classes = [AllowAny]
    
    
class CouponUpdate(generics.UpdateAPIView):
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    permission_classes = [AllowAny]
    
    
class CouponDelete(generics.DestroyAPIView):
    serializer_class = CouponSerializer
    queryset = Coupon.objects.all()
    permission_classes = [AllowAny]
    
    
class RewardTierListCreate(generics.ListCreateAPIView):
    serializer_class = RewardTierSerializer
    pagination_class = LimitOffsetPagination
    queryset = RewardTier.objects.all()
    permission_classes = [AllowAny]
    
    
class RewardTierDetail(generics.RetrieveAPIView):
    serializer_class = RewardTierSerializer
    queryset = RewardTier.objects.all()
    permission_classes = [AllowAny]
    
    
class RewardTierUpdate(generics.UpdateAPIView):
    serializer_class = RewardTierSerializer
    queryset = RewardTier.objects.all()
    permission_classes = [AllowAny]
    
    
class RewardTierDelete(generics.DestroyAPIView):
    serializer_class = RewardTierSerializer
    queryset = RewardTier.objects.all()
    permission_classes = [AllowAny]
    
    
class LoyaltyTierListCreate(generics.ListCreateAPIView):
    serializer_class = LoyaltyRewardSerializer
    pagination_class = LimitOffsetPagination
    queryset = LoyaltyReward.objects.all()
    permission_classes = [AllowAny]
    
    
class LoyaltyTierDetail(generics.RetrieveAPIView):
    serializer_class = LoyaltyRewardSerializer
    queryset = LoyaltyReward.objects.all()
    permission_classes = [AllowAny]
    
    
class LoyaltyTierUpdate(generics.UpdateAPIView):
    serializer_class = LoyaltyRewardSerializer
    queryset = LoyaltyReward.objects.all()
    permission_classes = [AllowAny]
    
    
class LoyaltyTierDelete(generics.DestroyAPIView):
    serializer_class = LoyaltyRewardSerializer
    queryset = LoyaltyReward.objects.all()
    permission_classes = [AllowAny]
    
    
class PromotionConditionListCreate(generics.ListCreateAPIView):
    serializer_class = PromotionConditionSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        discount = self.request.query_params.get('discount')
        coupon = self.request.query_params.get('coupon')
        if discount:
            return PromotionCondition.objects.filter(discount=discount)
        if coupon:
            return PromotionCondition.objects.filter(coupon=coupon)
        return PromotionCondition.objects.all()
    
    
class PromotionConditionDetail(generics.RetrieveAPIView):
    serializer_class = PromotionConditionSerializer
    permission_classes = [AllowAny]
    queryset = PromotionCondition.objects.all()
    
    
    
class PromotionConditionUpdate(generics.UpdateAPIView):
    serializer_class = PromotionConditionSerializer
    queryset = PromotionCondition.objects.all()
    permission_classes = [AllowAny]
    
    
class PromotionConditionDelete(generics.DestroyAPIView):
    serializer_class = PromotionConditionSerializer
    queryset = PromotionCondition.objects.all()
    permission_classes = [AllowAny]