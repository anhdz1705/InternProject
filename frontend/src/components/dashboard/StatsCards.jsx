import { formatNumber } from '../../utils/dashboardData'

const cardMeta = [
  { key: 'total_stock', label: 'Tổng tồn kho', detail: 'Đơn vị hàng hiện có', tone: 'green' },
  { key: 'stock_in_today', label: 'Nhập hôm nay', detail: 'Số lượng đã nhập', tone: 'mint', prefix: '+' },
  { key: 'stock_out_today', label: 'Xuất hôm nay', detail: 'Số lượng đã xuất', tone: 'amber', prefix: '-' },
  { key: 'products', label: 'Sản phẩm', detail: 'Mã hàng đang quản lý', tone: 'navy' },
]

function StatsCards({ stats }) {
  return (
    <section className="dashboard-stats" aria-label="Chỉ số nhanh">
      {cardMeta.map((card) => (
        <article className={`dashboard-stat dashboard-stat--${card.tone}`} key={card.key}>
          <span>{card.label}</span>
          <strong>{card.prefix || ''}{formatNumber(stats[card.key])}</strong>
          <small>{card.detail}</small>
        </article>
      ))}
    </section>
  )
}

export default StatsCards
