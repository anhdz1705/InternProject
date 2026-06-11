import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../api/categoryApi'
import { deleteProduct, getProducts } from '../api/productApi'
import { getSuppliers } from '../api/supplierApi'
import Pagination from '../components/Pagination'
import ProductTable from '../components/ProductTable'

const units = ['piece', 'box', 'kg', 'liter', 'pack']
const unitLabels = {
  piece: 'Cái',
  box: 'Hộp',
  kg: 'Kg',
  liter: 'Lít',
  pack: 'Gói',
}

function ProductListPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    supplier: '',
    unit: '',
    page: 1,
  })

  const loadProducts = useCallback(async () => {
    queueMicrotask(() => setLoading(true))
    setError('')

    try {
      const data = await getProducts(filters)
      setProducts(data.results ?? data)
      setCount(data.count ?? data.length ?? 0)
    } catch {
      setError('Không tải được danh sách sản phẩm. Vui lòng kiểm tra đăng nhập hoặc backend API.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    // Tải lại danh sách sản phẩm khi bộ lọc thay đổi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    const loadFilterOptions = async () => {
      const [categoriesData, suppliersData] = await Promise.all([
        getCategories(),
        getSuppliers(),
      ])

      setCategories(categoriesData.results ?? categoriesData)
      setSuppliers(suppliersData.results ?? suppliersData)
    }

    loadFilterOptions()
  }, [])

  const handleFilterChange = (event) => {
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value,
      page: 1,
    }))
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa sản phẩm này?')

    if (!confirmed) return

    await deleteProduct(id)
    await loadProducts()
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Kho hàng</span>
          <h1>Sản phẩm</h1>
          <p>Tìm kiếm, lọc, thêm, sửa và xóa thông tin sản phẩm trong kho.</p>
        </div>
        <Link className="button-link" to="/products/new">
          Thêm sản phẩm
        </Link>
      </div>

      <section className="filters panel" aria-label="Bộ lọc sản phẩm">
        <div className="filter-summary">
          <span>Đang hiển thị</span>
          <strong>{count} sản phẩm</strong>
        </div>

        <label className="filter-field filter-field--search">
          Tìm kiếm
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Tên sản phẩm hoặc SKU"
          />
        </label>

        <label className="filter-field">
          Danh mục
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          Nhà cung cấp
          <select
            name="supplier"
            value={filters.supplier}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả nhà cung cấp</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-field">
          Đơn vị
          <select name="unit" value={filters.unit} onChange={handleFilterChange}>
            <option value="">Tất cả đơn vị</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unitLabels[unit]}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error && <p className="error panel-error">{error}</p>}

      {loading ? (
        <div className="table-skeleton">
          <span />
          <span />
          <span />
          <span />
        </div>
      ) : (
        <ProductTable products={products} onDelete={handleDelete} />
      )}

      <Pagination
        currentPage={filters.page}
        count={count}
        onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      />
    </main>
  )
}

export default ProductListPage
