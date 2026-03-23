export default defineNuxtRouteMiddleware(async to => {
  if (to.path === '/login')
    return
  if (import.meta.server)
    return

  const authStore = useAuthStore()

  await authStore.fetchMe()

  if (!authStore.isLoggedIn)
    return navigateTo('/login')
})
