import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary } from '../api/dashboardApi'

function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    suppliers: 0,
    total_stock: 0,
    low_stock: 0,
    out_of_stock: 0,
    stock_in_today: 0,
    stock_out_today: 0,
    recent_documents: [],
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats(await getDashboardSummary())
      } catch {
        setError('Không tải được dữ liệu tổng quan. Vui lòng kiểm tra backend API.')
      }
    }

    loadStats()
  }, [])

  return (
    <main className="page">
      <div className="page-header page-header--simple">
        <div>
          <span className="eyebrow">Trạng thái hôm nay</span>
          <h1>Tổng quan</h1>
          <p>Theo dõi tồn kho và các giao dịch mới nhất trong một màn hình.</p>
        </div>
        <div className="page-header__actions">
          <Link className="button-link button-link--secondary" to="/stock-out">Xuất kho</Link>
          <Link className="button-link" to="/stock-in">Nhập kho</Link>
        </div>
      </div>

      {error && <p className="error panel-error">{error}</p>}

      <section className="dashboard-grid">
        <article className="metric-card metric-card--hero">
          <div>
            <span>Tổng lượng hàng tồn</span>
            <strong>{stats.total_stock}</strong>
          </div>
          <p>Tổng số đơn vị sản phẩm đang có trong kho sau các giao dịch nhập và xuất.</p>
        </article>
        <article className="metric-card">
          <div>
            <span>Nhập hôm nay</span>
            <strong>+{stats.stock_in_today}</strong>
          </div>
          <p>Số lượng đã được nhập vào kho trong ngày.</p>
        </article>
        <article className="metric-card">
          <div>
            <span>Xuất hôm nay</span>
            <strong>-{stats.stock_out_today}</strong>
          </div>
          <p>Số lượng đã xuất khỏi kho trong ngày.</p>
        </article>
        <aside className="ops-panel">
          <span className="eyebrow">Cảnh báo tồn kho</span>
          <h2>Kiểm tra các mặt hàng cần bổ sung.</h2>
          <dl>
            <div>
              <dt>Sản phẩm</dt>
              <dd>{stats.products}</dd>
            </div>
            <div>
              <dt>Sắp hết hàng</dt>
              <dd>{stats.low_stock}</dd>
            </div>
            <div>
              <dt>Đã hết hàng</dt>
              <dd>{stats.out_of_stock}</dd>
            </div>
          </dl>
          <Link className="text-link" to="/products">Kiểm tra danh sách sản phẩm</Link>
        </aside>
      </section>

      <section className="recent-documents">
        <div className="section-title">
          <div>
            <span className="eyebrow">Dòng hoạt động</span>
            <h2>Giao dịch gần nhất</h2>
          </div>
          <Link className="text-link" to="/stock-history">Xem toàn bộ lịch sử</Link>
        </div>
        <div className="recent-documents__list">
          {stats.recent_documents.map((document) => (
            <Link key={document.id} className="recent-document-card" to={`/stock-history/${document.id}`}>
              <span className={`transaction-badge transaction-badge--${document.transaction_type.toLowerCase()}`}>
                {document.transaction_type === 'IN' ? 'Nhập kho' : 'Xuất kho'}
              </span>
              <strong>{document.code}</strong>
              <p>{document.supplier_name || document.recipient || 'Không có đối tác'}</p>
              <small>{new Date(document.created_at).toLocaleString('vi-VN')}</small>
            </Link>
          ))}
          {!stats.recent_documents.length && (
            <div className="empty-state"><strong>Chưa có giao dịch kho</strong><p>Tạo phiếu nhập đầu tiên để bắt đầu theo dõi.</p></div>
          )}
        </div>
      </section>
    </main>
  )
}

export default DashboardPage
