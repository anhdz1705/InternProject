import { Link } from 'react-router-dom'
import { formatNumber } from '../../utils/dashboardData'

function StockAlertPanel({ stats, attentionProducts }) {
  const hasAttentionProducts = attentionProducts.length > 0

  return (
    <aside className="dashboard-card stock-alert-panel">
      <div className="dashboard-card__header dashboard-card__header--compact">
        <div>
          <span className="dashboard-badge">Cảnh báo tồn kho</span>
          <h2>Mặt hàng cần bổ sung</h2>
        </div>
      </div>

      <div className="alert-metrics">
        <div>
          <span>Tổng sản phẩm</span>
          <strong>{formatNumber(stats.products)}</strong>
        </div>
        <div>
          <span>Sắp hết</span>
          <strong>{formatNumber(stats.low_stock)}</strong>
        </div>
        <div>
          <span>Đã hết</span>
          <strong>{formatNumber(stats.out_of_stock)}</strong>
        </div>
      </div>

      {hasAttentionProducts ? (
        <div className="attention-list">
          {attentionProducts.map((product) => (
            <Link className="attention-item" key={product.id} to={`/products/${product.id}/edit`}>
              <div>
                <strong>{product.name}</strong>
                <span>{product.sku}</span>
              </div>
              <small className={product.quantity === 0 ? 'danger' : 'warning'}>
                {formatNumber(product.quantity)}
              </small>
            </Link>
          ))}
        </div>
      ) : (
        <div className="dashboard-empty dashboard-empty--compact">
          <strong>Kho đang ổn định</strong>
          <p>Chưa có sản phẩm nào ở ngưỡng cần bổ sung.</p>
        </div>
      )}

      <Link className="dashboard-text-link" to="/products">Kiểm tra danh sách sản phẩm</Link>
    </aside>
  )
}

export default StockAlertPanel
