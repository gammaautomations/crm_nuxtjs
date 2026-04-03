// server/api/notifications/[id].delete.ts

import { Notification } from '~/server/models/Notification'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const id = getRouterParam(event, 'id')

  const notification = await Notification.findOneAndDelete({
    _id: id,
    userId: decoded.id,
  })

  if (!notification)
    throw createError({ statusCode: 404, message: 'Notificación no encontrada' })

  return { message: 'Notificación eliminada' }
})
