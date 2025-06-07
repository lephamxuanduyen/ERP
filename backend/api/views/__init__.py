from .customer import CustomerListCreate, CustomerDetail, CustomerDelete, CustomerUpdate
from .user import CreateUserView, CustomTokenObtainPairView
from .supply import SupplierListCreate, SupplierDetail, SupplierDelete, SupplierUpdate, PurchaseOrderListCreate, PurchaseOrderDetail, PurchaseOrderUpdate
from .unit import UnitListCreate, UnitDetail, UnitUpdate, UnitDelete
from .attribute import AttributeListCreate, AttributeDetail, AttributeUpdate, AttributeDelete, AttributeValueListCreate, AttributeValueDetail, AttributeValueUpdate, AttributeValueDelete
from .product import CategoryListCreate, CategoryDetail, CategoryUpdate, CategoryDelete, ProductListCreate, ProductDetail, ProductUpdate, ProductDelete , VariantListCreate, VariantDetail, VariantUpdate, VariantDelete
from .promotion import DiscountListCreate, DiscountDetail, DiscountUpdate, DiscountDelete, CouponListCreate, CouponDetail, CouponUpdate, CouponDelete, RewardTierListCreate, RewardTierDetail, RewardTierUpdate, RewardTierDelete, LoyaltyTierListCreate, LoyaltyTierDetail, LoyaltyTierUpdate, LoyaltyTierDelete, PromotionConditionListCreate, PromotionConditionDetail, PromotionConditionDelete, PromotionConditionUpdate
from .order import OrderListCreate, OrderDetail, OrderUpdate
from .order_utils import MergeOrderAPIView, SplitOrderAPIview, ReturnOrderAPIView
from .invoice import InvoiceListCreate, InvoiceDetail
from .revenue import RevenueStatisticsAPIView
from .inventory import ExpiryWarningAPIView, QuantityVariantByAttributeAPIView