import { Lead } from '~/server/models/Lead'
import { User } from '~/server/models/User'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  // Forzar registro del modelo User
  void User

  const id = getRouterParam(event, 'id')

  const lead = await Lead.findById(id)
    .populate('assignedLawyer', 'name email phone')
    .populate('activity.user', 'username')
    .lean()

  if (!lead)
    throw createError({ statusCode: 404, message: 'Lead no encontrado' })

  return lead
})
