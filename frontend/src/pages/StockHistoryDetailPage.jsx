import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStockDocument } from '../api/stockApi'

function StockHistoryDetailPage() {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setDocument(await getStockDocument(id))
      } catch {
        setError('Không tải được chi tiết phiếu kho.')
      }
    }
    loadDocument()
  }, [id])

  if (error) return <main className="page"><p className="error panel-error">{error}</p></main>
  if (!document) return <main className="page"><div className="table-skeleton"><span /><span /><span /></div></main>

  const isStockIn = document.transaction_type === 'IN'

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className={`transaction-badge transaction-badge--${document.transaction_type.toLowerCase()}`}>{isStockIn ? 'Phiếu nhập kho' : 'Phiếu xuất kho'}</span>
          <h1 className="document-title">{document.code}</h1>
          <p>Tạo bởi {document.created_by_username || '-'} lúc {new Date(document.created_at).toLocaleString('vi-VN')}.</p>
        </div>
        <Link className="button-link button-link--secondary" to="/stock-history">Quay lại lịch sử</Link>
      </div>

      <section className="document-detail-grid">
        <article className="document-detail-card">
          <span>{isStockIn ? 'Nhà cung cấp' : 'Người nhận / lý do'}</span>
          <strong>{document.supplier_name || document.recipient || '-'}</strong>
        </article>
        <article className="document-detail-card">
          <span>Tổng số lượng</span>
          <strong>{document.items.reduce((total, item) => total + item.quantity, 0)}</strong>
        </article>
        <article className="document-detail-card">
          <span>Ghi chú</span>
          <strong>{document.note || 'Không có ghi chú'}</strong>
        </article>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Tồn trước</th>
              <th>Tồn sau</th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.product_name}</strong></td>
                <td><code>{item.product_sku}</code></td>
                <td>{item.quantity}</td>
                <td>{Number(item.unit_price).toLocaleString('vi-VN')} VND</td>
                <td>{item.stock_before}</td>
                <td><strong>{item.stock_after}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default StockHistoryDetailPage
