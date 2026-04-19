import { defineEventHandler, getQuery } from 'h3'
import Appointment from '~/server/models/Appointment'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const { from, to, lawyerId, type, status } = getQuery(event)

  const filter: Record<string, unknown> = {}

  if (from || to) {
    filter.startAt = {
      ...(from ? { $gte: new Date(from as string) } : {}),
      ...(to ? { $lte: new Date(to as string) } : {}),
    }
  }

  if (lawyerId)
    filter.lawyerId = lawyerId
  if (type)
    filter.type = type
  if (status)
    filter.status = status

  return await Appointment.find(filter)
    .sort({ startAt: 1 })
    .populate('contactId', 'name email phone')
    .populate('lawyerId', 'name email')
    .populate('leadId', 'title status')
    .lean()
})
