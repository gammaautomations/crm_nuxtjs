import { useAuthStore } from '~/stores/useAuthStore'
import { useLeadStore } from '~/stores/useLeadStore'
import { useNotificationStore } from '~/stores/useNotificationStore'
import { useSettingsStore } from '~/stores/useSettingsStore'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  const leadStore = useLeadStore()
  const settingsStore = useSettingsStore()

  await authStore.fetchMe()

  let lastLeadCount = 0
  let initialized = false

  const playBell = () => {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1)
  }

  const checkNewLeads = async () => {
    if (!authStore.isLoggedIn)
      return
    try {
      const data = await $fetch('/api/dashboard/stats') as any
      const currentCount = data?.totals?.totalLeads || 0
      if (initialized && currentCount > lastLeadCount) {
        playBell()
        await notificationStore.fetchNotifications()

        const router = useRouter()
        if (router.currentRoute.value.path === '/leads/kanban')
          await refreshNuxtData()
      }
      lastLeadCount = currentCount
      initialized = true
    }
    catch {
      // silently fail
    }
  }

  if (import.meta.client) {
    // Cargar nombre de la app
    await settingsStore.fetchSettings()
    if (settingsStore.appName)
      document.title = settingsStore.appName

    setInterval(async () => {
      await notificationStore.fetchNotifications()
      await leadStore.fetchUnassigned()
      await checkNewLeads()
    }, 30000)

    await leadStore.fetchUnassigned()
    await checkNewLeads()
  }
})
