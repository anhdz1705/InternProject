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
  quantity: '',
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
          getCategories(),
          getSuppliers(),
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
          quantity: data.quantity ?? '',
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
      quantity: Number(form.quantity),
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
      <div className="page-header">
        <div>
          <span className="eyebrow">Thông tin sản phẩm</span>
          <h1>{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h1>
          <p>{isEdit ? 'Cập nhật chi tiết sản phẩm.' : 'Tạo một sản phẩm mới.'}</p>
        </div>
      </div>

      {error && <p className="error panel-error">{error}</p>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Tên sản phẩm
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>
          SKU
          <input name="sku" value={form.sku} onChange={handleChange} required />
        </label>

        <label>
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

        <label>
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

        <label>
          Đơn vị
          <select name="unit" value={form.unit} onChange={handleChange}>
            {units.map((unit) => (
              <option key={unit} value={unit}>
                {unitLabels[unit]}
              </option>
            ))}
          </select>
        </label>

        <label>
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

        <label>
          Số lượng
          <input
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-grid__full">
          Mô tả
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
          />
        </label>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/products')}>
            Hủy
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </form>
    </main>
  )
}

export default ProductFormPage
