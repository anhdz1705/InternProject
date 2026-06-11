import { Doughnut } from 'react-chartjs-2'
import { buildStatusMetrics, formatNumber } from '../../utils/dashboardData'

function StockStatusChart({ stats }) {
  const statusMetrics = buildStatusMetrics(stats)
  const hasData = statusMetrics.some((metric) => metric.value > 0)
  const data = {
    labels: statusMetrics.map((metric) => metric.label),
    datasets: [
      {
        data: hasData ? statusMetrics.map((metric) => metric.value) : [1],
        backgroundColor: hasData ? statusMetrics.map((metric) => metric.color) : ['#e5e7eb'],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        bodyColor: '#f8fafc',
        displayColors: false,
        padding: 12,
        titleColor: '#f8fafc',
        callbacks: {
          label: (context) => hasData ? `${context.label}: ${formatNumber(context.parsed)}` : 'Chưa có sản phẩm',
        },
      },
    },
  }

  return (
    <article className="dashboard-card dashboard-card--status">
      <div className="dashboard-card__header dashboard-card__header--compact">
        <div>
          <span className="dashboard-badge">Trạng thái kho</span>
          <h2>Tỉ lệ hàng hóa</h2>
        </div>
      </div>

      <div className="dashboard-donut">
        <Doughnut data={data} options={options} />
        <div className="dashboard-donut__center">
          <strong>{formatNumber(stats.products)}</strong>
          <span>sản phẩm</span>
        </div>
      </div>

      <div className="status-breakdown">
        {statusMetrics.map((metric) => (
          <div key={metric.label}>
            <span><i style={{ backgroundColor: metric.color }} />{metric.label}</span>
            <strong>{formatNumber(metric.value)}</strong>
          </div>
        ))}
      </div>
    </article>
  )
}

export default StockStatusChart
