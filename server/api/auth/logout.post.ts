export default defineEventHandler(async event => {
  deleteCookie(event, 'auth_token')

  return { message: 'Sesión cerrada' }
})
