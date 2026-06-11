# EZ Inventory Frontend

Giao diện React/Vite cho hệ thống quản lý kho EZ Inventory.

## Chức năng

- Đăng nhập JWT và tự động làm mới access token
- Sidebar quản trị responsive
- Dashboard tồn kho và giao dịch gần nhất
- CRUD thông tin sản phẩm
- Tạo phiếu nhập và xuất kho nhiều sản phẩm
- Tìm kiếm, lọc và xem chi tiết lịch sử kho

## Chạy dự án

```bash
npm install
npm run dev
```

Frontend mặc định gọi API tại `http://localhost:8000/api`. Có thể thay đổi bằng biến môi trường:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Kiểm tra

```bash
npm run lint
npm run build
```
