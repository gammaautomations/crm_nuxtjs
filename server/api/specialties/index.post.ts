// server/api/specialties/index.post.ts

import { Specialty } from '~/server/models/Specialty'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const body = await readBody(event)

  if (!body.name)
    throw createError({ statusCode: 400, message: 'El nombre es requerido' })

  return await Specialty.create({
    name: body.name,
    description: body.description,
    color: body.color || '#7367F0',
  })
})
