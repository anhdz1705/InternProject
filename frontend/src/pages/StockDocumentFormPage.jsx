import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../api/productApi'
import { getSuppliers } from '../api/supplierApi'
import { createStockDocument } from '../api/stockApi'

const emptyLine = { product: '', quantity: 1, unit_price: '' }

const getErrorMessage = (error) => {
  const data = error.response?.data
  if (!data) return 'Không thể tạo phiếu. Vui lòng kiểm tra kết nối backend.'

  const firstValue = Object.values(data)[0]
  return Array.isArray(firstValue) ? firstValue[0] : String(firstValue)
}

function StockDocumentFormPage({ transactionType }) {
  const navigate = useNavigate()
  const isStockIn = transactionType === 'IN'
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [form, setForm] = useState({
    supplier: '',
    recipient: '',
    note: '',
    lines: [{ ...emptyLine }],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [productsData, suppliersData] = await Promise.all([
          getProducts({ all: 'true' }),
          getSuppliers({ all: 'true' }),
        ])
        setProducts(productsData.results ?? productsData)
        setSuppliers(suppliersData.results ?? suppliersData)
      } catch {
        setError('Không tải được danh sách sản phẩm và nhà cung cấp.')
      }
    }

    loadOptions()
  }, [])

  const totalQuantity = useMemo(
    () => form.lines.reduce((total, line) => total + (Number(line.quantity) || 0), 0),
    [form.lines],
  )
  const totalValue = useMemo(
    () => form.lines.reduce((total, line) => {
      const product = products.find((item) => String(item.id) === String(line.product))
      const unitPrice = line.unit_price === '' ? Number(product?.price || 0) : Number(line.unit_price)
      return total + (Number(line.quantity) || 0) * unitPrice
    }, 0),
    [form.lines, products],
  )

  const handleFieldChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleLineChange = (index, event) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) =>
        lineIndex === index
          ? { ...line, [event.target.name]: event.target.value }
          : line,
      ),
    }))
  }

  const addLine = () => {
    setForm((current) => ({ ...current, lines: [...current.lines, { ...emptyLine }] }))
  }

  const removeLine = (index) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.filter((_, lineIndex) => lineIndex !== index),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const lines = form.lines.map((line) => {
      const payload = {
        product: Number(line.product),
        quantity: Number(line.quantity),
      }
      if (isStockIn && line.unit_price !== '') {
        payload.unit_price = Number(line.unit_price)
      }
      return payload
    })

    try {
      const document = await createStockDocument({
        transaction_type: transactionType,
        supplier: isStockIn ? Number(form.supplier) : null,
        recipient: isStockIn ? '' : form.recipient,
        note: form.note,
        lines,
      })
      navigate(`/stock-history/${document.id}`)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page wms-entry-page">
      <div className="wms-breadcrumb">
        <span>Quản lý kho</span><span>/</span><strong>{isStockIn ? 'Nhập kho' : 'Xuất kho'}</strong>
      </div>

      <div className="page-header wms-entry-header">
        <div>
          <h1>{isStockIn ? 'Nhập kho' : 'Xuất kho'}</h1>
          <p>
            {isStockIn
              ? 'Tạo phiếu nhập hàng mới từ nhà cung cấp.'
              : 'Tạo phiếu xuất hàng và kiểm tra tồn kho.'}
          </p>
        </div>
        <div className="entry-metrics">
          <div className="entry-metric">
            <span>Tổng số lượng</span>
            <strong>{totalQuantity.toLocaleString('vi-VN')}</strong>
            <small>{form.lines.length} dòng sản phẩm</small>
          </div>
          <div className="entry-metric entry-metric--value">
            <span>Tổng giá trị</span>
            <strong>{totalValue.toLocaleString('vi-VN')}</strong>
            <small>VND</small>
          </div>
        </div>
      </div>

      {error && <p className="error panel-error">{error}</p>}

      <form className="stock-document-form" onSubmit={handleSubmit}>
        <section className="stock-document-meta enterprise-panel">
          <div className="enterprise-panel__header">
            <div>
              <h2>Thông tin phiếu</h2>
              <p>Thông tin chung cho giao dịch kho này.</p>
            </div>
            <span className="status-chip">Bản nháp</span>
          </div>

          <div className="document-meta-grid">
            {isStockIn ? (
              <label className="compact-field">
                <span>Nhà cung cấp <b>*</b></span>
                <select name="supplier" value={form.supplier} onChange={handleFieldChange} required>
                  <option value="">Chọn nhà cung cấp</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="compact-field">
                <span>Người nhận hoặc lý do xuất <b>*</b></span>
                <input name="recipient" value={form.recipient} onChange={handleFieldChange} required />
              </label>
            )}

            <label className="compact-field compact-field--wide">
              <span>Ghi chú</span>
              <input name="note" value={form.note} onChange={handleFieldChange} placeholder="Thêm ghi chú cho phiếu..." />
            </label>
          </div>
        </section>

        <section className="document-lines enterprise-panel">
          <div className="enterprise-panel__header document-lines__header">
            <div>
              <h2>Sản phẩm trong phiếu</h2>
              <p>Thêm sản phẩm, số lượng và đơn giá nhập kho.</p>
            </div>
            <button className="add-row-button" type="button" onClick={addLine}>
              <span>+</span> Thêm dòng
            </button>
          </div>

          <div className="entry-grid-wrap">
            <table className="entry-grid">
              <thead>
                <tr>
                  <th className="entry-grid__number">STT</th>
                  <th>Sản phẩm / SKU</th>
                  <th className="entry-grid__quantity">Số lượng</th>
                  <th className="entry-grid__price">Đơn giá</th>
                  <th className="entry-grid__total">Thành tiền</th>
                  <th className="entry-grid__action">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {form.lines.map((line, index) => {
                  const selectedProduct = products.find(
                    (product) => String(product.id) === String(line.product),
                  )
                  const unitPrice = line.unit_price === '' ? Number(selectedProduct?.price || 0) : Number(line.unit_price)
                  const lineTotal = (Number(line.quantity) || 0) * unitPrice

                  return (
                    <tr key={index}>
                      <td className="entry-grid__number"><span>{String(index + 1).padStart(2, '0')}</span></td>
                      <td>
                        <select className="grid-input grid-product-select" name="product" value={line.product} onChange={(event) => handleLineChange(index, event)} required>
                          <option value="">Chọn sản phẩm</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} · {product.sku} · Tồn {product.quantity}
                            </option>
                          ))}
                        </select>
                        {selectedProduct && <small className="stock-hint">Tồn hiện tại: {selectedProduct.quantity} {selectedProduct.unit}</small>}
                      </td>
                      <td>
                        <input className="grid-input numeric-input" name="quantity" type="number" min="1" value={line.quantity} onChange={(event) => handleLineChange(index, event)} required />
                      </td>
                      <td>
                        {isStockIn ? (
                          <input
                            className="grid-input numeric-input"
                            name="unit_price"
                            type="number"
                            min="0"
                            value={line.unit_price}
                            onChange={(event) => handleLineChange(index, event)}
                            placeholder={selectedProduct ? Number(selectedProduct.price).toLocaleString('vi-VN') : '0'}
                          />
                        ) : (
                          <span className="grid-readonly-value">{unitPrice.toLocaleString('vi-VN')}</span>
                        )}
                      </td>
                      <td><strong className="line-total">{lineTotal.toLocaleString('vi-VN')} ₫</strong></td>
                      <td className="entry-grid__action">
                        <button className="line-remove" type="button" disabled={form.lines.length === 1} onClick={() => removeLine(index)} aria-label={`Xóa dòng ${index + 1}`}>×</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="stock-document-actions">
          <div>
            <strong>{totalQuantity.toLocaleString('vi-VN')} sản phẩm</strong>
            <span>Tổng giá trị: {totalValue.toLocaleString('vi-VN')} VND</span>
          </div>
          <div>
            <button className="cancel-button" type="button" onClick={() => navigate('/stock-history')}>Hủy bỏ</button>
            <button className="confirm-stock-button" type="submit" disabled={loading}>
            {loading ? 'Đang xác nhận...' : `Xác nhận ${isStockIn ? 'nhập' : 'xuất'} kho`}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}

export default StockDocumentFormPage
