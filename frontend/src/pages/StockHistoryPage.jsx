import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStockDocuments } from '../api/stockApi'
import Pagination from '../components/Pagination'

const formatDate = (value) => new Date(value).toLocaleString('vi-VN')

function StockHistoryPage() {
  const [documents, setDocuments] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    transaction_type: '',
    date_from: '',
    date_to: '',
    page: 1,
  })

  const loadDocuments = useCallback(async () => {
    queueMicrotask(() => setLoading(true))
    setError('')

    try {
      const data = await getStockDocuments(filters)
      setDocuments(data.results ?? data)
      setCount(data.count ?? data.length ?? 0)
    } catch {
      setError('Không tải được lịch sử kho.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    // Tải lại lịch sử khi bộ lọc thay đổi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDocuments()
  }, [loadDocuments])

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
      page: 1,
    }))
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Sổ kho</span>
          <h1>Lịch sử kho</h1>
          <p>Mỗi phiếu là một giao dịch bất biến, ghi lại tồn kho trước và sau.</p>
        </div>
        <div className="page-header__actions">
          <Link className="button-link button-link--secondary" to="/stock-out">Tạo phiếu xuất</Link>
          <Link className="button-link" to="/stock-in">Tạo phiếu nhập</Link>
        </div>
      </div>

      <section className="filters history-filters panel">
        <div className="filter-summary">
          <span>Tổng giao dịch</span>
          <strong>{count} phiếu</strong>
        </div>
        <label className="filter-field">
          Tìm kiếm
          <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Mã phiếu, sản phẩm..." />
        </label>
        <label className="filter-field">
          Loại phiếu
          <select name="transaction_type" value={filters.transaction_type} onChange={handleFilterChange}>
            <option value="">Tất cả</option>
            <option value="IN">Nhập kho</option>
            <option value="OUT">Xuất kho</option>
          </select>
        </label>
        <label className="filter-field">
          Từ ngày
          <input name="date_from" type="date" value={filters.date_from} onChange={handleFilterChange} />
        </label>
        <label className="filter-field">
          Đến ngày
          <input name="date_to" type="date" value={filters.date_to} onChange={handleFilterChange} />
        </label>
      </section>

      {error && <p className="error panel-error">{error}</p>}

      {loading ? (
        <div className="table-skeleton"><span /><span /><span /><span /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Loại</th>
                <th>Đối tác / người nhận</th>
                <th>Số dòng</th>
                <th>Tổng số lượng</th>
                <th>Người tạo</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td><Link className="document-code" to={`/stock-history/${document.id}`}>{document.code}</Link></td>
                  <td><span className={`transaction-badge transaction-badge--${document.transaction_type.toLowerCase()}`}>{document.transaction_type === 'IN' ? 'Nhập kho' : 'Xuất kho'}</span></td>
                  <td>{document.supplier_name || document.recipient || '-'}</td>
                  <td>{document.items.length}</td>
                  <td>{document.items.reduce((total, item) => total + item.quantity, 0)}</td>
                  <td>{document.created_by_username || '-'}</td>
                  <td>{formatDate(document.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!documents.length && <div className="empty-state"><strong>Chưa có giao dịch kho</strong><p>Tạo phiếu nhập hoặc xuất để bắt đầu lịch sử.</p></div>}
        </div>
      )}

      <Pagination currentPage={filters.page} count={count} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
    </main>
  )
}

export default StockHistoryPage
