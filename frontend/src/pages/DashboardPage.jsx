import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../api/categoryApi'
import { getProducts } from '../api/productApi'
import { getSuppliers } from '../api/supplierApi'

function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    suppliers: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [productsData, categoriesData, suppliersData] = await Promise.all([
          getProducts(),
          getCategories(),
          getSuppliers(),
        ])

        setStats({
          products: productsData.count ?? productsData.length ?? 0,
          categories: categoriesData.count ?? categoriesData.length ?? 0,
          suppliers: suppliersData.count ?? suppliersData.length ?? 0,
        })
      } catch {
        setError('Không tải được dữ liệu tổng quan. Vui lòng kiểm tra backend API.')
      }
    }

    loadStats()
  }, [])

  const totalRecords = stats.products + stats.categories + stats.suppliers
  const catalogDensity = stats.categories
    ? Math.max(1, Math.round(stats.products / stats.categories))
    : stats.products
  const supplierCoverage = stats.suppliers
    ? Math.max(1, Math.round(stats.products / stats.suppliers))
    : stats.products

  return (
    <main className="page">
      <div className="page-header page-header--simple">
        <div>
          <h1>Tổng quan</h1>
        </div>
      </div>

      {error && <p className="error panel-error">{error}</p>}

      <section className="dashboard-grid">
        <article className="metric-card metric-card--hero">
          <div>
            <span>Sản phẩm đang quản lý</span>
            <strong>{stats.products}</strong>
          </div>
          <p>Mặt hàng hiện có trong hệ thống kho, sẵn sàng để lọc, cập nhật và đối soát.</p>
        </article>
        <article className="metric-card">
          <div>
            <span>Danh mục</span>
            <strong>{stats.categories}</strong>
          </div>
          <p>Nhóm phân loại giúp đội vận hành tìm đúng hàng nhanh hơn.</p>
        </article>
        <article className="metric-card">
          <div>
            <span>Nhà cung cấp</span>
            <strong>{stats.suppliers}</strong>
          </div>
          <p>Đối tác đang được gắn với dữ liệu sản phẩm trong kho.</p>
        </article>
        <aside className="ops-panel">
          <span className="eyebrow">Tín hiệu vận hành</span>
          <h2>Dữ liệu kho đã sẵn sàng để kiểm tra theo ca.</h2>
          <dl>
            <div>
              <dt>Tổng bản ghi</dt>
              <dd>{totalRecords}</dd>
            </div>
            <div>
              <dt>TB sản phẩm / danh mục</dt>
              <dd>{catalogDensity}</dd>
            </div>
            <div>
              <dt>TB sản phẩm / nhà cung cấp</dt>
              <dd>{supplierCoverage}</dd>
            </div>
          </dl>
          <Link className="text-link" to="/products/new">
            Tạo sản phẩm mới
          </Link>
        </aside>
      </section>
    </main>
  )
}

export default DashboardPage
