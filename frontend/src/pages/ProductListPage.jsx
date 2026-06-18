import { useCallback, useEffect, useState } from 'react'
import { getCategories } from '../api/categoryApi'
import { deleteProduct, getProducts } from '../api/productApi'
import { getSuppliers } from '../api/supplierApi'
import Pagination from '../components/Pagination'
import ProductCreateModal from '../components/ProductCreateModal'
import ProductTable from '../components/ProductTable'

const units = ['piece', 'box', 'kg', 'liter', 'pack']
const pageSize = 10
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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
        getCategories({ all: 'true' }),
        getSuppliers({ all: 'true' }),
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

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      supplier: '',
      unit: '',
      page: 1,
    })
  }

  const hasFilters = filters.search || filters.category || filters.supplier || filters.unit

  const handleProductCreated = async () => {
    setIsCreateModalOpen(false)

    if (filters.page === 1) {
      await loadProducts()
    } else {
      setFilters((current) => ({ ...current, page: 1 }))
    }
  }

  return (
    <main className="page product-management-page">
      <div className="wms-breadcrumb">
        <span>Quản lý kho</span><span>/</span><strong>Sản phẩm</strong>
      </div>

      <div className="page-header product-page-header">
        <div>
          <h1>Sản phẩm</h1>
          <p>Quản lý danh mục hàng hóa và theo dõi trạng thái tồn kho.</p>
        </div>
        <button
          className="button-link product-add-button"
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <span>+</span> Thêm sản phẩm
        </button>
      </div>

      <section className="product-toolbar" aria-label="Bộ lọc sản phẩm">
        <label className="product-search">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
          </svg>
          <span className="sr-only">Tìm kiếm</span>
          <input
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Tìm tên sản phẩm hoặc SKU..."
          />
        </label>

        <label className="toolbar-filter">
          <span className="sr-only">Danh mục</span>
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

        <label className="toolbar-filter">
          <span className="sr-only">Nhà cung cấp</span>
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

        <label className="toolbar-filter toolbar-filter--unit">
          <span className="sr-only">Đơn vị</span>
          <select name="unit" value={filters.unit} onChange={handleFilterChange}>
            <option value="">Tất cả đơn vị</option>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unitLabels[unit]}
              </option>
            ))}
          </select>
        </label>

        {hasFilters && (
          <button className="clear-filters-button" type="button" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        )}
      </section>

      {error && <p className="error panel-error">{error}</p>}

      <section className="product-grid-panel">
        <div className="product-grid-meta">
          <div>
            <strong>Danh sách sản phẩm</strong>
            <span>{count.toLocaleString('vi-VN')} sản phẩm trong hệ thống</span>
          </div>
          <span>Cập nhật theo dữ liệu tồn kho hiện tại</span>
        </div>

        {loading ? (
          <div className="table-skeleton">
            <span />
            <span />
            <span />
            <span />
          </div>
        ) : (
          <ProductTable
            products={products}
            onDelete={handleDelete}
            currentPage={filters.page}
            pageSize={pageSize}
          />
        )}

        <Pagination
          currentPage={filters.page}
          count={count}
          pageSize={pageSize}
          itemLabel="sản phẩm"
          onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
        />
      </section>

      {isCreateModalOpen && (
        <ProductCreateModal
          categories={categories}
          suppliers={suppliers}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleProductCreated}
        />
      )}
    </main>
  )
}

export default ProductListPage
