import { defineEventHandler, readBody } from 'h3'
import { User } from '~/server/models/User'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const auth = requireAuth(event)
  const body = await readBody(event)

  await User.findByIdAndUpdate(auth.id, { notificationPrefs: body })

  return { ok: true }
})
