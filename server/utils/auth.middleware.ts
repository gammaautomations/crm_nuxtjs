import jwt from 'jsonwebtoken'

export const requireAuth = (event: any) => {
  const token = getCookie(event, 'auth_token')
  if (!token)
    throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig()

  try {
    return jwt.verify(token, config.jwtSecret) as {
      id: string
      role: string
      email: string
      username: string
    }
  }
  catch {
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }
}

export const requireRole = (event: any, roles: string[]) => {
  const decoded = requireAuth(event)

  if (!roles.includes(decoded.role))
    throw createError({ statusCode: 403, message: 'No tienes permisos para realizar esta acción' })

  return decoded
}
