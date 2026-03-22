export default defineNuxtRouteMiddleware(async to => {
  const authStore = useAuthStore()

  // Si no hay usuario en el store, intenta recuperarlo del token
  if (!authStore.isLoggedIn)
    await authStore.fetchMe()

  // Si sigue sin estar logueado, redirige al login
  if (!authStore.isLoggedIn)
    return navigateTo('/login')
})
