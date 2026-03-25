export default defineNuxtRouteMiddleware(async to => {
  if (to.path === '/login')
    return
  if (to.path === '/register')
    return
  if (to.path.startsWith('/auth/'))
    return
  if (import.meta.server)
    return

  const authStore = useAuthStore()

  await authStore.fetchMe()

  // No autenticado → login
  if (!authStore.isLoggedIn)
    return navigateTo('/login')

  // Autenticado pero email no verificado → verificación
  if (!authStore.user?.emailVerified && to.path !== '/auth/verify-email')
    return navigateTo(`/auth/verify-email?email=${encodeURIComponent(authStore.user?.email || '')}`)
})
