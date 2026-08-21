import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  bulkDeleteCustomRequestsApi,
  deleteCustomRequestApi,
  fetchCustomRequestByIdApi,
  fetchCustomRequestsApi,
  updateCustomRequestApi,
  updateCustomRequestStatusApi,
} from '../../../api/notificationsApi'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useDialog } from '../../../context/DialogContext'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { buildUnifiedManageItems } from '../../../utils/buildUnifiedManageItems'
import {
  EMPTY_ORDER_FILTERS,
  parseOrderFiltersFromSearch,
  serializeOrderFilters,
  toOrderListQuery,
} from '../../../utils/orderFilters'
import ManageUnifiedTable, { ManageUnifiedTableSkeleton } from '../components/ManageUnifiedTable'
import OrderDetailModal from '../components/OrderDetailModal'
import ExportOrdersExcelModal from '../components/ExportOrdersExcelModal'
import OrderFilters from '../components/OrderFilters'
import ManageUnifiedListMobile, {
  ManageUnifiedListMobileSkeleton,
} from '../mobile/ManageUnifiedListMobile'

const PAGE_SIZE = 25
const SEARCH_DEBOUNCE_MS = 300
const EXPORT_LIMIT = 2000

function buildPageButtons(totalPages, safePage) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 5) return true
    if (page === 1 || page === totalPages) return true
    return Math.abs(page - safePage) <= 1
  })
  return pages.reduce((acc, page, index, list) => {
    if (index > 0 && page - list[index - 1] > 1) acc.push('…')
    acc.push(page)
    return acc
  }, [])
}

function AdminManagePage() {
  const { alert, confirm } = useDialog()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const filters = useMemo(() => parseOrderFiltersFromSearch(searchParams), [searchParams])
  const [orders, setOrders] = useState([])
  const [exportOrders, setExportOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState(() => searchParams.get('q') || '')
  const [page, setPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [busy, setBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState('Đang xử lý...')
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [exportOpen, setExportOpen] = useState(false)
  const isLgUp = useIsLgUp()
  const listScrollRef = useRef(null)
  const skipScrollOnMount = useRef(true)
  const lastScrollTopRef = useRef(0)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const loadSeqRef = useRef(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = search.trim()
      if (next === (filters.q || '')) return
      setPage(1)
      setSearchParams(serializeOrderFilters({ ...filters, q: next }), { replace: true })
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [search, filters, setSearchParams])

  const listQuery = useMemo(
    () => toOrderListQuery(filters, { page, limit: PAGE_SIZE }),
    [page, filters],
  )

  function patchFilters(patch) {
    setPage(1)
    setSearchParams(serializeOrderFilters({ ...filters, ...patch }), { replace: true })
  }

  function resetFilters() {
    setSearch('')
    setPage(1)
    setSearchParams(serializeOrderFilters(EMPTY_ORDER_FILTERS), { replace: true })
  }

  const loadOrders = useCallback(async () => {
    const seq = ++loadSeqRef.current
    setIsLoadingOrders(true)
    setError('')
    try {
      const result = await fetchCustomRequestsApi(listQuery)
      if (seq !== loadSeqRef.current) return
      const rows = Array.isArray(result.data) ? result.data : []
      setOrders(rows)
      const pagination = result.pagination || {}
      const nextTotal =
        pagination.total != null ? Number(pagination.total) : rows.length
      const nextTotalPages =
        pagination.totalPages != null
          ? Math.max(1, Number(pagination.totalPages))
          : Math.max(1, Math.ceil(nextTotal / PAGE_SIZE))
      setTotal(Number.isFinite(nextTotal) ? nextTotal : rows.length)
      setTotalPages(Number.isFinite(nextTotalPages) ? nextTotalPages : 1)
      if (page > nextTotalPages) setPage(nextTotalPages)
    } catch (err) {
      if (seq !== loadSeqRef.current) return
      setError(err.message || 'Không thể tải danh sách.')
    } finally {
      if (seq === loadSeqRef.current) setIsLoadingOrders(false)
    }
  }, [listQuery, page])

  useEffect(() => {
    loadOrders()
    function handleNewRequest() {
      loadOrders()
    }
    window.addEventListener('qoa:request:new', handleNewRequest)
    return () => window.removeEventListener('qoa:request:new', handleNewRequest)
  }, [loadOrders])

  useEffect(() => {
    if (!exportOpen) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const result = await fetchCustomRequestsApi({
          ...toOrderListQuery(filters, { page: 1, limit: EXPORT_LIMIT }),
        })
        if (!cancelled) setExportOrders(result.data || [])
      } catch {
        if (!cancelled) setExportOrders([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [exportOpen, filters])

  const unifiedItems = useMemo(() => buildUnifiedManageItems(orders), [orders])
  const safePage = Math.min(page, totalPages)
  const pageFrom = total ? (safePage - 1) * PAGE_SIZE + 1 : 0
  const pageTo = Math.min(safePage * PAGE_SIZE, total)
  const pageButtons = useMemo(
    () => buildPageButtons(totalPages, safePage),
    [totalPages, safePage],
  )

  useEffect(() => {
    if (skipScrollOnMount.current) {
      skipScrollOnMount.current = false
      return
    }
    listScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
    lastScrollTopRef.current = 0
  }, [safePage])

  useEffect(() => {
    setSelectedIds((previous) => previous.filter((id) => unifiedItems.some((item) => item.id === id)))
  }, [unifiedItems])

  useEffect(() => {
    if (!highlightId) return undefined
    if (!isLgUp) {
      navigate(`/admin/orders/${highlightId}/edit`, { replace: true })
      return undefined
    }
    let cancelled = false
    ;(async () => {
      try {
        const result = await fetchCustomRequestByIdApi(highlightId)
        if (cancelled || !result?.data) return
        const [matched] = buildUnifiedManageItems([result.data])
        if (matched) setSelectedItem(matched)
      } catch {
        // ignore missing highlight target
      }
    })()
    return () => {
      cancelled = true
    }
  }, [highlightId, isLgUp, navigate])

  function handleSelectOrder(item) {
    if (!isLgUp) {
      navigate(`/admin/orders/${item.id}/edit`)
      return
    }
    setSelectedItem(item)
  }

  function toggleSelect(id) {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  function toggleSelectAll(checked) {
    if (!checked) {
      setSelectedIds((previous) => previous.filter((id) => !unifiedItems.some((item) => item.id === id)))
      return
    }
    setSelectedIds((previous) => {
      const next = new Set(previous)
      unifiedItems.forEach((item) => next.add(item.id))
      return Array.from(next)
    })
  }

  async function handleStatusChange(id, status) {
    setUpdatingId(id)
    try {
      const result = await updateCustomRequestStatusApi(id, status)
      setOrders((items) => items.map((item) => (item.id === id ? result.data : item)))
      setSelectedItem((current) =>
        current?.kind === 'order' && current.id === id
          ? { ...current, raw: result.data, status: result.data.status }
          : current,
      )
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Không thể cập nhật trạng thái.',
        variant: 'error',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleShippingStatusChange(id, shippingStatus) {
    setUpdatingId(id)
    try {
      const result = await updateCustomRequestApi(id, { shippingStatus })
      setOrders((items) => items.map((item) => (item.id === id ? result.data : item)))
      setSelectedItem((current) => {
        if (!(current?.kind === 'order' && current.id === id)) return current
        const [next] = buildUnifiedManageItems([result.data])
        return next
      })
    } catch (err) {
      await alert({
        title: 'Không thể cập nhật',
        message: err.message || 'Không thể cập nhật trạng thái giao hàng.',
        variant: 'error',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  function handleOrderUpdated(updated) {
    setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)))
    setSelectedItem((current) => {
      if (!(current?.kind === 'order' && current.id === updated.id)) return current
      const [next] = buildUnifiedManageItems([updated])
      return next
    })
  }

  async function handleDelete(item) {
    if (busy) return
    const ok = await confirm({
      title: 'Xóa đơn hàng',
      message: `Xóa hẳn đơn “${item.code} — ${item.primaryName}”?`,
      confirmLabel: 'Xóa',
      variant: 'danger',
    })
    if (!ok) return

    setBusyMessage('Đang xóa...')
    setBusy(true)
    try {
      await deleteCustomRequestApi(item.id)
      setSelectedIds((previous) => previous.filter((id) => id !== item.id))
      if (selectedItem?.id === item.id) setSelectedItem(null)
      setBusy(false)
      await loadOrders()
    } catch (err) {
      setBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    }
  }

  async function handleBulkDelete() {
    if (busy || selectedIds.length === 0) return
    const ok = await confirm({
      title: 'Xóa nhiều đơn',
      message: `Xóa ${selectedIds.length} đơn đã chọn?`,
      confirmLabel: `Xóa ${selectedIds.length}`,
      variant: 'danger',
    })
    if (!ok) return

    const ids = [...selectedIds]
    setBusyMessage(`Đang xóa ${ids.length} đơn...`)
    setBusy(true)
    try {
      await bulkDeleteCustomRequestsApi(ids)
      setSelectedIds([])
      if (selectedItem && ids.includes(selectedItem.id)) setSelectedItem(null)
      setBusy(false)
      await loadOrders()
    } catch (err) {
      setBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    }
  }

  const selectedCount = selectedIds.length
  const iconBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/40 text-primary hover:bg-surface-container-low'

  function renderPaginationBar() {
    if (total === 0) return null
    return (
      <div className="flex items-center justify-between gap-2 px-2 py-2 md:px-3 lg:px-4">
        <p className="text-[11px] text-on-surface-variant">
          {pageFrom}–{pageTo}/{total}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1 || isLoadingOrders}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-md border border-outline-variant/40 px-2 py-1 text-[11px] disabled:opacity-40"
          >
            ‹
          </button>
          {pageButtons.map((item, index) =>
            item === '…' ? (
              <span key={`gap-${index}`} className="px-0.5 text-[11px] text-outline">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={isLoadingOrders}
                onClick={() => setPage(item)}
                className={[
                  'min-w-6 rounded-md px-1.5 py-1 text-[11px] font-medium',
                  item === safePage
                    ? 'bg-primary text-white'
                    : 'border border-outline-variant/40 text-on-surface',
                ].join(' ')}
              >
                {item}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={safePage >= totalPages || isLoadingOrders}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-md border border-outline-variant/40 px-2 py-1 text-[11px] disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    )
  }

  const showPagination = total > 0
  const emptyLabel =
    filters.q?.trim() ||
    filters.status ||
    filters.shippingStatus ||
    filters.paymentStatus ||
    filters.from ||
    filters.to
      ? 'Không có đơn khớp bộ lọc'
      : 'Chưa có đơn'

  function renderPage() {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
        <header className="shrink-0 border-b border-outline-variant/25 bg-surface-container-lowest">
          <div className="flex items-center gap-2 px-3 py-2 lg:px-6">
            <h2 className="min-w-0 flex-1 truncate font-display text-base text-primary lg:text-xl">
              Đơn hàng
            </h2>
            {isLgUp ? (
              <>
                <button type="button" onClick={() => setExportOpen(true)} className={iconBtn} title="Xuất Excel">
                  <MaterialIcon name="download" className="text-lg" />
                </button>
                <Link to="/admin/orders/import" className={iconBtn} title="Import">
                  <MaterialIcon name="upload_file" className="text-lg" />
                </Link>
                <Link
                  to="/admin/orders/new"
                  className="inline-flex h-8 items-center gap-0.5 rounded-lg bg-primary px-2.5 text-xs font-semibold text-white hover:bg-primary-container"
                >
                  <MaterialIcon name="add" className="text-base" />
                  Lên đơn
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/orders/import" className={iconBtn} title="Import">
                  <MaterialIcon name="upload_file" className="text-lg" />
                </Link>
                <button type="button" onClick={() => setExportOpen(true)} className={iconBtn} title="Xuất Excel">
                  <MaterialIcon name="download" className="text-lg" />
                </button>
                <Link
                  to="/admin/orders/new"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-container"
                  title="Lên đơn"
                  aria-label="Lên đơn"
                >
                  <MaterialIcon name="add" className="text-lg" />
                </Link>
              </>
            )}
          </div>

          <div className="bg-surface-container-low/60">
            <div className="space-y-1.5 px-2 pb-2 pt-1.5 md:px-3 lg:px-4 lg:pb-3 lg:pt-2">
                {!isLgUp && selectedCount > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-on-surface-variant">{selectedCount} chọn</span>
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="rounded-md px-2 py-1 text-[11px] text-on-surface-variant hover:bg-surface-container-low"
                    >
                      Bỏ
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleBulkDelete()}
                      className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </div>
                ) : null}

                <OrderFilters
                  filters={filters}
                  search={search}
                  onSearchChange={setSearch}
                  onChange={patchFilters}
                  onReset={resetFilters}
                  expanded={filtersOpen}
                  onToggleExpanded={() => setFiltersOpen((open) => !open)}
                />

                {isLgUp && selectedCount > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-on-surface-variant">{selectedCount} chọn</span>
                    <button
                      type="button"
                      onClick={() => setSelectedIds([])}
                      className="rounded-md px-2 py-1 text-[11px] text-on-surface-variant hover:bg-surface-container-low"
                    >
                      Bỏ
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleBulkDelete()}
                      className="rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
        </header>

        {error ? (
          <p className="shrink-0 mx-2 mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 md:mx-3 lg:mx-4" role="alert">
            {error}
          </p>
        ) : null}

        <div
          ref={listScrollRef}
          data-scroll-lock-scrollable
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pt-2 touch-pan-y [overflow-anchor:none] [-webkit-overflow-scrolling:touch] md:px-3 lg:px-4"
          aria-busy={isLoadingOrders || undefined}
        >
          {isLoadingOrders ? (
            isLgUp ? (
              <ManageUnifiedTableSkeleton rows={8} />
            ) : (
              <ManageUnifiedListMobileSkeleton rows={8} />
            )
          ) : isLgUp ? (
            <ManageUnifiedTable
              items={unifiedItems}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onSelect={handleSelectOrder}
              onDelete={handleDelete}
              onShippingStatusChange={handleShippingStatusChange}
              busy={busy}
              updatingId={updatingId}
              emptyLabel={emptyLabel}
            />
          ) : (
            <ManageUnifiedListMobile
              items={unifiedItems}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelect={handleSelectOrder}
              onDelete={handleDelete}
              onShippingStatusChange={handleShippingStatusChange}
              busy={busy}
              updatingId={updatingId}
              emptyLabel={emptyLabel}
            />
          )}
        </div>

        {showPagination ? (
          <div className="relative z-10 mt-auto shrink-0 border-t border-outline-variant/25 bg-surface-container-lowest">
            {renderPaginationBar()}
          </div>
        ) : null}

        <AnimatePresence>
          {selectedItem?.kind === 'order' ? (
            <OrderDetailModal
              key={selectedItem.id}
              request={selectedItem.raw}
              onClose={() => setSelectedItem(null)}
              onStatusChange={handleStatusChange}
              onShippingStatusChange={handleShippingStatusChange}
              onUpdated={handleOrderUpdated}
              isUpdating={updatingId === selectedItem.id}
            />
          ) : null}
        </AnimatePresence>

        <ExportOrdersExcelModal open={exportOpen} orders={exportOrders} onClose={() => setExportOpen(false)} />
        <LoadingOverlay open={busy} message={busyMessage} />
      </div>
    )
  }

  return renderPage()
}

export default AdminManagePage
