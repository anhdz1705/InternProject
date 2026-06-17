import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCategories } from '../api/categoryApi'
import { getReports, exportReportCsv } from '../api/reportApi'
import { getSuppliers } from '../api/supplierApi'

const emptyReport = {
  inventory: {
    total_products: 0,
    total_stock: 0,
    total_value: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    low_stock_threshold: 10,
    by_category: [],
    by_supplier: [],
    low_stock_products: [],
  },
  movement: {
    period: 'day',
    total_in: 0,
    total_out: 0,
    net_change: 0,
    total_in_value: 0,
    total_out_value: 0,
    document_count: 0,
    line_count: 0,
    timeline: [],
  },
  top_products: {
    stock_in: [],
    stock_out: [],
  },
  transactions: [],
}

const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN')

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('vi-VN', {
    maximumFractionDigits: 0,
    style: 'currency',
    currency: 'VND',
  })

const formatDateInput = (date) => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getDefaultFilters = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 29)

  return {
    date_from: formatDateInput(start),
    date_to: formatDateInput(end),
    transaction_type: '',
    category: '',
    supplier: '',
    period: 'day',
  }
}

const cleanReportFilters = (filters) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )

const getErrorMessage = (error) => {
  const data = error.response?.data

  if (data && typeof data === 'object') {
    return Object.values(data).flat().join(' ')
  }

  return 'Không tải được dữ liệu báo cáo. Vui lòng kiểm tra backend API.'
}

const getFilenameFromHeaders = (headers) => {
  const disposition = headers?.['content-disposition']
  const match = disposition?.match(/filename="?([^"]+)"?/)

  return match?.[1] || 'inventory-report.csv'
}

function ReportMetric({ label, value, detail, tone = 'neutral' }) {
  return (
    <article className={`report-metric report-metric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function DateRangeField({ dateFrom, dateTo, onChange }) {
  return (
    <label className="filter-field report-date-range-field">
      Khoảng ngày
      <span className="report-date-range-input">
        <input
          aria-label="Từ ngày"
          name="date_from"
          type="date"
          value={dateFrom}
          onChange={onChange}
        />
        <i aria-hidden="true" />
        <input
          aria-label="Đến ngày"
          name="date_to"
          type="date"
          value={dateTo}
          onChange={onChange}
        />
      </span>
    </label>
  )
}

function BreakdownList({ title, subtitle, rows, valueLabel = 'Tồn kho' }) {
  const maxStock = Math.max(...rows.map((row) => Number(row.total_stock) || 0), 1)

  return (
    <section className="report-panel">
      <div className="report-panel__header">
        <div>
          <span className="report-eyebrow">{subtitle}</span>
          <h2>{title}</h2>
        </div>
      </div>

      {rows.length ? (
        <div className="report-breakdown-list">
          {rows.map((row) => {
            const width = `${Math.max(6, ((Number(row.total_stock) || 0) / maxStock) * 100)}%`

            return (
              <div className="report-breakdown-row" key={`${title}-${row.id ?? row.name}`}>
                <div>
                  <span>{row.name}</span>
                  <small>{formatNumber(row.product_count)} sản phẩm</small>
                </div>
                <div className="report-bar-track" aria-hidden="true">
                  <i style={{ width }} />
                </div>
                <strong>{formatNumber(row.total_stock)}</strong>
                <small>{valueLabel}</small>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="report-empty">Chưa có dữ liệu phù hợp với bộ lọc.</div>
      )}
    </section>
  )
}

function MovementTimeline({ timeline }) {
  const maxQuantity = Math.max(
    ...timeline.flatMap((item) => [Number(item.stock_in) || 0, Number(item.stock_out) || 0]),
    1,
  )

  return (
    <section className={`report-panel report-panel--wide report-movement-panel ${timeline.length ? '' : 'report-panel--compact-empty'}`}>
      <div className="report-panel__header">
        <div>
          <span className="report-eyebrow">Theo thời gian</span>
          <h2>Nhập / xuất theo kỳ</h2>
        </div>
      </div>

      {timeline.length ? (
        <div className="report-timeline">
          {timeline.map((item) => (
            <div className="report-timeline-row" key={item.period}>
              <time>{item.label}</time>
              <div>
                <span>Nhập</span>
                <div className="report-bar-track report-bar-track--in">
                  <i style={{ width: `${Math.max(5, ((Number(item.stock_in) || 0) / maxQuantity) * 100)}%` }} />
                </div>
                <strong>{formatNumber(item.stock_in)}</strong>
              </div>
              <div>
                <span>Xuất</span>
                <div className="report-bar-track report-bar-track--out">
                  <i style={{ width: `${Math.max(5, ((Number(item.stock_out) || 0) / maxQuantity) * 100)}%` }} />
                </div>
                <strong>{formatNumber(item.stock_out)}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="report-empty">Chưa có giao dịch trong khoảng thời gian này.</div>
      )}
    </section>
  )
}

function TopProductList({ title, subtitle, rows }) {
  return (
    <section className="report-panel">
      <div className="report-panel__header">
        <div>
          <span className="report-eyebrow">{subtitle}</span>
          <h2>{title}</h2>
        </div>
      </div>

      {rows.length ? (
        <div className="report-product-list">
          {rows.map((product, index) => (
            <div className="report-product-row" key={`${product.product_sku}-${index}`}>
              <span>{index + 1}</span>
              <div>
                <strong>{product.product_name}</strong>
                <small>{product.product_sku}</small>
              </div>
              <strong>{formatNumber(product.total_quantity)}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="report-empty">Chưa có sản phẩm nào trong nhóm này.</div>
      )}
    </section>
  )
}

function LowStockList({ products, threshold }) {
  return (
    <section className="report-panel report-panel--wide report-alert-panel">
      <div className="report-panel__header">
        <div>
          <span className="report-eyebrow">Cảnh báo</span>
          <h2>Hàng cần bổ sung</h2>
        </div>
      </div>

      {products.length ? (
        <div className="report-alert-list">
          {products.map((product) => (
            <div className="report-alert-row" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <small>{product.sku}</small>
              </div>
              <span className={product.quantity === 0 ? 'danger' : 'warning'}>
                {formatNumber(product.quantity)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="report-empty">Không có sản phẩm dưới ngưỡng {formatNumber(threshold)}.</div>
      )}
    </section>
  )
}

function TransactionTable({ transactions }) {
  return (
    <section className="report-panel report-panel--wide report-transactions">
      <div className="report-panel__header">
        <div>
          <span className="report-eyebrow">Chi tiết</span>
          <h2>Giao dịch theo bộ lọc</h2>
        </div>
        <span>{formatNumber(transactions.length)} phiếu</span>
      </div>

      {transactions.length ? (
        <div className="table-wrap report-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Loại</th>
                <th>Sản phẩm</th>
                <th>Đối tác</th>
                <th>Số lượng</th>
                <th>Giá trị</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td><code>{transaction.code}</code></td>
                  <td>
                    <span className={`transaction-badge transaction-badge--${transaction.transaction_type.toLowerCase()}`}>
                      {transaction.transaction_type === 'IN' ? 'Nhập kho' : 'Xuất kho'}
                    </span>
                  </td>
                  <td>{transaction.product_summary}</td>
                  <td>{transaction.partner || '-'}</td>
                  <td className="numeric-cell">{formatNumber(transaction.total_quantity)}</td>
                  <td className="numeric-cell">{formatCurrency(transaction.total_value)}</td>
                  <td>{new Date(transaction.created_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="report-empty">Không có giao dịch phù hợp với bộ lọc hiện tại.</div>
      )}
    </section>
  )
}

function ReportsPage() {
  const [filters, setFilters] = useState(getDefaultFilters)
  const [report, setReport] = useState(emptyReport)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')

  const queryParams = useMemo(() => cleanReportFilters(filters), [filters])

  const loadReport = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      setReport(await getReports(queryParams))
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [categoryData, supplierData] = await Promise.all([
          getCategories({ all: 'true' }),
          getSuppliers({ all: 'true' }),
        ])

        setCategories(categoryData.results ?? categoryData)
        setSuppliers(supplierData.results ?? supplierData)
      } catch {
        setError('Không tải được danh mục hoặc nhà cung cấp cho bộ lọc.')
      }
    }

    loadFilterOptions()
  }, [])

  useEffect(() => {
    // Tải lại báo cáo khi bộ lọc thay đổi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReport()
  }, [loadReport])

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const clearFilters = () => {
    setFilters(getDefaultFilters())
  }

  const handleExportCsv = async () => {
    setExporting(true)
    setError('')

    try {
      const response = await exportReportCsv(queryParams)
      const filename = getFilenameFromHeaders(response.headers)
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setExporting(false)
    }
  }

  const inventory = report.inventory || emptyReport.inventory
  const movement = report.movement || emptyReport.movement
  const topProducts = report.top_products || emptyReport.top_products
  const transactions = report.transactions || []

  return (
    <main className="page reports-page">
      <div className="page-header reports-page__header">
        <div>
          <h1>Báo cáo & Thống kê</h1>
          <p>Theo dõi tồn kho, biến động nhập xuất, top sản phẩm và giao dịch chi tiết.</p>
        </div>
      </div>

      <section className="panel reports-filter-panel" aria-label="Bộ lọc báo cáo">
        <DateRangeField dateFrom={filters.date_from} dateTo={filters.date_to} onChange={handleFilterChange} />
        <label className="filter-field">
          Loại phiếu
          <select name="transaction_type" value={filters.transaction_type} onChange={handleFilterChange}>
            <option value="">Tất cả</option>
            <option value="IN">Nhập kho</option>
            <option value="OUT">Xuất kho</option>
          </select>
        </label>
        <label className="filter-field">
          Danh mục
          <select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          Nhà cung cấp
          <select name="supplier" value={filters.supplier} onChange={handleFilterChange}>
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
            ))}
          </select>
        </label>
        <label className="filter-field">
          Kỳ thống kê
          <select name="period" value={filters.period} onChange={handleFilterChange}>
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
          </select>
        </label>
        <div className="reports-filter-actions">
          <button className="reports-clear-button" type="button" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
          <button className="reports-export-button" type="button" onClick={handleExportCsv} disabled={exporting || loading}>
            {exporting ? 'Đang xuất...' : 'Xuất CSV'}
          </button>
        </div>
      </section>

      {error && <p className="error panel-error">{error}</p>}

      <section className="reports-metrics" aria-label="Chỉ số báo cáo">
        <ReportMetric label="Tổng tồn" value={formatNumber(inventory.total_stock)} detail={`${formatNumber(inventory.total_products)} sản phẩm`} tone="green" />
        <ReportMetric label="Giá trị tồn" value={formatCurrency(inventory.total_value)} detail="Theo đơn giá hiện tại" tone="blue" />
        <ReportMetric label="Nhập trong kỳ" value={formatNumber(movement.total_in)} detail={formatCurrency(movement.total_in_value)} tone="mint" />
        <ReportMetric label="Xuất trong kỳ" value={formatNumber(movement.total_out)} detail={formatCurrency(movement.total_out_value)} tone="amber" />
        <ReportMetric label="Chênh lệch" value={formatNumber(movement.net_change)} detail={`${formatNumber(movement.document_count)} phiếu`} tone="navy" />
      </section>

      <section className="reports-grid" aria-label="Nội dung báo cáo">
        <BreakdownList title="Tồn theo danh mục" subtitle="Tồn kho hiện tại" rows={inventory.by_category || []} />
        <BreakdownList title="Tồn theo nhà cung cấp" subtitle="Tồn kho hiện tại" rows={inventory.by_supplier || []} />
        <LowStockList products={inventory.low_stock_products || []} threshold={inventory.low_stock_threshold} />
        <MovementTimeline timeline={movement.timeline || []} />
        <TopProductList title="Top sản phẩm nhập" subtitle="Nhập kho" rows={topProducts.stock_in || []} />
        <TopProductList title="Top sản phẩm xuất" subtitle="Xuất kho" rows={topProducts.stock_out || []} />
        <TransactionTable transactions={transactions} />
      </section>

      {loading && (
        <div className="dashboard-loading reports-loading" aria-live="polite">
          <span />
          <span />
          <span />
        </div>
      )}
    </main>
  )
}

export default ReportsPage
