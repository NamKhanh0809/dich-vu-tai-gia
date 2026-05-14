import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    unreadCount: 0,
    notifications: [],
    toasts: [],
  }),

  actions: {
    addNotification(notification) {
      const noti = {
        id: Date.now(),
        timestamp: new Date(),
        read: false,
        ...notification,
      }
      this.notifications.unshift(noti)
      this.unreadCount++
    },

    markAsRead(id) {
      const noti = this.notifications.find((n) => n.id === id)
      if (noti && !noti.read) {
        noti.read = true
        this.unreadCount--
      }
    },

    markAllAsRead() {
      this.notifications.forEach((noti) => {
        if (!noti.read) noti.read = true
      })
      this.unreadCount = 0
    },

    removeNotification(id) {
      const index = this.notifications.findIndex((n) => n.id === id)
      if (index > -1) {
        const noti = this.notifications[index]
        if (!noti.read) this.unreadCount--
        this.notifications.splice(index, 1)
      }
    },

    addToast(toast) {
      const id = Date.now()
      this.toasts.push({
        id,
        duration: 3000,
        ...toast,
      })
      if (toast.duration !== 0) {
        setTimeout(() => this.removeToast(id), toast.duration || 3000)
      }
      return id
    },

    removeToast(id) {
      const index = this.toasts.findIndex((t) => t.id === id)
      if (index > -1) this.toasts.splice(index, 1)
    },

    success(message) {
      return this.addToast({
        type: 'success',
        message,
      })
    },

    error(message) {
      return this.addToast({
        type: 'error',
        message,
        duration: 5000,
      })
    },

    info(message) {
      return this.addToast({
        type: 'info',
        message,
      })
    },

    warning(message) {
      return this.addToast({
        type: 'warning',
        message,
      })
    },
  },
})
