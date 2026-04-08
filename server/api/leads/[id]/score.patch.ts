// server/api/leads/[id]/score.patch.ts

import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const { lead_score } = await readBody(event)

  const lead = await Lead.findByIdAndUpdate(
    id,
    { lead_score },
    { returnDocument: 'after' },
  )

  if (!lead)
    throw createError({ statusCode: 404, message: 'Lead no encontrado' })

  return lead
})
