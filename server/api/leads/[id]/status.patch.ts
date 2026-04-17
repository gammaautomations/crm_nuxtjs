// status.patch.ts - Asignar abogado a un lead y actualizar su estado a "contactado"

import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const id = getRouterParam(event, 'id')
  const { status } = await readBody(event)

  const lead = await Lead.findByIdAndUpdate(
    id,
    {
      status,
      $push: {
        activity: {
          action: 'status_change',
          description: `Estado cambiado a: ${status}`,
          user: decoded.id,
          date: new Date(),
        },
      },
    },
    { returnDocument: 'after' },
  )

  if (!lead)
    throw createError({ statusCode: 404, message: 'Lead no encontrado' })

  return lead
})
