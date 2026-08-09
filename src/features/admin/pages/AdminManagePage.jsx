import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import {
  bulkDeleteCustomRequestsApi,
  deleteCustomRequestApi,
  fetchCustomRequestsApi,
  updateCustomRequestApi,
  updateCustomRequestStatusApi,
} from '../../../api/notificationsApi'
import LoadingOverlay from '../../../components/common/LoadingOverlay'
import MaterialIcon from '../../../components/common/MaterialIcon'
import { useDialog } from '../../../context/DialogContext'
import { SHIPPING_STATUS_OPTIONS } from '../../../constants/customRequestDefaults'
import { ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { buildUnifiedManageItems } from '../../../utils/buildUnifiedManageItems'
import ManageUnifiedTable from '../components/ManageUnifiedTable'
import OrderDetailModal from '../components/OrderDetailModal'
import ExportOrdersExcelModal from '../components/ExportOrdersExcelModal'
import AdminMobileOverlayShell from '../components/AdminMobileOverlayShell'
import ManageUnifiedListMobile from '../mobile/ManageUnifiedListMobile'

const PAGE_SIZE = 25
const SCROLL_TOGGLE_DELTA = 8

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

const chipClass = (active) =>
  [
    'shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition',
    active
      ? 'bg-primary text-white'
      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high',
  ].join(' ')

function AdminManagePage() {
  const { alert, confirm } = useDialog()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [shippingFilter, setShippingFilter] = useState('')
  const [search, setSearch] = useState('')
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
  const [toolsOpen, setToolsOpen] = useState(true)

  const loadOrders = useCallback(async () => {
    setIsLoadingOrders(true)
    setError('')
    try {
      const result = await fetchCustomRequestsApi('')
      setOrders(result.data)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách.')
    } finally {
      setIsLoadingOrders(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
    function handleNewRequest() {
      loadOrders()
    }
    window.addEventListener('qoa:request:new', handleNewRequest)
    return () => window.removeEventListener('qoa:request:new', handleNewRequest)
  }, [loadOrders])

  const unifiedItems = useMemo(() => buildUnifiedManageItems(orders), [orders])

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return unifiedItems.filter((item) => {
      if (statusFilter) {
        if (item.kind !== 'order') return false
        const normalized = item.status === 'reviewed' ? 'arranging' : item.status
        if (normalized !== statusFilter) return false
      }
      if (shippingFilter) {
        const ship = item.shippingStatus || 'pending'
        if (ship !== shippingFilter) return false
      }
      if (!keyword) return true
      const haystack = [
        item.code,
        item.primaryName,
        item.secondaryPhone,
        item.deliveryLine,
        item.addressLine,
        item.productsLine,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }, [unifiedItems, statusFilter, shippingFilter, search])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const pagedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredItems.slice(start, start + PAGE_SIZE)
  }, [filteredItems, safePage])

  const pageFrom = filteredItems.length ? (safePage - 1) * PAGE_SIZE + 1 : 0
  const pageTo = Math.min(safePage * PAGE_SIZE, filteredItems.length)
  const pageButtons = useMemo(
    () => buildPageButtons(totalPages, safePage),
    [totalPages, safePage],
  )

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, shippingFilter])

  useEffect(() => {
    if (skipScrollOnMount.current) {
      skipScrollOnMount.current = false
      return
    }
    listScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setToolsOpen(true)
    lastScrollTopRef.current = 0
  }, [safePage])

  useEffect(() => {
    if (isLgUp) {
      setToolsOpen(true)
      return undefined
    }
    const el = listScrollRef.current
    if (!el) return undefined

    const onScroll = () => {
      const top = el.scrollTop
      const delta = top - lastScrollTopRef.current
      lastScrollTopRef.current = top

      if (top <= 12) {
        setToolsOpen(true)
        return
      }
      if (delta > SCROLL_TOGGLE_DELTA) {
        setToolsOpen(false)
      } else if (delta < -SCROLL_TOGGLE_DELTA) {
        setToolsOpen(true)
      }
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [isLgUp, isLoadingOrders])

  useEffect(() => {
    setSelectedIds((previous) => previous.filter((id) => filteredItems.some((item) => item.id === id)))
  }, [filteredItems])

  useEffect(() => {
    if (!highlightId || unifiedItems.length === 0) return
    const matched = unifiedItems.find((item) => item.kind === 'order' && item.id === highlightId)
    if (matched) {
      setSelectedItem(matched)
      const index = filteredItems.findIndex((item) => item.id === matched.id)
      if (index >= 0) setPage(Math.floor(index / PAGE_SIZE) + 1)
    }
  }, [highlightId, unifiedItems, filteredItems])

  function toggleSelect(id) {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  function toggleSelectAll(checked) {
    if (!checked) {
      setSelectedIds((previous) => previous.filter((id) => !pagedItems.some((item) => item.id === id)))
      return
    }
    setSelectedIds((previous) => {
      const next = new Set(previous)
      pagedItems.forEach((item) => next.add(item.id))
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
      setOrders((previous) => previous.filter((order) => order.id !== item.id))
      setSelectedIds((previous) => previous.filter((id) => id !== item.id))
      if (selectedItem?.id === item.id) setSelectedItem(null)
      setBusy(false)
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
      setOrders((previous) => previous.filter((order) => !ids.includes(order.id)))
      setSelectedIds([])
      if (selectedItem && ids.includes(selectedItem.id)) setSelectedItem(null)
      setBusy(false)
    } catch (err) {
      setBusy(false)
      await alert({
        title: 'Không thể xóa',
        message: err.message || 'Thử lại sau.',
        variant: 'error',
      })
    }
  }

  const isLoading = isLoadingOrders && unifiedItems.length === 0
  const selectedCount = selectedIds.length
  const iconBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/40 text-primary hover:bg-surface-container-low'

  function renderPaginationBar() {
    if (isLoading || filteredItems.length === 0) return null
    return (
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 md:px-3 lg:px-4">
        <p className="text-[11px] text-on-surface-variant">
          {pageFrom}–{pageTo}/{filteredItems.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 1}
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
            disabled={safePage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            className="rounded-md border border-outline-variant/40 px-2 py-1 text-[11px] disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    )
  }

  const showPagination = !isLoading && filteredItems.length > 0
  const showTools = isLgUp || toolsOpen

  function renderPage(requestClose) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <header className="shrink-0 border-b border-outline-variant/25 bg-surface-container-lowest">
          <div className="flex items-center gap-2 px-3 py-2 lg:px-6">
            {requestClose ? (
              <button
                type="button"
                onClick={requestClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Quay lại"
              >
                <MaterialIcon name="arrow_back" className="text-xl" />
              </button>
            ) : null}
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
              </>
            )}
          </div>

          <div
            className={[
              'grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
              showTools
                ? 'grid-rows-[1fr] opacity-100'
                : 'pointer-events-none grid-rows-[0fr] opacity-0',
            ].join(' ')}
            aria-hidden={!showTools}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-1.5 border-t border-outline-variant/20 px-2 pb-2 pt-1.5 md:px-3 lg:border-t-0 lg:px-4 lg:pb-2 lg:pt-0">
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

                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Mã / SĐT / tên…"
                    tabIndex={showTools ? 0 : -1}
                    className="min-w-0 flex-1 rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-2.5 py-1.5 text-xs text-on-surface outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
                  />
                  {isLgUp && selectedCount > 0 ? (
                    <>
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
                    </>
                  ) : null}
                </div>

                <div className="flex gap-1 overflow-x-auto overscroll-x-contain touch-pan-x pb-0.5 [-webkit-overflow-scrolling:touch]">
                  <button type="button" onClick={() => setShippingFilter('')} className={chipClass(shippingFilter === '')}>
                    Giao: tất cả
                  </button>
                  {SHIPPING_STATUS_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setShippingFilter(item.value)}
                      className={chipClass(shippingFilter === item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                  <span className="mx-0.5 w-px shrink-0 self-stretch bg-outline-variant/30" />
                  <button type="button" onClick={() => setStatusFilter('')} className={chipClass(statusFilter === '')}>
                    Làm: tất cả
                  </button>
                  {ORDER_STATUS_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setStatusFilter(item.value)}
                      className={chipClass(statusFilter === item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
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
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pt-2 touch-pan-y [-webkit-overflow-scrolling:touch] md:px-3 lg:px-4"
        >
          {isLoading ? (
            <p className="py-12 text-center text-xs text-on-surface-variant">Đang tải…</p>
          ) : isLgUp ? (
            <ManageUnifiedTable
              items={pagedItems}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onSelect={setSelectedItem}
              onDelete={handleDelete}
              onShippingStatusChange={handleShippingStatusChange}
              busy={busy}
              updatingId={updatingId}
            />
          ) : (
            <ManageUnifiedListMobile
              items={pagedItems}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelect={setSelectedItem}
              onDelete={handleDelete}
              onShippingStatusChange={handleShippingStatusChange}
              busy={busy}
              updatingId={updatingId}
            />
          )}
        </div>

        {showPagination ? (
          <div className="mt-auto shrink-0 border-t border-outline-variant/25 bg-surface-container-lowest">
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

        <ExportOrdersExcelModal open={exportOpen} orders={orders} onClose={() => setExportOpen(false)} />
        <LoadingOverlay open={busy} message={busyMessage} />
      </div>
    )
  }

  if (!isLgUp) {
    return (
      <AdminMobileOverlayShell backTo="/admin/orders/new">
        {({ requestClose }) => renderPage(requestClose)}
      </AdminMobileOverlayShell>
    )
  }

  return renderPage(null)
}

export default AdminManagePage
