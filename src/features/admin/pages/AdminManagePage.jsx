import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  fetchCustomRequestsApi,
  updateCustomRequestStatusApi,
} from '../../../api/notificationsApi'
import { useDialog } from '../../../context/DialogContext'
import { ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { buildUnifiedManageItems } from '../../../utils/buildUnifiedManageItems'
import ManageUnifiedTable from '../components/ManageUnifiedTable'
import OrderDetailModal from '../components/OrderDetailModal'
import ManageUnifiedListMobile from '../mobile/ManageUnifiedListMobile'

function AdminManagePage() {
  const { alert } = useDialog()
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
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
      if (typeFilter !== 'all' && item.typeKind !== typeFilter) return false

      if (statusFilter) {
        if (item.kind !== 'order') return false
        const normalized =
          item.status === 'reviewed' ? 'arranging' : item.status
        if (normalized !== statusFilter) return false
      }

      if (!keyword) return true

      const haystack = [
        item.code,
        item.primaryName,
        item.secondaryPhone,
        item.deliveryLine,
        item.addressLine,
        item.typeLabel,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(keyword)
    })
  }, [unifiedItems, typeFilter, statusFilter, search])

  useEffect(() => {
    if (!highlightId || unifiedItems.length === 0) return

    const matched = unifiedItems.find(
      (item) => item.kind === 'order' && item.id === highlightId,
    )
    if (matched) {
      setSelectedItem(matched)
    }
  }, [highlightId, unifiedItems])

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

  function handleOrderUpdated(updated) {
    setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)))
    setSelectedItem((current) => {
      if (!(current?.kind === 'order' && current.id === updated.id)) return current
      const [next] = buildUnifiedManageItems([updated])
      return next
    })
  }

  const isLoading = isLoadingOrders && unifiedItems.length === 0

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-outline-variant/25 bg-surface-container-lowest/80 px-4 py-4 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl text-primary">Đơn hàng</h2>
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
              Theo dõi ship, sản phẩm, cọc/ship/COD và trạng thái làm hàng.
            </p>
          </div>
          <Link
            to="/admin/orders/new"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-container"
          >
            + Lên đơn
          </Link>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'with_qr', label: 'Đơn có QR' },
              { value: 'no_qr', label: 'Đơn không QR' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTypeFilter(item.value)}
                className={[
                  'shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition',
                  typeFilter === item.value
                    ? 'border-primary bg-surface-container-low text-primary'
                    : 'border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low',
                ].join(' ')}
              >
                {item.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã, SĐT, tên..."
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface outline-none ring-primary/20 transition focus:ring-2 lg:max-w-xs"
          />
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
            Mọi trạng thái
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

        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">{filteredItems.length}</span> mục
          {search.trim() || typeFilter !== 'all' || statusFilter ? ' phù hợp bộ lọc' : ''}
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
          <ManageUnifiedTable items={filteredItems} onSelect={setSelectedItem} />
        ) : (
          <ManageUnifiedListMobile items={filteredItems} onSelect={setSelectedItem} />
        )}
      </div>

      {selectedItem?.kind === 'order' ? (
        <OrderDetailModal
          request={selectedItem.raw}
          onClose={() => setSelectedItem(null)}
          onStatusChange={handleStatusChange}
          onUpdated={handleOrderUpdated}
          isUpdating={updatingId === selectedItem.id}
        />
      ) : null}
    </div>
  )
}

export default AdminManagePage
