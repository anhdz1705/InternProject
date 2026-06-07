import { Link } from 'react-router-dom'

const unitLabels = {
  piece: 'Cái',
  box: 'Hộp',
  kg: 'Kg',
  liter: 'Lít',
  pack: 'Gói',
}

function ProductTable({ products, onDelete }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <strong>Không tìm thấy sản phẩm</strong>
        <p>Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc để xem thêm dữ liệu kho.</p>
      </div>
    )
  }

  const getStockClass = (quantity) => {
    if (quantity === 0) return 'stock-badge stock-badge--danger'
    if (quantity <= 10) return 'stock-badge stock-badge--warning'
    return 'stock-badge stock-badge--ok'
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Tên sản phẩm</th>
            <th>SKU</th>
            <th>Danh mục</th>
            <th>Nhà cung cấp</th>
            <th>Đơn vị</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.category_name || '-'}</td>
              <td>{product.supplier_name || '-'}</td>
              <td>
                <span className="unit-pill">
                  {unitLabels[product.unit] || product.unit}
                </span>
              </td>
              <td>{Number(product.price).toLocaleString('vi-VN')} VND</td>
              <td>
                <span className={getStockClass(product.quantity)}>
                  {product.quantity}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <Link to={`/products/${product.id}/edit`}>Sửa</Link>
                  <button type="button" onClick={() => onDelete(product.id)}>
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductTable
