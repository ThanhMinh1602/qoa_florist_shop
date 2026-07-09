import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchCustomRequestsApi,
  updateCustomRequestStatusApi,
} from '../../../api/notificationsApi'
import CustomerRequestCard from '../components/CustomerRequestCard'

function CustomerRequestsPage() {
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('highlight')
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('')
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadRequests = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await fetchCustomRequestsApi(filter)
      setRequests(result.data)
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách yêu cầu.')
    } finally {
      setIsLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadRequests()

    function handleNewRequest() {
      loadRequests()
    }

    window.addEventListener('qoa:request:new', handleNewRequest)
    return () => window.removeEventListener('qoa:request:new', handleNewRequest)
  }, [loadRequests])

  useEffect(() => {
    if (!highlightId) return

    setExpandedIds((previous) => {
      const next = new Set(previous)
      next.add(highlightId)
      return next
    })
  }, [highlightId])

  function toggleExpanded(id) {
    setExpandedIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleStatusChange(id, status) {
    setUpdatingId(id)

    try {
      const result = await updateCustomRequestStatusApi(id, status)
      setRequests((items) => items.map((item) => (item.id === id ? result.data : item)))
    } catch (err) {
      window.alert(err.message || 'Không thể cập nhật trạng thái.')
    } finally {
      setUpdatingId(null)
    }
  }

  function handleRequestUpdated(updated) {
    setRequests((items) => items.map((item) => (item.id === updated.id ? updated : item)))
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-rose-100 bg-white/80 px-6 py-5 backdrop-blur md:px-8">
        <h2 className="text-2xl font-semibold text-slate-900">Yêu cầu từ khách hàng</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Bấm vào từng đơn để xem chi tiết QR, giao hàng và lên vận chuyển.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: 'Tất cả' },
            { value: 'pending', label: 'Chờ xử lý' },
            { value: 'reviewed', label: 'Đã xem' },
            { value: 'done', label: 'Hoàn thành' },
          ].map((item) => (
            <button
              key={item.value || 'all'}
              type="button"
              onClick={() => setFilter(item.value)}
              className={[
                'rounded-xl border px-4 py-2 text-sm font-medium transition',
                filter === item.value
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : 'border-rose-100 bg-white text-slate-600 hover:bg-rose-50/70',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-slate-500">Đang tải...</p>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-16 text-center">
            <p className="text-3xl" aria-hidden="true">
              📭
            </p>
            <p className="mt-3 text-sm font-medium text-slate-700">Chưa có yêu cầu nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <CustomerRequestCard
                key={request.id}
                request={request}
                isHighlighted={highlightId === request.id}
                isExpanded={expandedIds.has(request.id)}
                onToggle={() => toggleExpanded(request.id)}
                onStatusChange={handleStatusChange}
                onUpdated={handleRequestUpdated}
                isUpdating={updatingId === request.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerRequestsPage
