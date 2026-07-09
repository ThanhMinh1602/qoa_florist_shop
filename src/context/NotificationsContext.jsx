import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  fetchNotificationsApi,
  fetchUnreadCountApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '../api/notificationsApi'
import { connectAdminSocket, disconnectAdminSocket } from '../api/adminSocket'
import { useAuth } from './AuthContext'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  const loadNotifications = useCallback(async () => {
    try {
      const [listResult, countResult] = await Promise.all([
        fetchNotificationsApi(15),
        fetchUnreadCountApi(),
      ])
      setNotifications(listResult.data)
      setUnreadCount(countResult.data.count)
    } catch {
      // ignore fetch errors
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectAdminSocket()
      setIsConnected(false)
      return undefined
    }

    loadNotifications()

    const token = sessionStorage.getItem('qoa_admin_token')
    const socket = connectAdminSocket(token)

    if (!socket) return undefined

    function handleConnect() {
      setIsConnected(true)
    }

    function handleDisconnect() {
      setIsConnected(false)
    }

    function handleNewNotification(notification) {
      setNotifications((items) => {
        const exists = items.some((item) => item.id === notification.id)
        if (exists) return items
        return [notification, ...items].slice(0, 15)
      })
      setUnreadCount((count) => count + 1)
      window.dispatchEvent(new CustomEvent('qoa:request:new'))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('notification:new', handleNewNotification)

    if (socket.connected) {
      setIsConnected(true)
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('notification:new', handleNewNotification)
      disconnectAdminSocket()
      setIsConnected(false)
    }
  }, [isAuthenticated, loadNotifications])

  const markRead = useCallback(async (id) => {
    await markNotificationReadApi(id)
    setUnreadCount((count) => Math.max(0, count - 1))
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, read: true } : item)),
    )
  }, [])

  const markAllRead = useCallback(async () => {
    await markAllNotificationsReadApi()
    setUnreadCount(0)
    setNotifications((items) => items.map((item) => ({ ...item, read: true })))
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isConnected,
      isLoading: false,
      loadNotifications,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, isConnected, loadNotifications, markRead, markAllRead],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationsContext)

  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }

  return context
}
