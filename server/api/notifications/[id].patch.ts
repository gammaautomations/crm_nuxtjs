// server/api/notifications/[id].patch.ts

import { Notification } from '~/server/models/Notification'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const id = getRouterParam(event, 'id')

  await Notification.findOneAndUpdate(
    { _id: id, userId: decoded.id },
    { $set: { read: true } },
  )

  return { message: 'Notificación marcada como leída' }
})
