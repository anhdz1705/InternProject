import { Line } from 'react-chartjs-2'
import { formatNumber } from '../../utils/dashboardData'

function TransactionTrendChart({ trendData }) {
  const hasData = trendData.some((day) => day.stockIn > 0 || day.stockOut > 0)
  const data = {
    labels: trendData.map((day) => day.label),
    datasets: [
      {
        label: 'Nhập kho',
        data: trendData.map((day) => day.stockIn),
        borderColor: '#047857',
        backgroundColor: 'rgba(4, 120, 87, 0.12)',
        fill: true,
        pointBackgroundColor: '#047857',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.38,
      },
      {
        label: 'Xuất kho',
        data: trendData.map((day) => day.stockOut),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.38,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: {
        align: 'end',
        labels: {
          boxHeight: 8,
          boxWidth: 8,
          color: '#475569',
          font: { size: 10, weight: 500 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        bodyColor: '#f8fafc',
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
        ticks: { color: '#64748b', font: { size: 10, weight: 500 } },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: '#e5e7eb' },
        ticks: {
          color: '#94a3b8',
          font: { size: 10, weight: 500 },
          precision: 0,
          callback: (value) => formatNumber(value),
        },
      },
    },
  }

  return (
    <article className="dashboard-card dashboard-card--trend">
      <div className="dashboard-card__header">
        <div>
          <span className="dashboard-badge">7 ngày gần nhất</span>
          <h2>Nhịp nhập / xuất kho</h2>
        </div>
      </div>

      {hasData ? (
        <div className="dashboard-chart dashboard-chart--line">
          <Line data={data} options={options} />
        </div>
      ) : (
        <div className="dashboard-empty dashboard-empty--chart">
          <strong>Chưa có giao dịch trong 7 ngày</strong>
          <p>Biểu đồ sẽ tự cập nhật khi có phiếu nhập hoặc xuất kho mới.</p>
        </div>
      )}
    </article>
  )
}

export default TransactionTrendChart
