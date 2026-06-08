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

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Vận hành kho</span>
          <h1>Tổng quan</h1>
          <p>Theo dõi nhanh dữ liệu kho, danh mục và nhà cung cấp.</p>
        </div>
        <Link className="button-link" to="/products">
          Xem sản phẩm
        </Link>
      </div>

      {error && <p className="error panel-error">{error}</p>}

      <section className="stats-grid">
        <article>
          <div>
            <span>Sản phẩm</span>
            <strong>{stats.products}</strong>
          </div>
          <p>Mặt hàng hiện đang được ghi nhận trong hệ thống kho.</p>
        </article>
        <article>
          <div>
            <span>Danh mục</span>
            <strong>{stats.categories}</strong>
          </div>
          <p>Nhóm dùng để phân loại và lọc sản phẩm.</p>
        </article>
        <article>
          <div>
            <span>Nhà cung cấp</span>
            <strong>{stats.suppliers}</strong>
          </div>
          <p>Đơn vị cung ứng đang gắn với dữ liệu sản phẩm.</p>
        </article>
      </section>
    </main>
  )
}

export default DashboardPage
