export default defineNuxtPlugin(async () => {
  if (import.meta.server)
    return

  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()

  await authStore.fetchMe()

  if (authStore.isLoggedIn) {
    await notificationStore.fetchNotifications()

    // Refrescar notificaciones cada 30 segundos
    setInterval(async () => {
      if (authStore.isLoggedIn)
        await notificationStore.fetchNotifications()
    }, 30000)
  }
})
