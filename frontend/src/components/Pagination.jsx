function Pagination({ currentPage, count, pageSize = 5, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  return (
    <div className="pagination">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Trước
      </button>

      <span>
        Trang {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Sau
      </button>
    </div>
  )
}

export default Pagination
