from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product, StockDocument, StockDocumentItem, Supplier


class StockDocumentApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="warehouse",
            password="test-password",
        )
        self.category = Category.objects.create(name="Điện tử")
        self.supplier = Supplier.objects.create(name="Nhà cung cấp A")
        self.product = Product.objects.create(
            name="Bàn phím",
            sku="KEY-001",
            category=self.category,
            supplier=self.supplier,
            price=500000,
            quantity=10,
        )
        self.client.force_authenticate(self.user)

    def test_create_stock_in_document_increases_stock(self):
        response = self.client.post(
            "/api/stock-documents/",
            {
                "transaction_type": "IN",
                "supplier": self.supplier.id,
                "recipient": "",
                "note": "Nhập bổ sung",
                "lines": [
                    {
                        "product": self.product.id,
                        "quantity": 5,
                        "unit_price": 450000,
                    }
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 15)
        self.assertTrue(response.data["code"].startswith("IN-"))
        self.assertEqual(response.data["items"][0]["stock_before"], 10)
        self.assertEqual(response.data["items"][0]["stock_after"], 15)

    def test_create_stock_out_document_decreases_stock(self):
        response = self.client.post(
            "/api/stock-documents/",
            {
                "transaction_type": "OUT",
                "recipient": "Phòng kỹ thuật",
                "lines": [{"product": self.product.id, "quantity": 4}],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 6)
        self.assertEqual(response.data["items"][0]["stock_after"], 6)

    def test_stock_out_over_available_quantity_rolls_back(self):
        response = self.client.post(
            "/api/stock-documents/",
            {
                "transaction_type": "OUT",
                "recipient": "Phòng kỹ thuật",
                "lines": [{"product": self.product.id, "quantity": 11}],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 10)
        self.assertEqual(StockDocument.objects.count(), 0)

    def test_document_rejects_duplicate_products(self):
        response = self.client.post(
            "/api/stock-documents/",
            {
                "transaction_type": "IN",
                "supplier": self.supplier.id,
                "lines": [
                    {"product": self.product.id, "quantity": 2},
                    {"product": self.product.id, "quantity": 3},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(StockDocument.objects.count(), 0)

    def test_document_is_immutable_through_api(self):
        create_response = self.client.post(
            "/api/stock-documents/",
            {
                "transaction_type": "IN",
                "supplier": self.supplier.id,
                "lines": [{"product": self.product.id, "quantity": 2}],
            },
            format="json",
        )
        detail_url = f"/api/stock-documents/{create_response.data['id']}/"

        self.assertEqual(
            self.client.patch(detail_url, {"note": "Đã sửa"}, format="json").status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )
        self.assertEqual(
            self.client.delete(detail_url).status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def test_deleting_product_keeps_document_item_snapshot(self):
        response = self.client.post(
            "/api/stock-documents/",
            {
                "transaction_type": "OUT",
                "recipient": "Phòng kỹ thuật",
                "lines": [{"product": self.product.id, "quantity": 1}],
            },
            format="json",
        )
        item_id = response.data["items"][0]["id"]

        self.product.delete()
        item = StockDocumentItem.objects.get(id=item_id)

        self.assertIsNone(item.product)
        self.assertEqual(item.product_name, "Bàn phím")
        self.assertEqual(item.product_sku, "KEY-001")

    def test_product_quantity_is_read_only_in_product_api(self):
        response = self.client.patch(
            f"/api/products/{self.product.id}/",
            {"quantity": 999},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, 10)

    def test_dashboard_returns_stock_summary(self):
        response = self.client.get("/api/dashboard/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["products"], 1)
        self.assertEqual(response.data["total_stock"], 10)
        self.assertEqual(response.data["low_stock"], 1)

    def test_stock_document_api_requires_authentication(self):
        self.client.force_authenticate(user=None)

        response = self.client.get("/api/stock-documents/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
