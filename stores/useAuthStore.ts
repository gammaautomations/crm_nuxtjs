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

  const login = async (email: string, password: string) => {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    user.value = data.user

    return data.user
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  const fetchMe = async () => {
    try {
      const data = await $fetch('/api/auth/me')

      user.value = data as User
    }
    catch {
      user.value = null
    }
  }

  return {
    user,
    isLoggedIn,
    login,
    logout,
    fetchMe,
  }
})
