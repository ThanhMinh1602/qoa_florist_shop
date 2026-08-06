import { useCallback, useEffect, useMemo, useState } from 'react'
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
import ManageUnifiedListMobile from '../mobile/ManageUnifiedListMobile'

function AdminManagePage() {
  const { alert, confirm } = useDialog()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [shippingFilter, setShippingFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [busy, setBusy] = useState(false)
  const [busyMessage, setBusyMessage] = useState('Đang xử lý...')
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const isLgUp = useIsLgUp()

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

  useEffect(() => {
    setSelectedIds((previous) => previous.filter((id) => filteredItems.some((item) => item.id === id)))
  }, [filteredItems])

  useEffect(() => {
    if (!highlightId || unifiedItems.length === 0) return

    const matched = unifiedItems.find((item) => item.kind === 'order' && item.id === highlightId)
    if (matched) {
      setSelectedItem(matched)
    }
  }, [highlightId, unifiedItems])

  function toggleSelect(id) {
    setSelectedIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    )
  }

  function toggleSelectAll(checked) {
    if (!checked) {
      setSelectedIds([])
      return
    }
    setSelectedIds(filteredItems.map((item) => item.id))
  }

  function clearSelection() {
    setSelectedIds([])
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

  function handleEdit(item) {
    setSelectedItem(item)
  }

  async function handleDelete(item) {
    if (busy) return
    const ok = await confirm({
      title: 'Xóa đơn hàng',
      message: `Xóa hẳn đơn “${item.code} — ${item.primaryName}”?\nThao tác này không hoàn tác được.`,
      confirmLabel: 'Xóa đơn',
      variant: 'danger',
    })
    if (!ok) return

    setBusyMessage('Đang xóa đơn...')
    setBusy(true)
    try {
      await deleteCustomRequestApi(item.id)
      setOrders((previous) => previous.filter((order) => order.id !== item.id))
      setSelectedIds((previous) => previous.filter((id) => id !== item.id))
      if (selectedItem?.id === item.id) setSelectedItem(null)
      setBusy(false)
      await alert({
        title: 'Đã xóa',
        message: `Đơn ${item.code} đã được xóa.`,
        variant: 'success',
      })
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
      message: `Xóa hẳn ${selectedIds.length} đơn đã chọn?\nThao tác này không hoàn tác được.`,
      confirmLabel: `Xóa ${selectedIds.length} đơn`,
      variant: 'danger',
    })
    if (!ok) return

    const ids = [...selectedIds]
    setBusyMessage(`Đang xóa ${ids.length} đơn...`)
    setBusy(true)
    try {
      const result = await bulkDeleteCustomRequestsApi(ids)
      setOrders((previous) => previous.filter((order) => !ids.includes(order.id)))
      clearSelection()
      if (selectedItem && ids.includes(selectedItem.id)) setSelectedItem(null)
      setBusy(false)
      await alert({
        title: 'Đã xóa',
        message: result.message || `Đã xóa ${ids.length} đơn.`,
        variant: 'success',
      })
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

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-outline-variant/25 bg-surface-container-lowest/80 px-4 py-3 backdrop-blur lg:px-8 lg:py-4">
        <div className="flex flex-wrap items-center justify-between gap-2.5 lg:items-start lg:gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl text-primary lg:text-3xl">Đơn hàng</h2>
            <p className="mt-1 hidden max-w-2xl text-sm text-on-surface-variant lg:block">
              Thêm, sửa, xóa và theo dõi cọc/ship/COD.
            </p>
          </div>
          <Link
            to="/admin/orders/new"
            className="btn-primary inline-flex shrink-0 items-center gap-1 !px-3 !py-2 text-[10px] lg:!px-4 lg:!py-2.5 lg:text-xs"
          >
            <MaterialIcon name="add" className="text-lg" />
            Lên đơn
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã, SĐT, tên..."
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface outline-none ring-primary/20 transition focus:ring-2 lg:max-w-xs"
          />

          {selectedCount > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface">
                Đã chọn {selectedCount}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
              >
                Bỏ chọn
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200/80 bg-red-50/70 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100/80 disabled:opacity-50"
              >
                <MaterialIcon name="delete" className="text-base" />
                Xóa {selectedCount} đơn
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setShippingFilter('')}
              className={[
                'shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition',
                shippingFilter === ''
                  ? 'border-outline bg-surface-container text-on-surface'
                  : 'border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low',
              ].join(' ')}
            >
              Mọi giao hàng
            </button>
            {SHIPPING_STATUS_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setShippingFilter(item.value)}
                className={[
                  'shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition',
                  shippingFilter === item.value
                    ? 'border-outline bg-surface-container text-on-surface'
                    : 'border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setStatusFilter('')}
              className={[
                'shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition',
                statusFilter === ''
                  ? 'border-outline bg-surface-container text-on-surface'
                  : 'border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low',
              ].join(' ')}
            >
              Mọi làm hàng
            </button>
            {ORDER_STATUS_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setStatusFilter(item.value)}
                className={[
                  'shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition',
                  statusFilter === item.value
                    ? 'border-outline bg-surface-container text-on-surface'
                    : 'border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">{filteredItems.length}</span> mục
          {search.trim() || statusFilter || shippingFilter ? ' phù hợp bộ lọc' : ''}
        </p>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest px-6 py-16 text-center">
            <p className="text-sm text-on-surface-variant">Đang tải...</p>
          </div>
        ) : isLgUp ? (
          <div className="animate-fade-in">
            <ManageUnifiedTable
              items={filteredItems}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onSelect={setSelectedItem}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShippingStatusChange={handleShippingStatusChange}
              busy={busy}
              updatingId={updatingId}
            />
          </div>
        ) : (
          <div className="animate-fade-in">
            <ManageUnifiedListMobile
              items={filteredItems}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelect={setSelectedItem}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShippingStatusChange={handleShippingStatusChange}
              busy={busy}
              updatingId={updatingId}
            />
          </div>
        )}
      </div>

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

      <LoadingOverlay open={busy} message={busyMessage} />
    </div>
  )
}

export default AdminManagePage
