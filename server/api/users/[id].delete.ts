// server/api/users/[id].delete.ts

import { User } from '~/server/models/User'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const id = getRouterParam(event, 'id')

  await User.findByIdAndDelete(id)

  return { message: 'Usuario eliminado correctamente' }
})
