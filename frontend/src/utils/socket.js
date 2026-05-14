import { io } from 'socket.io-client'

let socket = null

export const initSocket = (userId) => {
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: {
      token: localStorage.getItem('access_token'),
    },
  })
  socket.emit('register', userId)
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const onNewOrder = (callback) => {
  if (socket) socket.on('order_assigned', callback)
}

export const onOrderUpdated = (callback) => {
  if (socket) socket.on('order_updated', callback)
}

export const onNewNotification = (callback) => {
  if (socket) socket.on('notification', callback)
}
