import os
import django
import random
from decimal import Decimal

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from inventory.models import Category, Product, StockDocument, Supplier

def run():
    print("Xóa dữ liệu cũ...")
    StockDocument.objects.all().delete()
    Product.objects.all().delete()
    Category.objects.all().delete()
    Supplier.objects.all().delete()

    print("Tạo Categories...")
    cat_electronics = Category.objects.create(name="Điện tử", description="Các thiết bị điện tử, máy tính")
    cat_office = Category.objects.create(name="Văn phòng phẩm", description="Dụng cụ văn phòng")
    cat_furniture = Category.objects.create(name="Nội thất", description="Bàn ghế, tủ kệ")

    print("Tạo Suppliers...")
    sup_phongvu = Supplier.objects.create(name="Phong Vũ", phone="18006868", email="contact@phongvu.vn")
    sup_thienlong = Supplier.objects.create(name="Thiên Long", phone="19008080", email="cskh@thienlong.vn")
    sup_hoaphat = Supplier.objects.create(name="Hòa Phát", phone="18009090", email="info@hoaphat.com")

    print("Tạo Products...")
    products_data = [
        {"name": "Laptop Asus ROG", "sku": "LAP-ASUS-001", "category": cat_electronics, "supplier": sup_phongvu, "unit": "piece", "price": 25000000, "quantity": 10},
        {"name": "Laptop Dell XPS", "sku": "LAP-DELL-001", "category": cat_electronics, "supplier": sup_phongvu, "unit": "piece", "price": 35000000, "quantity": 5},
        {"name": "Chuột Logitech G102", "sku": "MOU-LOGI-001", "category": cat_electronics, "supplier": sup_phongvu, "unit": "piece", "price": 400000, "quantity": 50},
        {"name": "Bàn phím cơ Akko", "sku": "KEY-AKKO-001", "category": cat_electronics, "supplier": sup_phongvu, "unit": "piece", "price": 1200000, "quantity": 20},
        {"name": "Bút bi Thiên Long TL-027", "sku": "PEN-TL-027", "category": cat_office, "supplier": sup_thienlong, "unit": "box", "price": 60000, "quantity": 100},
        {"name": "Giấy in Double A A4", "sku": "PAP-AA-A4", "category": cat_office, "supplier": sup_thienlong, "unit": "box", "price": 75000, "quantity": 200},
        {"name": "Bìa còng Thiên Long 7cm", "sku": "FIL-TL-007", "category": cat_office, "supplier": sup_thienlong, "unit": "piece", "price": 35000, "quantity": 150},
        {"name": "Bàn làm việc Hòa Phát 1m2", "sku": "DESK-HP-120", "category": cat_furniture, "supplier": sup_hoaphat, "unit": "piece", "price": 1500000, "quantity": 15},
        {"name": "Ghế xoay văn phòng Hòa Phát", "sku": "CHAI-HP-001", "category": cat_furniture, "supplier": sup_hoaphat, "unit": "piece", "price": 850000, "quantity": 30},
        {"name": "Tủ tài liệu sắt Hòa Phát", "sku": "CAB-HP-001", "category": cat_furniture, "supplier": sup_hoaphat, "unit": "piece", "price": 2200000, "quantity": 8},
    ]

    for p in products_data:
        Product.objects.create(**p)

    print(f"Hoàn thành! Đã tạo {Category.objects.count()} categories, {Supplier.objects.count()} suppliers, {Product.objects.count()} products.")

if __name__ == "__main__":
    run()
