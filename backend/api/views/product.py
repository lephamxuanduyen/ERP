from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.pagination import LimitOffsetPagination
from ..models import Category, Product, ProductVariant
from ..serializers import CategorySerializer, ProductSerializer, ProductVariantSerializer


class CategoryListCreate(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    pagination_class = LimitOffsetPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        category = self.request.query_params.get('category_name')
        product = self.request.query_params.get('product_name')
        if category:
            return Category.objects.filter(cate_name__icontains=category)
        if product: 
            return Category.objects.filter(product__prod_name__icontains=product)
        return Category.objects.all()
    
    
class CategoryDetail(generics.RetrieveAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [AllowAny]
    
    
class CategoryUpdate(generics.UpdateAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [AllowAny]
    
    
class CategoryDelete(generics.DestroyAPIView):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    permission_classes = [AllowAny]
    
    
class ProductListCreate(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = LimitOffsetPagination
    
    def get_queryset(self):
        name = self.request.query_params.get('name')
        type = self.request.query_params.get('type')
        cate = self.request.query_params.get('category')
        price= self.request.query_params.get('price')
        if name:
            return Product.objects.filter(prod_name__icontains=name)
        if type:
            return Product.objects.filter(prod_type__icontains=type)
        if cate:
            category_ids = Category.objects.filter(cate_name__icontains=cate).values_list('id', flat=True)
            return Product.objects.filter(category__in=category_ids)
        if price:
            return
        return Product.objects.all()
    
    
class ProductDetail(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    
    
class ProductUpdate(generics.UpdateAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    
    
class ProductDelete(generics.DestroyAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    
    
class VariantListCreate(generics.ListCreateAPIView):
    serializer_class = ProductVariantSerializer
    pagination_class = LimitOffsetPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        name = self.request.query_params.get('name')
        product = self.request.query_params.get('product')
        if name: 
            return ProductVariant.objects.filter(variant_name__icontains=name)
        if product:
            return ProductVariant.objects.filter(product__prod_name__icontains=product)
        return ProductVariant.objects.all()
    
    
class VariantDetail(generics.RetrieveAPIView):
    serializer_class = ProductVariantSerializer
    queryset = ProductVariant.objects.all()
    permission_classes = [AllowAny]
    
    
class VariantUpdate(generics.UpdateAPIView):
    serializer_class = ProductVariantSerializer
    queryset = ProductVariant.objects.all()
    permission_classes = [AllowAny]
    
    
class VariantDelete(generics.DestroyAPIView):
    serializer_class = ProductVariantSerializer
    queryset = ProductVariant.objects.all()
    permission_classes = [AllowAny]