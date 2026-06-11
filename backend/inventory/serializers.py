from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from .models import (
    Category,
    Product,
    StockDocument,
    StockDocumentItem,
    Supplier,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "sku",
            "category",
            "category_name",
            "supplier",
            "supplier_name",
            "unit",
            "price",
            "quantity",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["quantity", "created_at", "updated_at"]


class StockDocumentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockDocumentItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_sku",
            "quantity",
            "unit_price",
            "stock_before",
            "stock_after",
        ]


class StockDocumentLineSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=0,
        required=False,
    )


class StockDocumentSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )
    items = StockDocumentItemSerializer(many=True, read_only=True)
    lines = StockDocumentLineSerializer(many=True, write_only=True)

    class Meta:
        model = StockDocument
        fields = [
            "id",
            "code",
            "transaction_type",
            "supplier",
            "supplier_name",
            "recipient",
            "note",
            "created_by",
            "created_by_username",
            "created_at",
            "items",
            "lines",
        ]
        read_only_fields = ["code", "created_by", "created_at"]

    def validate(self, attrs):
        lines = attrs.get("lines", [])
        transaction_type = attrs.get("transaction_type")

        if not lines:
            raise serializers.ValidationError(
                {"lines": "Phiếu kho phải có ít nhất một sản phẩm."}
            )

        product_ids = [line["product"].id for line in lines]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                {"lines": "Mỗi sản phẩm chỉ được xuất hiện một lần trong phiếu."}
            )

        if transaction_type == StockDocument.TransactionType.IN and not attrs.get("supplier"):
            raise serializers.ValidationError(
                {"supplier": "Phiếu nhập kho phải có nhà cung cấp."}
            )

        if transaction_type == StockDocument.TransactionType.OUT and not attrs.get("recipient"):
            raise serializers.ValidationError(
                {"recipient": "Phiếu xuất kho phải có người nhận hoặc lý do xuất."}
            )

        return attrs

    def create(self, validated_data):
        lines = validated_data.pop("lines")
        request = self.context["request"]

        with transaction.atomic():
            product_ids = sorted(line["product"].id for line in lines)
            products = Product.objects.select_for_update().in_bulk(product_ids)
            transaction_type = validated_data["transaction_type"]

            for line in lines:
                product = products[line["product"].id]
                if (
                    transaction_type == StockDocument.TransactionType.OUT
                    and line["quantity"] > product.quantity
                ):
                    raise serializers.ValidationError(
                        {
                            "lines": (
                                f"Sản phẩm {product.name} chỉ còn {product.quantity}, "
                                f"không thể xuất {line['quantity']}."
                            )
                        }
                    )

            document = StockDocument.objects.create(
                code=self._generate_code(transaction_type),
                created_by=request.user,
                **validated_data,
            )
            document_items = []
            changed_products = []

            for line in lines:
                product = products[line["product"].id]
                stock_before = product.quantity
                if transaction_type == StockDocument.TransactionType.IN:
                    product.quantity += line["quantity"]
                else:
                    product.quantity -= line["quantity"]

                document_items.append(
                    StockDocumentItem(
                        document=document,
                        product=product,
                        product_name=product.name,
                        product_sku=product.sku,
                        quantity=line["quantity"],
                        unit_price=line.get("unit_price", product.price),
                        stock_before=stock_before,
                        stock_after=product.quantity,
                    )
                )
                changed_products.append(product)

            Product.objects.bulk_update(changed_products, ["quantity"])
            StockDocumentItem.objects.bulk_create(document_items)

        return document

    @staticmethod
    def _generate_code(transaction_type):
        prefix = f"{transaction_type}-{timezone.localdate():%Y%m%d}-"
        last_code = (
            StockDocument.objects.filter(code__startswith=prefix)
            .order_by("-code")
            .values_list("code", flat=True)
            .first()
        )
        sequence = int(last_code.rsplit("-", 1)[-1]) + 1 if last_code else 1
        return f"{prefix}{sequence:03d}"
