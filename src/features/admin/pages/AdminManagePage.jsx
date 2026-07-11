import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  fetchCustomRequestsApi,
  updateCustomRequestStatusApi,
} from '../../../api/notificationsApi'
import { ORDER_STATUS_OPTIONS } from '../../../constants/orderStatus'
import { useIsLgUp } from '../../../hooks/useMediaQuery'
import { buildUnifiedManageItems } from '../../../utils/buildUnifiedManageItems'
import ManageUnifiedTable from '../components/ManageUnifiedTable'
import OrderDetailModal from '../components/OrderDetailModal'
import ManageUnifiedListMobile from '../mobile/ManageUnifiedListMobile'

function AdminManagePage() {
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
      window.alert(err.message || 'Không thể cập nhật trạng thái.')
    } finally {
      setUpdatingId(null)
    }
  }

  function handleOrderUpdated(updated) {
    setOrders((items) => items.map((item) => (item.id === updated.id ? updated : item)))
    setSelectedItem((current) =>
      current?.kind === 'order' && current.id === updated.id
        ? { ...current, raw: updated, status: updated.status, shippingStatus: updated.shippingStatus }
        : current,
    )
  }

  const isLoading = isLoadingOrders && unifiedItems.length === 0

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-4 py-4 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Đơn hàng</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Đơn giao hoa và đơn kèm thiệp QR. Bấm để xem chi tiết.
            </p>
          </div>
          <Link
            to="/admin/orders/new"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
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
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-rose-100 bg-white text-slate-600 hover:bg-rose-50/70',
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
            className="w-full rounded-xl border border-rose-100 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none ring-rose-200 transition focus:ring-2 lg:max-w-xs"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={[
              'shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition',
              statusFilter === ''
                ? 'border-slate-300 bg-slate-100 text-slate-800'
                : 'border-rose-100 bg-white text-slate-500 hover:bg-rose-50/70',
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
                  ? 'border-slate-300 bg-slate-100 text-slate-800'
                  : 'border-rose-100 bg-white text-slate-500 hover:bg-rose-50/70',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{filteredItems.length}</span> mục
          {search.trim() || typeFilter !== 'all' || statusFilter ? ' phù hợp bộ lọc' : ''}
        </p>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-rose-100 bg-white px-6 py-16 text-center">
            <p className="text-sm text-slate-500">Đang tải...</p>
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
