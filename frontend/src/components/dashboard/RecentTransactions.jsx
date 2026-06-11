import { Link } from 'react-router-dom'
import {
  formatDateTime,
  formatNumber,
  getDocumentProductSummary,
  getDocumentQuantity,
} from '../../utils/dashboardData'

function RecentTransactions({ documents }) {
  return (
    <section className="dashboard-card recent-transactions">
      <div className="dashboard-card__header">
        <div>
          <span className="dashboard-badge">Dòng hoạt động</span>
          <h2>Giao dịch gần nhất</h2>
        </div>
        <Link className="dashboard-text-link" to="/stock-history">Xem toàn bộ lịch sử</Link>
      </div>

      {documents.length ? (
        <div className="transaction-timeline">
          {documents.map((document) => {
            const isStockIn = document.transaction_type === 'IN'

            return (
              <Link className="transaction-row" key={document.id} to={`/stock-history/${document.id}`}>
                <span className={`transaction-icon ${isStockIn ? 'transaction-icon--in' : 'transaction-icon--out'}`}>
                  {isStockIn ? '+' : '−'}
                </span>
                <div>
                  <strong>{getDocumentProductSummary(document)}</strong>
                  <small>{document.supplier_name || document.recipient || 'Không có đối tác'}</small>
                </div>
                <span className={`transaction-chip ${isStockIn ? 'transaction-chip--in' : 'transaction-chip--out'}`}>
                  {isStockIn ? 'Nhập kho' : 'Xuất kho'}
                </span>
                <span className="transaction-quantity">{formatNumber(getDocumentQuantity(document))}</span>
                <time>{formatDateTime(document.created_at)}</time>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="dashboard-empty dashboard-empty--wide">
          <strong>Chưa có giao dịch kho</strong>
          <p>Tạo phiếu nhập đầu tiên để hệ thống bắt đầu ghi nhận lịch sử vận hành.</p>
          <Link className="dashboard-action" to="/stock-in">Tạo phiếu nhập đầu tiên</Link>
        </div>
      )}
    </section>
  )
}

export default RecentTransactions
