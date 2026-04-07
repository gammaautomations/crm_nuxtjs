// server/api/lawyers/[id].delete.ts

import { Lawyer } from '~/server/models/Lawyer'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const id = getRouterParam(event, 'id')

  await Lawyer.findByIdAndUpdate(id, { active: false })

  return { message: 'Abogado eliminado correctamente' }
})
