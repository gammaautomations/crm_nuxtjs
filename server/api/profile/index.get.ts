// index.get.ts

import jwt from 'jsonwebtoken'
import { Profile } from '~/server/models/Profile'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const token = getCookie(event, 'auth_token')
  if (!token)
    throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig()
  const decoded = jwt.verify(token, config.jwtSecret) as { id: string }

  const [user, profile] = await Promise.all([
    User.findById(decoded.id).lean(),
    Profile.findOne({ userId: decoded.id }).lean(),
  ])

  if (!user)
    throw createError({ statusCode: 404, message: 'Usuario no encontrado' })

  return { user, profile }
})
