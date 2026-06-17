import { Link } from 'react-router-dom'

const icons = {
  edit: <><path d="M13.5 6.5 17.5 10.5M4 20l4.4-1 10.8-10.8a2.8 2.8 0 0 0-4-4L4.4 15 4 20Z" /></>,
  trash: <><path d="M4 7h16m-10 4v5m4-5v5M9 7l1-3h4l1 3m3 0-1 14H7L6 7" /></>,
}

function ActionIcon({ name }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

const unitLabels = {
  piece: 'Cái',
  box: 'Hộp',
  kg: 'Kg',
  liter: 'Lít',
  pack: 'Gói',
}

function ProductTable({ products, onDelete, currentPage = 1, pageSize = 10 }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <span>Không có dữ liệu</span>
        <strong>Không tìm thấy sản phẩm</strong>
        <p>Thử từ khóa khác hoặc bỏ bớt bộ lọc để xem thêm dữ liệu kho.</p>
      </div>
    )
  }

  const getStockClass = (quantity) => {
    if (quantity === 0) return 'product-status product-status--danger'
    if (quantity <= 10) return 'product-status product-status--warning'
    return 'product-status product-status--ok'
  }

  const getStockLabel = (quantity) => {
    if (quantity === 0) return 'Hết hàng'
    if (quantity <= 10) return 'Sắp hết'
    return 'Ổn định'
  }

  return (
    <div className="table-wrap product-table-wrap">
      <table className="product-data-grid">
        <thead>
          <tr>
            <th className="product-col-index">STT</th>
            <th>Tên sản phẩm</th>
            <th>SKU</th>
            <th>Danh mục</th>
            <th>Nhà cung cấp</th>
            <th className="product-col-center">Đơn vị</th>
            <th className="product-col-number">Giá bán</th>
            <th className="product-col-number">Tồn kho</th>
            <th className="product-col-center">Trạng thái</th>
            <th className="product-col-actions">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id}>
              <td className="product-col-index">{(currentPage - 1) * pageSize + index + 1}</td>
              <td>
                <strong className="product-name">{product.name}</strong>
              </td>
              <td>
                <code className="sku-tag">{product.sku}</code>
              </td>
              <td>{product.category_name || '-'}</td>
              <td>{product.supplier_name || '-'}</td>
              <td className="product-col-center">
                <span className="unit-pill">
                  {unitLabels[product.unit] || product.unit}
                </span>
              </td>
              <td className="numeric-cell product-col-number">{Number(product.price).toLocaleString('vi-VN')} ₫</td>
              <td className="product-col-number">
                <strong className="stock-quantity">{product.quantity.toLocaleString('vi-VN')}</strong>
              </td>
              <td className="product-col-center">
                <span className={getStockClass(product.quantity)}>{getStockLabel(product.quantity)}</span>
              </td>
              <td className="product-col-actions">
                <div className="product-row-actions">
                  <Link to={`/products/${product.id}/edit`} aria-label={`Sửa ${product.name}`} title="Sửa sản phẩm">
                    <ActionIcon name="edit" />
                  </Link>
                  <button type="button" onClick={() => onDelete(product.id)} aria-label={`Xóa ${product.name}`} title="Xóa sản phẩm">
                    <ActionIcon name="trash" />
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
