from django.contrib import admin
from .models import Category, Product, StockDocument, StockDocumentItem, Supplier


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at")
    search_fields = ("name",)


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "phone", "email", "created_at")
    search_fields = ("name", "phone", "email")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "sku",
        "category",
        "supplier",
        "price",
        "quantity",
        "unit",
        "created_at",
    )
    list_filter = ("category", "supplier", "unit")
    search_fields = ("name", "sku")


class StockDocumentItemInline(admin.TabularInline):
    model = StockDocumentItem
    extra = 0
    readonly_fields = (
        "product",
        "product_name",
        "product_sku",
        "quantity",
        "unit_price",
        "stock_before",
        "stock_after",
    )
    can_delete = False


@admin.register(StockDocument)
class StockDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "transaction_type",
        "supplier",
        "recipient",
        "created_by",
        "created_at",
    )
    list_filter = ("transaction_type", "supplier", "created_at")
    search_fields = ("code", "recipient", "supplier__name")
    readonly_fields = (
        "code",
        "transaction_type",
        "supplier",
        "recipient",
        "note",
        "created_by",
        "created_at",
    )
    inlines = [StockDocumentItemInline]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
