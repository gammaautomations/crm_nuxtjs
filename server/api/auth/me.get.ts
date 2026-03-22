import jwt from 'jsonwebtoken'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const token = getCookie(event, 'auth_token')
  if (!token)
    throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig()

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string }
    const user = await User.findById(decoded.id).select('-password -refreshTokens').lean()

    if (!user)
      throw createError({ statusCode: 401, message: 'Usuario no encontrado' })

    return user
  }
  catch {
    throw createError({ statusCode: 401, message: 'Token inválido' })
  }
})
