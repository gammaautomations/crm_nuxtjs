// server/api/users/me/sessions.get.ts

import { User } from '~/server/models/User'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const user = await User.findById(decoded.id).select('sessions').lean()

  if (!user)
    throw createError({ statusCode: 404, message: 'Usuario no encontrado' })

  return user
})
