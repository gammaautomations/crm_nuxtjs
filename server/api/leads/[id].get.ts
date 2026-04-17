import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  const id = getRouterParam(event, 'id')

  const lead = await Lead.findById(id)
    .populate('assignedLawyer', 'name email phone')
    .populate('activity.user', 'username')
    .populate('comments.user', 'username avatar')
    .lean()

  if (!lead)
    throw createError({ statusCode: 404, message: 'Lead no encontrado' })

  return lead
})
