// server/api/notifications/index.get.ts:

import { Notification } from '~/server/models/Notification'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const notifications = await Notification.find({ userId: decoded.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  const unreadCount = await Notification.countDocuments({
    userId: decoded.id,
    read: false,
  })

  return { notifications, unreadCount }
})
