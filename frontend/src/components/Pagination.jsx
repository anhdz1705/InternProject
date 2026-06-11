function Pagination({ currentPage, count, pageSize = 10, itemLabel = 'bản ghi', onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const startItem = count === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, count)
  const visiblePages = Array.from(
    new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages]),
  ).filter((page) => page >= 1 && page <= totalPages)

  return (
    <div className="pagination enterprise-pagination">
      <p>
        Hiển thị <strong>{startItem}-{endItem}</strong> trên <strong>{count.toLocaleString('vi-VN')}</strong> {itemLabel}
      </p>

      <div className="pagination-controls">
        <button type="button" aria-label="Trang trước" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          <span aria-hidden="true">‹</span>
        </button>

        {visiblePages.map((page, index) => (
          <span className="pagination-page-group" key={page}>
            {index > 0 && page - visiblePages[index - 1] > 1 && <i>…</i>}
            <button
              className={page === currentPage ? 'active' : ''}
              type="button"
              aria-label={`Trang ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </span>
        ))}

        <button type="button" aria-label="Trang sau" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </div>
  )
}

export default Pagination
