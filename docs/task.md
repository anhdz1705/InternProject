Nhóm mình chia việc như sau:

1. Thành viên 1 - Backend
- Làm Django REST API
- Thiết kế model Category, Product, Supplier
- Làm CRUD API
- Làm search, filter, pagination
- Làm login API bằng JWT
- Nhánh: feature/backend-api

2. Thành viên 2 - Frontend
- Làm giao diện React
- Làm LoginPage, DashboardPage, ProductListPage, ProductFormPage
- Kết nối API bằng axios
- Làm CRUD sản phẩm trên giao diện
- Làm search, filter, pagination trên giao diện
- Nhánh: feature/frontend-ui

3. Thành viên 3 - CI, tài liệu, tích hợp, demo
- Làm GitHub Actions CI
- Viết README hướng dẫn chạy project
- Chuẩn bị dữ liệu demo
- Test tích hợp frontend-backend
- Chuẩn bị kịch bản demo cuối khóa
- Nhánh: feature/ci-demo-docs

Quy trình Git:
- main: code ổn định
- dev: code phát triển chung
- Mỗi người làm trên nhánh feature riêng
- Khi xong tạo Pull Request vào dev
- Cuối cùng merge dev vào main để nộp/demo