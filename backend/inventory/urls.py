from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    StockDocumentViewSet,
    SupplierViewSet,
    dashboard_summary,
    reports_export_csv,
    reports_summary,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'stock-documents', StockDocumentViewSet, basename='stock-document')

urlpatterns = [
    path('dashboard/', dashboard_summary, name='dashboard-summary'),
    path('reports/', reports_summary, name='reports-summary'),
    path('reports/export/', reports_export_csv, name='reports-export-csv'),
    path('', include(router.urls)),
]
