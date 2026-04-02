// stores/useNotificationStore.ts

import { defineStore } from 'pinia'

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  category: string
  read: boolean
  link: string | null
  createdAt: string
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const loading = ref(false)

  const fetchNotifications = async () => {
    loading.value = true
    try {
      const data = await $fetch<{ notifications: Notification[]; unreadCount: number }>('/api/notifications')

      notifications.value = data.notifications
      unreadCount.value = data.unreadCount
    }
    catch (error) {
      console.error('Error fetching notifications:', error)
    }
    finally {
      loading.value = false
    }
  }

  const markAsRead = async (id: string) => {
    await $fetch(`/api/notifications/${id}`, { method: 'PATCH' })

    const notification = notifications.value.find(n => n._id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const markAllAsRead = async () => {
    await $fetch('/api/notifications/read-all', { method: 'PATCH' })
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
})
