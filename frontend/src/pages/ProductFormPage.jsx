import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCategories } from '../api/categoryApi'
import {
  createProduct,
  getProduct,
  updateProduct,
} from '../api/productApi'
import { getSuppliers } from '../api/supplierApi'

const emptyProduct = {
  name: '',
  sku: '',
  category: '',
  supplier: '',
  unit: 'piece',
  price: '',
  description: '',
}

const units = ['piece', 'box', 'kg', 'liter', 'pack']
const unitLabels = {
  piece: 'Cái',
  box: 'Hộp',
  kg: 'Kg',
  liter: 'Lít',
  pack: 'Gói',
}

function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(emptyProduct)
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesData, suppliersData] = await Promise.all([
          getCategories({ all: 'true' }),
          getSuppliers({ all: 'true' }),
        ])

        setCategories(categoriesData.results ?? categoriesData)
        setSuppliers(suppliersData.results ?? suppliersData)
      } catch {
        setError('Không tải được danh mục và nhà cung cấp.')
      }
    }

    loadOptions()
  }, [])

  useEffect(() => {
    if (!isEdit) return

    const loadProduct = async () => {
      try {
        const data = await getProduct(id)
        setForm({
          name: data.name ?? '',
          sku: data.sku ?? '',
          category: data.category ?? '',
          supplier: data.supplier ?? '',
          unit: data.unit ?? 'piece',
          price: data.price ?? '',
          description: data.description ?? '',
        })
      } catch {
        setError('Không tải được thông tin sản phẩm này.')
      }
    }

    loadProduct()
  }, [id, isEdit])

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...form,
      category: form.category || null,
      supplier: form.supplier || null,
      price: Number(form.price),
    }

    try {
      if (isEdit) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }

      navigate('/products')
    } catch {
      setError('Không lưu được sản phẩm. Vui lòng kiểm tra các trường bắt buộc.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="page-header product-form-header">
        <div>
          <span className="eyebrow">Thông tin sản phẩm</span>
          <h1>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
          <p>{isEdit ? 'Cập nhật thông tin hàng hóa. Số lượng được quản lý bằng phiếu kho.' : 'Tạo hàng hóa mới với tồn kho ban đầu bằng 0.'}</p>
        </div>
      </div>

      {error && <p className="error panel-error">{error}</p>}

      <form className="form-grid product-form" onSubmit={handleSubmit}>
        <section className="form-section form-section--identity">
          <div className="section-heading">
            <span>01</span>
            <h2>Thông tin chính</h2>
          </div>

          <label className="field-span-6">
            Tên sản phẩm
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label className="field-span-6">
            SKU
            <input name="sku" value={form.sku} onChange={handleChange} required />
          </label>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <span>02</span>
            <h2>Phân loại và nguồn cung</h2>
          </div>

          <label className="field-span-6">
            Danh mục
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Chưa chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field-span-6">
            Nhà cung cấp
            <select name="supplier" value={form.supplier} onChange={handleChange}>
              <option value="">Chưa chọn nhà cung cấp</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="form-section">
          <div className="section-heading">
            <span>03</span>
            <h2>Đơn vị và giá</h2>
          </div>

          <label className="field-span-6">
            Đơn vị
            <select name="unit" value={form.unit} onChange={handleChange}>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unitLabels[unit]}
                </option>
              ))}
            </select>
          </label>

          <label className="field-span-6">
            Giá
            <input
              name="price"
              type="number"
              min="0"
              value={form.price}
              onChange={handleChange}
              required
            />
          </label>

        </section>

        <section className="form-section form-section--description">
          <div className="section-heading">
            <span>04</span>
            <h2>Mô tả</h2>
          </div>

          <label className="field-span-12">
            Ghi chú mô tả
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
            />
          </label>
        </section>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/products')}>
            Hủy
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default ProductFormPage
