// server/api/lawyers/[id].patch.ts

import { validateUpdateLawyerDto } from '~/server/dtos/lawyer.dto'
import { Lawyer } from '~/server/models/Lawyer'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const dto = validateUpdateLawyerDto(body)

  const lawyer = await Lawyer.findByIdAndUpdate(
    id,
    { $set: dto },
    { returnDocument: 'after' },
  ).populate('specialties')

  if (!lawyer)
    throw createError({ statusCode: 404, message: 'Abogado no encontrado' })

  return lawyer
})
