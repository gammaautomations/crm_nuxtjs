import { defineStore } from 'pinia'

interface User {
  id: string
  username: string
  email: string
  role: string
  avatar: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value)
  const isLoading = ref(true)
  let fetchMePromise: Promise<void> | null = null

  const fetchMe = async () => {
    if (import.meta.server)
      return

    if (fetchMePromise)
      return fetchMePromise

    fetchMePromise = (async () => {
      try {
        const data = await $fetch('/api/auth/me')

        user.value = data as User
      }
      catch {
        user.value = null
      }
      finally {
        isLoading.value = false
      }
    })()

    return fetchMePromise
  }

  const login = async (email: string, password: string) => {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    user.value = (data as any).user
    isLoading.value = false

    return (data as any).user
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    fetchMePromise = null
    isLoading.value = true
    navigateTo('/login')
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
    fetchMe,
  }
})
