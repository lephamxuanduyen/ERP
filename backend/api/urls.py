from django.urls import path
from .views import *


urlpatterns = [
    # MANAGE CUSTOMER
    path('customers/', CustomerListCreate.as_view(), name="customer-list"),
    path('customers/<int:pk>/', CustomerDetail.as_view(), name="customer-detail"),
    # path('customer/delete/<int:pk>/', CustomerDelete.as_view(), name="delete-customer"),
    path('customer/update/<int:pk>/', CustomerUpdate.as_view(), name="update-customer"),
    
    # MANAGE SUPPLIER
    path('suppliers/', SupplierListCreate.as_view(), name='supplier-list'),
    path('suppliers/<int:pk>/', SupplierDetail.as_view(), name='supplier-detail'),
    path('supplier/delete/<int:pk>/', SupplierDelete.as_view(), name="supplier-delete"),
    path('supplier/update/<int:pk>/', SupplierUpdate.as_view(), name="supplier-update"),
    
    # MANAGE UNIT
    path('units/', UnitListCreate.as_view(), name='unit-list'),
    path('units/<int:pk>/', UnitDetail.as_view(), name='unit-detail'),
    path('unit/update/<int:pk>/', UnitUpdate.as_view(), name='unit-update'),
    path('unit/delete/<int:pk>/', UnitDelete.as_view(), name='unit-delete'),
    
    # MANAGE ATTRIBUTE
    path('attributes/', AttributeListCreate.as_view(), name='attribute-list'),
    path('attributes/<int:pk>/', AttributeDetail.as_view(), name='attribute-detail'),
    path('attribute/update/<int:pk>/', AttributeUpdate.as_view(), name='attribute-update'),
    path('attribute/delete/<int:pk>/', AttributeDelete.as_view(), name='attribute-delete'),
    
    # MANAGE ATTRIBUTE VALUE
    path('attribute_value/', AttributeValueListCreate.as_view(), name='attribute-value-list'),
    path('attribute_value/<int:pk>/', AttributeValueDetail.as_view(), name='attribute-value-detail'),
    path('attribute_value/update/<int:pk>/', AttributeValueUpdate.as_view(), name='attribute-value-update'),
    path('attribute_value/delete/<int:pk>/', AttributeValueDelete.as_view(), name='attribute-value-delete'),
    
    # MANAGE CATEGORY
    path('categories/', CategoryListCreate.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetail.as_view(), name='category-detail'),
    path('category/update/<int:pk>/', CategoryUpdate.as_view(), name='category-update'),
    path('category/delete/<int:pk>', CategoryDelete.as_view(), name='category-delete'),
    
    # MANAGE PRODUCT
    path('products/', ProductListCreate.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetail.as_view(), name='product-detail'),
    path('product/update/<int:pk>/', ProductUpdate.as_view(), name='product-update'),
    path('product/delete/<int:pk>/', ProductDelete.as_view(), name='product-delete'),
    
    # MANAGE PRODUCT VARIANT
    path('variants/', VariantListCreate.as_view(), name='variant-list'),
    path('variants/<int:pk>/', VariantDetail.as_view(), name='variant-detail'),
    path('variant/update/<int:pk>/', VariantUpdate.as_view(), name='variant-update'),
    path('variant/delete/<int:pk>/', VariantDelete.as_view(), name='variant-delete'),
    
    # MANAGE PROMATION CONDITION
    path('condition/', PromotionConditionListCreate.as_view(), name='condition-list'),
    path('condition/<int:pk>/', PromotionConditionDetail.as_view(), name='condition-detail'),
    path('condition/update/<int:pk>/', PromotionConditionUpdate.as_view(), name='condition-update'),
    path('condition/delete/<int:pk>/', PromotionConditionDelete.as_view(), name='condition-delete'),
    
    # MANAGE DISCOUNT
    path('discounts/', DiscountListCreate.as_view(), name='discount-list'),
    path('discounts/<int:pk>/', DiscountDetail.as_view(), name='discount-detail'),
    path('discount/update/<int:pk>/', DiscountUpdate.as_view(), name='discount-update'),
    path('discount/delete/<int:pk>/', DiscountDelete.as_view(), name='discount-delete'),
    
    # MANAGE COUPON
    path('coupons/', CouponListCreate.as_view(), name='coupon-list'),
    path('coupons/<int:pk>/', CouponDetail.as_view(), name='coupon-detail'),
    path('coupon/update/<int:pk>/', CouponUpdate.as_view(), name='coupon-update'),
    path('coupon/delete/<int:pk>/', CouponDelete.as_view(), name='coupon-delete'),
    
    # MANAGE REWARD TIER
    path('reward-tiers/', RewardTierListCreate.as_view(), name='reward-tier-list'),
    path('reward-tiers/<int:pk>/', RewardTierDetail.as_view(), name='reward-tier-detail'),
    path('reward-tier/update/<int:pk>/', RewardTierUpdate.as_view(), name='reward-tier-update'),
    path('reward-tier/delete/<int:pk>/', RewardTierDelete.as_view(), name='reward-tier-delete'),
    
    # MANAGE LOYALTY REWARD
    path('loyalty-tiers/', LoyaltyTierListCreate.as_view(), name='loyalty-tier-list'),
    path('loyalty-tiers/<int:pk>/', LoyaltyTierDetail.as_view(), name='loyalty-tier-detail'),
    path('loyalty-tier/update/<int:pk>/', LoyaltyTierUpdate.as_view(), name='loyalty-tier-update'),
    path('loyalty-tier/delete/<int:pk>/', LoyaltyTierDelete.as_view(), name='loyalty-tier-delete'),
    
    # MANAGE ORDER
    path('orders/', OrderListCreate.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetail.as_view(), name='order-detail'),
    path('orders/merge/', MergeOrderAPIView.as_view(), name='merge-order'),
    path('orders/split/', SplitOrderAPIview.as_view(), name="split-order"),
    path('order/update/<int:pk>/', OrderUpdate.as_view(), name='order-update'),
    path('order/return/', ReturnOrderAPIView.as_view(), name='return-order'),

    # MANAGE INVOICE
    path('invoices/', InvoiceListCreate.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', InvoiceDetail.as_view(), name='invoice-detail'),

    # MANAGE PURCHASE
    path('purchases/', PurchaseOrderListCreate.as_view(), name='purchase-list'),
    path('purchases/<int:pk>/', PurchaseOrderDetail.as_view(), name='purchase-detail'),
    path('purchases/update/<int:pk>/', PurchaseOrderUpdate.as_view(), name='purchase-update'),
    # Không sửa/xóa Purchase
    
    # REVENUE
    path('revenue/', RevenueStatisticsAPIView.as_view(), name='revenue-statistics'),
    
    # MANAGE INVENTORY
    path('expiry_warning/', ExpiryWarningAPIView.as_view(), name='expiry-warning'),
    path('quantity_by_attribute/', QuantityVariantByAttributeAPIView.as_view(), name='quantity-by-attribute'),
]