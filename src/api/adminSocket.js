import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, '') ?? undefined

let socket = null

export function connectAdminSocket(token) {
  if (!token) return null

  if (socket) {
    socket.auth = { token }
    if (!socket.connected) {
      socket.connect()
    }
    return socket
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling'],
  })

  return socket
}

export function disconnectAdminSocket() {
  if (!socket) return
  socket.disconnect()
  socket = null
}

export function getAdminSocket() {
  return socket
}
