export default defineNuxtRouteMiddleware(() => {
  // Aquí más adelante verificarás la sesión real
  // Por ahora redirige siempre al login para probar
  return navigateTo('/login')
})
