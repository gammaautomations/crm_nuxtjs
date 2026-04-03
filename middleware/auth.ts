export default defineNuxtRouteMiddleware(async to => {
  // Solo ejecutar en cliente
  if (import.meta.server)
    return

  if (to.path === '/login')
    return
  if (to.path === '/register')
    return
  if (to.path.startsWith('/auth/'))
    return

  const authStore = useAuthStore()

  await authStore.fetchMe()

  if (!authStore.isLoggedIn)
    return navigateTo('/login')

  if (authStore.user?.emailVerified === false)
    return navigateTo(`/auth/verify-email?email=${encodeURIComponent(authStore.user?.email || '')}`)
})
