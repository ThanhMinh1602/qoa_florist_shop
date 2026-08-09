// SOCKET TẠM TẮT — đang lỗi, bật lại khi fix xong.
// import { io } from 'socket.io-client'
import { logger } from '../utils/logger'

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, '') ?? undefined

// let socket = null

export function connectAdminSocket(token) {
  logger.warn('Socket.IO disabled — connectAdminSocket skipped', { hasToken: Boolean(token) })
  return null

  // if (!token) return null
  //
  // if (socket) {
  //   socket.auth = { token }
  //   if (!socket.connected) {
  //     socket.connect()
  //   }
  //   return socket
  // }
  //
  // socket = io(SOCKET_URL, {
  //   auth: { token },
  //   autoConnect: true,
  //   transports: ['websocket', 'polling'],
  // })
  //
  // socket.on('connect', () => logger.info('Admin socket connected'))
  // socket.on('connect_error', (err) => logger.error('Admin socket error', err?.message || err))
  //
  // return socket
}

export function disconnectAdminSocket() {
  logger.debug('disconnectAdminSocket skipped (socket off)')
  // if (!socket) return
  // socket.disconnect()
  // socket = null
}

export function getAdminSocket() {
  return null
  // return socket
}
