import csv
from decimal import Decimal

from django.db.models import Count, DecimalField, ExpressionWrapper, F, Q, Sum
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import mixins, status, viewsets
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


LOW_STOCK_THRESHOLD = 10
REPORT_PERIODS = {
    "day": TruncDate,
    "week": TruncWeek,
    "month": TruncMonth,
}


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
        "low_stock": Product.objects.filter(
            quantity__gt=0,
            quantity__lte=LOW_STOCK_THRESHOLD,
        ).count(),
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


def _line_value_expression():
    return ExpressionWrapper(
        F("quantity") * F("unit_price"),
        output_field=DecimalField(max_digits=18, decimal_places=2),
    )


def _product_value_expression():
    return ExpressionWrapper(
        F("quantity") * F("price"),
        output_field=DecimalField(max_digits=18, decimal_places=2),
    )


def _number(value):
    if value is None:
        return 0
    if isinstance(value, Decimal):
        return float(value)
    return value


def _parse_report_filters(query_params):
    errors = {}
    filters = {}

    date_from = query_params.get("date_from")
    date_to = query_params.get("date_to")
    transaction_type = query_params.get("transaction_type")
    period = query_params.get("period") or "day"

    if date_from:
        parsed_date_from = parse_date(date_from)
        if parsed_date_from is None:
            errors["date_from"] = "Ngày bắt đầu không hợp lệ."
        else:
            filters["date_from"] = parsed_date_from

    if date_to:
        parsed_date_to = parse_date(date_to)
        if parsed_date_to is None:
            errors["date_to"] = "Ngày kết thúc không hợp lệ."
        else:
            filters["date_to"] = parsed_date_to

    if (
        filters.get("date_from")
        and filters.get("date_to")
        and filters["date_from"] > filters["date_to"]
    ):
        errors["date_range"] = "Ngày bắt đầu không được lớn hơn ngày kết thúc."

    if transaction_type:
        valid_types = StockDocument.TransactionType.values
        if transaction_type not in valid_types:
            errors["transaction_type"] = "Loại phiếu không hợp lệ."
        else:
            filters["transaction_type"] = transaction_type

    if period not in REPORT_PERIODS:
        errors["period"] = "Kỳ thống kê không hợp lệ."
    else:
        filters["period"] = period

    for param_name in ("category", "supplier"):
        param_value = query_params.get(param_name)
        if not param_value:
            continue

        try:
            filters[f"{param_name}_id"] = int(param_value)
        except (TypeError, ValueError):
            errors[param_name] = "Bộ lọc phải là mã số hợp lệ."

    return filters, errors


def _filter_inventory_products(filters):
    products = Product.objects.select_related("category", "supplier")

    if filters.get("category_id"):
        products = products.filter(category_id=filters["category_id"])
    if filters.get("supplier_id"):
        products = products.filter(supplier_id=filters["supplier_id"])

    return products


def _filter_report_items(filters):
    items = StockDocumentItem.objects.select_related(
        "document",
        "document__supplier",
        "document__created_by",
        "product",
        "product__category",
        "product__supplier",
    )

    if filters.get("date_from"):
        items = items.filter(document__created_at__date__gte=filters["date_from"])
    if filters.get("date_to"):
        items = items.filter(document__created_at__date__lte=filters["date_to"])
    if filters.get("transaction_type"):
        items = items.filter(document__transaction_type=filters["transaction_type"])
    if filters.get("category_id"):
        items = items.filter(product__category_id=filters["category_id"])
    if filters.get("supplier_id"):
        items = items.filter(product__supplier_id=filters["supplier_id"])

    return items


def _format_bucket_label(bucket, period):
    bucket_date = bucket.date() if hasattr(bucket, "date") else bucket

    if period == "month":
        return f"{bucket_date:%m/%Y}"
    if period == "week":
        return f"Tuần {bucket_date:%d/%m}"
    return f"{bucket_date:%d/%m/%Y}"


def _build_inventory_report(products):
    product_value = _product_value_expression()
    totals = products.aggregate(
        total_products=Count("id"),
        total_stock=Sum("quantity"),
        total_value=Sum(product_value),
        low_stock_count=Count(
            "id",
            filter=Q(quantity__gt=0, quantity__lte=LOW_STOCK_THRESHOLD),
        ),
        out_of_stock_count=Count("id", filter=Q(quantity=0)),
    )

    by_category = [
        {
            "id": row["category"],
            "name": row["category__name"] or "Chưa phân loại",
            "product_count": row["product_count"],
            "total_stock": row["total_stock"] or 0,
            "total_value": _number(row["total_value"]),
        }
        for row in products.values("category", "category__name")
        .annotate(
            product_count=Count("id"),
            total_stock=Sum("quantity"),
            total_value=Sum(product_value),
        )
        .order_by("-total_stock", "category__name")
    ]

    by_supplier = [
        {
            "id": row["supplier"],
            "name": row["supplier__name"] or "Chưa có nhà cung cấp",
            "product_count": row["product_count"],
            "total_stock": row["total_stock"] or 0,
            "total_value": _number(row["total_value"]),
        }
        for row in products.values("supplier", "supplier__name")
        .annotate(
            product_count=Count("id"),
            total_stock=Sum("quantity"),
            total_value=Sum(product_value),
        )
        .order_by("-total_stock", "supplier__name")
    ]

    low_stock_products = [
        {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "quantity": product.quantity,
            "unit": product.unit,
            "category_name": product.category.name if product.category else "",
            "supplier_name": product.supplier.name if product.supplier else "",
        }
        for product in products.filter(quantity__lte=LOW_STOCK_THRESHOLD).order_by(
            "quantity",
            "name",
        )[:10]
    ]

    return {
        "total_products": totals["total_products"] or 0,
        "total_stock": totals["total_stock"] or 0,
        "total_value": _number(totals["total_value"]),
        "low_stock_count": totals["low_stock_count"] or 0,
        "out_of_stock_count": totals["out_of_stock_count"] or 0,
        "low_stock_threshold": LOW_STOCK_THRESHOLD,
        "by_category": by_category,
        "by_supplier": by_supplier,
        "low_stock_products": low_stock_products,
    }


def _build_movement_report(items, period):
    line_value = _line_value_expression()
    totals = items.aggregate(
        total_in=Sum(
            "quantity",
            filter=Q(document__transaction_type=StockDocument.TransactionType.IN),
        ),
        total_out=Sum(
            "quantity",
            filter=Q(document__transaction_type=StockDocument.TransactionType.OUT),
        ),
        total_in_value=Sum(
            line_value,
            filter=Q(document__transaction_type=StockDocument.TransactionType.IN),
        ),
        total_out_value=Sum(
            line_value,
            filter=Q(document__transaction_type=StockDocument.TransactionType.OUT),
        ),
        document_count=Count("document", distinct=True),
        line_count=Count("id"),
    )

    bucket_function = REPORT_PERIODS[period]
    timeline_map = {}
    timeline_rows = (
        items.annotate(bucket=bucket_function("document__created_at"))
        .values("bucket", "document__transaction_type")
        .annotate(
            total_quantity=Sum("quantity"),
            total_value=Sum(line_value),
            document_count=Count("document", distinct=True),
        )
        .order_by("bucket")
    )

    for row in timeline_rows:
        bucket = row["bucket"]
        if bucket is None:
            continue

        bucket_date = bucket.date() if hasattr(bucket, "date") else bucket
        bucket_key = bucket_date.isoformat()
        timeline_map.setdefault(
            bucket_key,
            {
                "period": bucket_key,
                "label": _format_bucket_label(bucket, period),
                "stock_in": 0,
                "stock_out": 0,
                "stock_in_value": 0,
                "stock_out_value": 0,
                "transaction_count": 0,
            },
        )

        target = timeline_map[bucket_key]
        if row["document__transaction_type"] == StockDocument.TransactionType.IN:
            target["stock_in"] = row["total_quantity"] or 0
            target["stock_in_value"] = _number(row["total_value"])
        else:
            target["stock_out"] = row["total_quantity"] or 0
            target["stock_out_value"] = _number(row["total_value"])
        target["transaction_count"] += row["document_count"] or 0

    total_in = totals["total_in"] or 0
    total_out = totals["total_out"] or 0

    return {
        "period": period,
        "total_in": total_in,
        "total_out": total_out,
        "net_change": total_in - total_out,
        "total_in_value": _number(totals["total_in_value"]),
        "total_out_value": _number(totals["total_out_value"]),
        "document_count": totals["document_count"] or 0,
        "line_count": totals["line_count"] or 0,
        "timeline": list(timeline_map.values()),
    }


def _build_top_products(items, transaction_type):
    line_value = _line_value_expression()

    return [
        {
            "product_name": row["product_name"],
            "product_sku": row["product_sku"],
            "total_quantity": row["total_quantity"] or 0,
            "total_value": _number(row["total_value"]),
            "transaction_count": row["transaction_count"],
        }
        for row in items.filter(document__transaction_type=transaction_type)
        .values("product_name", "product_sku")
        .annotate(
            total_quantity=Sum("quantity"),
            total_value=Sum(line_value),
            transaction_count=Count("document", distinct=True),
        )
        .order_by("-total_quantity", "product_name")[:8]
    ]


def _build_transaction_rows(items):
    transactions = {}

    for item in items.order_by("-document__created_at", "-document__code", "id"):
        document = item.document
        row = transactions.setdefault(
            document.id,
            {
                "id": document.id,
                "code": document.code,
                "transaction_type": document.transaction_type,
                "partner": (
                    document.supplier.name
                    if document.supplier
                    else document.recipient or ""
                ),
                "created_by_username": (
                    document.created_by.username if document.created_by else ""
                ),
                "created_at": document.created_at,
                "note": document.note,
                "item_count": 0,
                "total_quantity": 0,
                "total_value": Decimal("0"),
                "product_summary": "",
                "items": [],
            },
        )

        line_value = item.quantity * item.unit_price
        row["item_count"] += 1
        row["total_quantity"] += item.quantity
        row["total_value"] += line_value
        row["items"].append(
            {
                "product_name": item.product_name,
                "product_sku": item.product_sku,
                "quantity": item.quantity,
                "unit_price": _number(item.unit_price),
                "line_value": _number(line_value),
                "stock_before": item.stock_before,
                "stock_after": item.stock_after,
            }
        )

    for row in transactions.values():
        first_item = row["items"][0] if row["items"] else None
        if not first_item:
            row["product_summary"] = "Không có sản phẩm"
        elif row["item_count"] == 1:
            row["product_summary"] = first_item["product_name"]
        else:
            row["product_summary"] = (
                f"{first_item['product_name']} +{row['item_count'] - 1} sản phẩm"
            )
        row["total_value"] = _number(row["total_value"])

    return list(transactions.values())


def _build_report_payload(filters):
    products = _filter_inventory_products(filters)
    items = _filter_report_items(filters)

    return {
        "filters": {
            "date_from": filters.get("date_from"),
            "date_to": filters.get("date_to"),
            "transaction_type": filters.get("transaction_type", ""),
            "category": filters.get("category_id", ""),
            "supplier": filters.get("supplier_id", ""),
            "period": filters["period"],
        },
        "inventory": _build_inventory_report(products),
        "movement": _build_movement_report(items, filters["period"]),
        "top_products": {
            "stock_in": _build_top_products(items, StockDocument.TransactionType.IN),
            "stock_out": _build_top_products(items, StockDocument.TransactionType.OUT),
        },
        "transactions": _build_transaction_rows(items),
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reports_summary(request):
    filters, errors = _parse_report_filters(request.query_params)

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    return Response(_build_report_payload(filters))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reports_export_csv(request):
    filters, errors = _parse_report_filters(request.query_params)

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    filename = f"inventory-report-{timezone.localdate():%Y%m%d}.csv"
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{filename}"'
    response.write("\ufeff")

    writer = csv.writer(response)
    writer.writerow(
        [
            "Mã phiếu",
            "Loại phiếu",
            "Thời gian",
            "Đối tác",
            "Người tạo",
            "Sản phẩm",
            "SKU",
            "Số lượng",
            "Đơn giá",
            "Thành tiền",
            "Tồn trước",
            "Tồn sau",
            "Ghi chú",
        ]
    )

    items = _filter_report_items(filters).order_by(
        "document__created_at",
        "document__code",
        "id",
    )

    for item in items:
        document = item.document
        line_value = item.quantity * item.unit_price
        writer.writerow(
            [
                document.code,
                "Nhập kho"
                if document.transaction_type == StockDocument.TransactionType.IN
                else "Xuất kho",
                timezone.localtime(document.created_at).strftime("%d/%m/%Y %H:%M"),
                document.supplier.name if document.supplier else document.recipient,
                document.created_by.username if document.created_by else "",
                item.product_name,
                item.product_sku,
                item.quantity,
                item.unit_price,
                line_value,
                item.stock_before,
                item.stock_after,
                document.note,
            ]
        )

    return response
