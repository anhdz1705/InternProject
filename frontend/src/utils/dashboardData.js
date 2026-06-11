export const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN')

export const formatDateTime = (value) => new Date(value).toLocaleString('vi-VN')

const toDateInputValue = (date) => date.toISOString().slice(0, 10)

export const getTrendRange = () => {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 6)

  return {
    dateFrom: toDateInputValue(start),
    dateTo: toDateInputValue(end),
  }
}

export const buildOverviewMetrics = (stats) => [
  { label: 'Tổng tồn kho', value: Number(stats.total_stock) || 0, color: '#0f766e' },
  { label: 'Nhập hôm nay', value: Number(stats.stock_in_today) || 0, color: '#14b8a6' },
  { label: 'Xuất hôm nay', value: Number(stats.stock_out_today) || 0, color: '#f59e0b' },
  { label: 'Tổng sản phẩm', value: Number(stats.products) || 0, color: '#065f46' },
  { label: 'Sắp hết hàng', value: Number(stats.low_stock) || 0, color: '#d97706' },
  { label: 'Đã hết hàng', value: Number(stats.out_of_stock) || 0, color: '#dc2626' },
]

export const buildStatusMetrics = (stats) => {
  const products = Number(stats.products) || 0
  const lowStock = Number(stats.low_stock) || 0
  const outOfStock = Number(stats.out_of_stock) || 0
  const healthy = Math.max(products - lowStock - outOfStock, 0)

  return [
    { label: 'Còn hàng', value: healthy, color: '#047857' },
    { label: 'Sắp hết', value: lowStock, color: '#f59e0b' },
    { label: 'Đã hết', value: outOfStock, color: '#dc2626' },
  ]
}

export const buildTrendData = (documents) => {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(today.getDate() - (6 - index))
    const key = toDateInputValue(date)

    return {
      key,
      label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      stockIn: 0,
      stockOut: 0,
    }
  })
  const dayMap = new Map(days.map((day) => [day.key, day]))

  documents.forEach((document) => {
    const key = toDateInputValue(new Date(document.created_at))
    const targetDay = dayMap.get(key)
    if (!targetDay) return

    const quantity = (document.items || []).reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    )

    if (document.transaction_type === 'IN') {
      targetDay.stockIn += quantity
    } else {
      targetDay.stockOut += quantity
    }
  })

  return days
}

export const getAttentionProducts = (products) =>
  [...products]
    .filter((product) => Number(product.quantity) <= 10)
    .sort((first, second) => Number(first.quantity) - Number(second.quantity))
    .slice(0, 5)

export const getDocumentQuantity = (document) =>
  (document.items || []).reduce((total, item) => total + (Number(item.quantity) || 0), 0)

export const getDocumentProductSummary = (document) => {
  const items = document.items || []
  if (!items.length) return 'Không có sản phẩm'

  const firstItem = items[0]
  const moreCount = items.length - 1

  return moreCount > 0
    ? `${firstItem.product_name} +${moreCount} sản phẩm`
    : firstItem.product_name
}
