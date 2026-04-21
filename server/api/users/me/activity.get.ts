import { defineEventHandler } from 'h3'
import { Notification } from '~/server/models/Notification'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const auth = requireAuth(event)

  return await Notification.find({ userId: auth.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()
})
