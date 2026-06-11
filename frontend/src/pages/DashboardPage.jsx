import { useEffect, useMemo, useState } from 'react'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import OverviewChart from '../components/dashboard/OverviewChart'
import RecentTransactions from '../components/dashboard/RecentTransactions'
import StatsCards from '../components/dashboard/StatsCards'
import StockAlertPanel from '../components/dashboard/StockAlertPanel'
import StockStatusChart from '../components/dashboard/StockStatusChart'
import TransactionTrendChart from '../components/dashboard/TransactionTrendChart'
import { getDashboardSummary } from '../api/dashboardApi'
import { getProducts } from '../api/productApi'
import { getStockDocuments } from '../api/stockApi'
import {
  buildTrendData,
  getAttentionProducts,
  getTrendRange,
} from '../utils/dashboardData'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
)

const emptyStats = {
  products: 0,
  categories: 0,
  suppliers: 0,
  total_stock: 0,
  low_stock: 0,
  out_of_stock: 0,
  stock_in_today: 0,
  stock_out_today: 0,
  recent_documents: [],
}

function DashboardPage() {
  const [stats, setStats] = useState(emptyStats)
  const [products, setProducts] = useState([])
  const [trendDocuments, setTrendDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError('')

      const { dateFrom, dateTo } = getTrendRange()

      try {
        const [summaryResult, productsResult, documentsResult] = await Promise.allSettled([
          getDashboardSummary(),
          getProducts({ all: 'true', ordering: 'quantity' }),
          getStockDocuments({ date_from: dateFrom, date_to: dateTo, ordering: '-created_at' }),
        ])

        if (summaryResult.status === 'fulfilled') {
          setStats(summaryResult.value)
        } else {
          setError('Không tải được dữ liệu tổng quan. Vui lòng kiểm tra backend API.')
        }

        if (productsResult.status === 'fulfilled') {
          const productData = productsResult.value.results ?? productsResult.value
          setProducts(productData)
        }

        if (documentsResult.status === 'fulfilled') {
          const documentData = documentsResult.value.results ?? documentsResult.value
          setTrendDocuments(documentData)
        }
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const attentionProducts = useMemo(() => getAttentionProducts(products), [products])
  const trendData = useMemo(() => buildTrendData(trendDocuments), [trendDocuments])

  return (
    <main className="page dashboard-page">
      <DashboardHeader />

      {error && <p className="error panel-error">{error}</p>}

      <StatsCards stats={stats} />

      <section className="dashboard-layout" aria-label="Biểu đồ quản lý kho">
        <OverviewChart stats={stats} />
        <StockStatusChart stats={stats} />
        <TransactionTrendChart trendData={trendData} />
        <StockAlertPanel stats={stats} attentionProducts={attentionProducts} />
      </section>

      <RecentTransactions documents={stats.recent_documents || []} />

      {loading && (
        <div className="dashboard-loading" aria-live="polite">
          <span />
          <span />
          <span />
        </div>
      )}
    </main>
  )
}

export default DashboardPage
