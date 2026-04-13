// server/api/users/[id].patch.ts

import { User } from '~/server/models/User'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const allowed = ['role', 'status', 'username']
  const update: any = {}
  for (const key of allowed) {
    if (body[key] !== undefined)
      update[key] = body[key]
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  )

  if (!user)
    throw createError({ statusCode: 404, message: 'Usuario no encontrado' })

  return user
})
