import { useEffect, useState } from 'react'
import { createProduct } from '../api/productApi'

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

function ProductCreateModal({ categories, suppliers, onClose, onCreated }) {
  const [form, setForm] = useState(emptyProduct)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

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

    try {
      await createProduct({
        ...form,
        category: form.category || null,
        supplier: form.supplier || null,
        price: Number(form.price),
      })
      onCreated()
    } catch {
      setError('Không tạo được sản phẩm. Vui lòng kiểm tra tên, SKU và giá.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="product-modal__header">
          <div>
            <span>Danh mục sản phẩm</span>
            <h2 id="product-modal-title">Thêm sản phẩm</h2>
          </div>
          <button type="button" aria-label="Đóng form thêm sản phẩm" onClick={onClose}>
            ×
          </button>
        </header>

        {error && <p className="error panel-error product-modal__error">{error}</p>}

        <form className="product-modal__form" onSubmit={handleSubmit}>
          <div className="product-modal__grid">
            <label className="compact-field">
              <span>Tên sản phẩm <b>*</b></span>
              <input name="name" value={form.name} onChange={handleChange} required autoFocus />
            </label>

            <label className="compact-field">
              <span>SKU <b>*</b></span>
              <input name="sku" value={form.sku} onChange={handleChange} required />
            </label>

            <label className="compact-field">
              <span>Danh mục</span>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Chưa chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="compact-field">
              <span>Nhà cung cấp</span>
              <select name="supplier" value={form.supplier} onChange={handleChange}>
                <option value="">Chưa chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </label>

            <label className="compact-field">
              <span>Đơn vị</span>
              <select name="unit" value={form.unit} onChange={handleChange}>
                {units.map((unit) => (
                  <option key={unit} value={unit}>{unitLabels[unit]}</option>
                ))}
              </select>
            </label>

            <label className="compact-field">
              <span>Giá <b>*</b></span>
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label className="compact-field product-modal__description">
              <span>Ghi chú mô tả</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
              />
            </label>
          </div>

          <footer className="product-modal__actions">
            <p>Tồn kho ban đầu bằng 0. Hãy dùng phiếu nhập kho để tăng số lượng.</p>
            <div>
              <button className="cancel-button" type="button" onClick={onClose}>
                Hủy bỏ
              </button>
              <button className="confirm-stock-button" type="submit" disabled={loading}>
                {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default ProductCreateModal
