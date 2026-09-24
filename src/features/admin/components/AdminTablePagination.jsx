function AdminTablePagination({ page, total, pageSize, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(page * pageSize, total)

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 text-sm text-on-surface-variant" aria-label="Phân trang bảng">
      <span>{from}–{to}/{total}</span>
      <div className="flex items-center gap-1">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg border border-outline-variant/40 px-3 py-1.5 disabled:opacity-40" aria-label="Trang trước">
          ‹
        </button>
        <span className="min-w-16 text-center">{page}/{totalPages}</span>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-lg border border-outline-variant/40 px-3 py-1.5 disabled:opacity-40" aria-label="Trang sau">
          ›
        </button>
      </div>
    </nav>
  )
}

export default AdminTablePagination
