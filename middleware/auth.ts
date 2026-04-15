export default defineNuxtRouteMiddleware(async to => {
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

  const role = authStore.user?.role
  const path = to.path

  // Superuser — solo configuración
  if (role === 'Superuser' && !path.startsWith('/admin'))
    return navigateTo('/admin')

  // Recepcionista — sin administración
  if (role === 'Recepcionista' && path.startsWith('/admin'))
    return navigateTo('/')

  // Abogado — sin administración
  if (role === 'Abogado' && path.startsWith('/admin'))
    return navigateTo('/')
})
