// server/api/notifications/read-all.patch.ts

import { Notification } from '~/server/models/Notification'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  await Notification.updateMany(
    { userId: decoded.id, read: false },
    { $set: { read: true } },
  )

  return { message: 'Todas las notificaciones marcadas como leídas' }
})
