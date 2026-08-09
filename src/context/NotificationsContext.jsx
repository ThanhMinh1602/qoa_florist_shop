import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  fetchNotificationsApi,
  fetchUnreadCountApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from '../api/notificationsApi'
// SOCKET TẠM TẮT
import { connectAdminSocket, disconnectAdminSocket } from '../api/adminSocket'
import { getAuthToken } from '../utils/authStorage'
import { logger } from '../utils/logger'
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
      logger.debug('Notifications loaded', {
        count: listResult.data?.length,
        unread: countResult.data.count,
      })
    } catch (err) {
      logger.warn('Failed to load notifications', err?.message || err)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      // disconnectAdminSocket()
      setIsConnected(false)
      return undefined
    }

    loadNotifications()

    // SOCKET TẠM TẮT — chỉ poll REST
    const token = getAuthToken()
    connectAdminSocket(token) // no-op + log
    setIsConnected(false)

    const pollId = window.setInterval(() => {
      void loadNotifications()
    }, 30000)

    // const socket = connectAdminSocket(token)
    // if (!socket) return undefined
    //
    // function handleConnect() {
    //   setIsConnected(true)
    // }
    //
    // function handleDisconnect() {
    //   setIsConnected(false)
    // }
    //
    // function handleNewNotification(notification) {
    //   setNotifications((items) => {
    //     const exists = items.some((item) => item.id === notification.id)
    //     if (exists) return items
    //     return [notification, ...items].slice(0, 15)
    //   })
    //   setUnreadCount((count) => count + 1)
    //   window.dispatchEvent(new CustomEvent('qoa:request:new'))
    // }
    //
    // socket.on('connect', handleConnect)
    // socket.on('disconnect', handleDisconnect)
    // socket.on('notification:new', handleNewNotification)
    //
    // if (socket.connected) {
    //   setIsConnected(true)
    // }

    return () => {
      window.clearInterval(pollId)
      disconnectAdminSocket()
      setIsConnected(false)
      // socket.off('connect', handleConnect)
      // socket.off('disconnect', handleDisconnect)
      // socket.off('notification:new', handleNewNotification)
      // disconnectAdminSocket()
      // setIsConnected(false)
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
