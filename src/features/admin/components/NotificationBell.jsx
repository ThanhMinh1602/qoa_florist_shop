import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../../context/NotificationsContext'
import { formatTimeAgo } from '../../../utils/formatTimeAgo'

function NotificationBell() {
  const navigate = useNavigate()
  const panelRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { notifications, unreadCount, isConnected, loadNotifications, markRead, markAllRead } =
    useNotifications()

  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleToggle = useCallback(async () => {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)

    if (nextOpen) {
      setIsLoading(true)
      await loadNotifications()
      setIsLoading(false)
    }
  }, [isOpen, loadNotifications])

  async function handleNotificationClick(notification) {
    if (!notification.read) {
      await markRead(notification.id)
    }

    setIsOpen(false)
    navigate(`/admin/requests?highlight=${notification.referenceId}`)
  }

  async function handleMarkAllRead() {
    await markAllRead()
  }

  return (
    <div ref={panelRef} className="relative flex items-center gap-2">
      {isConnected ? (
        <span className="hidden text-[10px] font-medium text-emerald-600 sm:inline" title="Realtime đang bật">
          ● Live
        </span>
      ) : null}

      <button
        type="button"
        onClick={handleToggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M12 2a6 6 0 0 0-6 6v3.1l-1.4 2.8A1 1 0 0 0 5.6 15H9v1a3 3 0 0 0 6 0v-1h3.4a1 1 0 0 0 .9-1.5L18 11.1V8a6 6 0 0 0-6-6Zm-1 13v1a1 1 0 0 0 2 0v-1h-2Z" />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-2xl shadow-rose-100/80 max-lg:fixed max-lg:inset-x-3 max-lg:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] max-lg:top-auto max-lg:w-auto">
          <div className="flex items-center justify-between border-b border-rose-50 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Thông báo</h3>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-rose-600 transition hover:text-rose-700"
              >
                Đánh dấu đã đọc
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">Đang tải...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">Chưa có thông báo nào.</p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={[
                        'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-rose-50/70',
                        notification.read ? 'bg-white' : 'bg-rose-50/40',
                      ].join(' ')}
                    >
                      <span
                        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-lg"
                        aria-hidden="true"
                      >
                        🌸
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span
                            className={[
                              'text-sm leading-5',
                              notification.read
                                ? 'font-medium text-slate-700'
                                : 'font-semibold text-slate-900',
                            ].join(' ')}
                          >
                            {notification.title}
                          </span>
                          {!notification.read ? (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                          {notification.body}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-rose-50 px-4 py-2.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                navigate('/admin/requests')
              }}
              className="w-full rounded-lg py-2 text-center text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            >
              Xem tất cả yêu cầu khách
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default NotificationBell
