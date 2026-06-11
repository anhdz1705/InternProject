from django.db.models import Sum
from django.utils import timezone
from rest_framework import mixins, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Category, Product, StockDocument, StockDocumentItem, Supplier
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    StockDocumentSerializer,
    SupplierSerializer,
)


class OptionalPaginationMixin:
    def paginate_queryset(self, queryset):
        if self.request.query_params.get("all") == "true":
            return None
        return super().paginate_queryset(queryset)


class CategoryViewSet(OptionalPaginationMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name']
    filterset_fields = ['name']

class SupplierViewSet(OptionalPaginationMixin, viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'phone', 'email']

class ProductViewSet(OptionalPaginationMixin, viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category', 'supplier').all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'sku']
    filterset_fields = ['category', 'supplier', 'unit']
    ordering_fields = ['price', 'quantity', 'created_at']


class StockDocumentViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = StockDocumentSerializer
    permission_classes = [IsAuthenticated]
    search_fields = [
        "code",
        "recipient",
        "supplier__name",
        "items__product_name",
        "items__product_sku",
    ]
    ordering_fields = ["created_at", "code"]
    filterset_fields = ["transaction_type", "supplier", "created_by"]

    def get_queryset(self):
        queryset = StockDocument.objects.select_related(
            "supplier",
            "created_by",
        ).prefetch_related("items")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)

        return queryset.distinct()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    today = timezone.localdate()
    today_items = StockDocumentItem.objects.filter(document__created_at__date=today)
    recent_documents = StockDocument.objects.select_related(
        "supplier",
        "created_by",
    ).prefetch_related("items")[:5]

    summary = {
        "products": Product.objects.count(),
        "categories": Category.objects.count(),
        "suppliers": Supplier.objects.count(),
        "total_stock": Product.objects.aggregate(total=Sum("quantity"))["total"] or 0,
        "low_stock": Product.objects.filter(quantity__gt=0, quantity__lte=10).count(),
        "out_of_stock": Product.objects.filter(quantity=0).count(),
        "stock_in_today": today_items.filter(
            document__transaction_type=StockDocument.TransactionType.IN
        ).aggregate(total=Sum("quantity"))["total"] or 0,
        "stock_out_today": today_items.filter(
            document__transaction_type=StockDocument.TransactionType.OUT
        ).aggregate(total=Sum("quantity"))["total"] or 0,
        "recent_documents": StockDocumentSerializer(recent_documents, many=True).data,
    }
    return Response(summary)
