import { Bar } from 'react-chartjs-2'
import { buildOverviewMetrics, formatNumber } from '../../utils/dashboardData'

function OverviewChart({ stats }) {
  const metrics = buildOverviewMetrics(stats)
  const data = {
    labels: metrics.map((metric) => metric.label),
    datasets: [
      {
        label: 'Số lượng',
        data: metrics.map((metric) => metric.value),
        backgroundColor: metrics.map((metric) => metric.color),
        borderRadius: 10,
        borderSkipped: false,
        barPercentage: 0.62,
        categoryPercentage: 0.72,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        bodyColor: '#f8fafc',
        displayColors: false,
        padding: 12,
        titleColor: '#f8fafc',
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { size: 11, weight: 600 },
          maxRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: '#e5e7eb' },
        ticks: {
          color: '#94a3b8',
          precision: 0,
          callback: (value) => formatNumber(value),
        },
      },
    },
  }

  return (
    <article className="dashboard-card dashboard-card--overview">
      <div className="dashboard-card__header">
        <div>
          <span className="dashboard-badge">Biểu đồ tổng quan</span>
          <h2>Tổng quan tồn kho</h2>
        </div>
        <strong>{formatNumber(stats.total_stock)}</strong>
      </div>

      <div className="dashboard-chart dashboard-chart--bar">
        <Bar data={data} options={options} />
      </div>

      <div className="dashboard-legend">
        {metrics.map((metric) => (
          <span key={metric.label}>
            <i style={{ backgroundColor: metric.color }} />
            {metric.label}
          </span>
        ))}
      </div>
    </article>
  )
}

export default OverviewChart
