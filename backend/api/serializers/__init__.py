from .user import UserSerializer, CustomTokenObtainPairSerializer
from .supply import SupplierSerializer, PurchaseOrderSerializer
from .attribute import UnitSerializer, AttributeSerializer, AttributeValueSerializer
from .product import CategorySerializer, ProductSerializer, ProductVariantSerializer
from .promotion import DiscountSerializer, CouponSerializer, CustomerSerializer, LoyaltyProgramSerializer, RewardTierSerializer, LoyaltyRewardSerializer, PromotionConditionSerializer
from .order import OrderSerializer
from .invoice import InvoiceSerializer
from .order_utils import MergeOrderSerializer, SplitOrderSerializer, ReturnOrderSerializer
from .inventory import InventoryBatchExpiryWarningSerializer, InvertorySerializer
from rest_framework import serializers

class EmptySerializer(serializers.Serializer):
    pass