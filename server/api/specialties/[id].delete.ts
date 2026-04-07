// server/api/specialties/[id].delete.ts

import { Specialty } from '~/server/models/Specialty'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const id = getRouterParam(event, 'id')

  await Specialty.findByIdAndUpdate(id, { active: false })

  return { message: 'Especialidad eliminada correctamente' }
})
