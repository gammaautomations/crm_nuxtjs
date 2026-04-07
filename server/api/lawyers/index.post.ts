// server/api/lawyers/index.post.ts

import { validateCreateLawyerDto } from '~/server/dtos/lawyer.dto'
import { Lawyer } from '~/server/models/Lawyer'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const body = await readBody(event)
  const dto = validateCreateLawyerDto(body)

  const exists = await Lawyer.findOne({ email: dto.email })
  if (exists)
    throw createError({ statusCode: 409, message: 'Ya existe un abogado con ese email' })

  return await Lawyer.create({
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    specialties: dto.specialties || [],
  })
})
