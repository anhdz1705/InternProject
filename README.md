# EZ Inventory

EZ Inventory là hệ thống quản lý kho giúp theo dõi sản phẩm, danh mục, nhà cung cấp và dữ liệu tồn kho. Dự án gồm frontend React/Vite và backend Django REST Framework, dùng JWT để xác thực người dùng.

## Demo

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Django Admin: `http://localhost:8000/admin/`

## Công nghệ sử dụng

### Frontend

- React
- Vite
- Axios
- React Router
- CSS thuần
- Font giao diện: Be Vietnam Pro, Roboto Mono

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- Django Filter
- CORS Headers

### Database và DevOps

- PostgreSQL
- Docker
- Docker Compose

### Authentication

- Đăng nhập
- Đăng xuất
- JWT Authentication
- Tự động gửi access token qua Axios

### Product Management

- Xem danh sách sản phẩm
- Thêm sản phẩm
- Sửa sản phẩm
- Xóa sản phẩm
- Tìm kiếm theo tên sản phẩm hoặc SKU
- Lọc theo danh mục, nhà cung cấp, đơn vị tính
- Phân trang

### Category Management

- CRUD danh mục qua REST API
- Lấy danh sách danh mục để lọc và chọn trong form sản phẩm

### Supplier Management

- CRUD nhà cung cấp qua REST API
- Lấy danh sách nhà cung cấp để lọc và chọn trong form sản phẩm

### Dashboard

- Tổng số sản phẩm
- Tổng số danh mục
- Tổng số nhà cung cấp
- Một số chỉ số tổng hợp
## Cấu trúc thư mục

```txt
InternProject/
├── backend/
│   ├── config/
│   ├── inventory/
│   ├── manage.py
│   ├── requirements.txt
│   └── seed_data.py
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
├── docs/
├── docker-compose.yml
└── README.md
```

## Cài đặt

### Clone project

```bash
git clone <repo-url>
cd InternProject
```

### Database

Chạy PostgreSQL bằng Docker Compose:

```bash
docker compose up -d
```

Database mặc định:

```txt
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=123456
DB_HOST=localhost
DB_PORT=5433
```

### Backend

```bash
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python seed_data.py
python manage.py runserver
```

Backend chạy tại:

```txt
http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Nếu PowerShell chặn `npm`, dùng:

```bash
npm.cmd run dev
```

Frontend chạy tại:

```txt
http://localhost:5173
```

## Chạy bằng Docker

Hiện tại Docker Compose đang cấu hình PostgreSQL:

```bash
docker compose up -d
```

Sau đó chạy backend và frontend bằng lệnh ở phần cài đặt.

## Biến môi trường

Backend `.env`:

```env
DB_NAME=inventory_db
DB_USER=postgres
DB_PASSWORD=123456
DB_HOST=localhost
DB_PORT=5433
```

Frontend hiện dùng API base URL trong:

```txt
frontend/src/api/axiosClient.js
```

```js
baseURL: 'http://localhost:8000/api'
```

## Thành viên

| Họ tên | Vai trò |
| --- | --- |
| Thái Hữu Long Vũ | Backend |
| Lê Minh Hoài Thương | Frontend |
| Lê Ngọc Ánh | CI, tài liệu, tích hợp, demo |

## API

### Authentication

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| POST | `/api/auth/login/` | Đăng nhập |
| POST | `/api/auth/refresh/` | Làm mới access token |

### Products

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/products/` | Danh sách sản phẩm |
| POST | `/api/products/` | Thêm sản phẩm |
| GET | `/api/products/:id/` | Chi tiết sản phẩm |
| PUT | `/api/products/:id/` | Cập nhật sản phẩm |
| PATCH | `/api/products/:id/` | Cập nhật một phần |
| DELETE | `/api/products/:id/` | Xóa sản phẩm |

Query hỗ trợ:

| Query | Ví dụ | Chức năng |
| --- | --- | --- |
| `page` | `/api/products/?page=1` | Phân trang |
| `search` | `/api/products/?search=laptop` | Tìm theo tên hoặc SKU |
| `category` | `/api/products/?category=1` | Lọc theo danh mục |
| `supplier` | `/api/products/?supplier=2` | Lọc theo nhà cung cấp |
| `unit` | `/api/products/?unit=piece` | Lọc theo đơn vị tính |
| `ordering` | `/api/products/?ordering=price` | Sắp xếp |

### Categories

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/categories/` | Danh sách danh mục |
| POST | `/api/categories/` | Thêm danh mục |
| GET | `/api/categories/:id/` | Chi tiết danh mục |
| PUT | `/api/categories/:id/` | Cập nhật danh mục |
| PATCH | `/api/categories/:id/` | Cập nhật một phần |
| DELETE | `/api/categories/:id/` | Xóa danh mục |

### Suppliers

| Method | Endpoint | Chức năng |
| --- | --- | --- |
| GET | `/api/suppliers/` | Danh sách nhà cung cấp |
| POST | `/api/suppliers/` | Thêm nhà cung cấp |
| GET | `/api/suppliers/:id/` | Chi tiết nhà cung cấp |
| PUT | `/api/suppliers/:id/` | Cập nhật nhà cung cấp |
| PATCH | `/api/suppliers/:id/` | Cập nhật một phần |
| DELETE | `/api/suppliers/:id/` | Xóa nhà cung cấp |

## Kiểm tra

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

Nếu dùng PowerShell và bị chặn `npm`, dùng:

```bash
npm.cmd run lint
npm.cmd run build
```

### Backend

```bash
cd backend
python manage.py check
python manage.py test
```

## License

MIT License
