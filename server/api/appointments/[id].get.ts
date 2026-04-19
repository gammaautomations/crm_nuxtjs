import { createError, defineEventHandler, getRouterParam } from 'h3'
import Appointment from '~/server/models/Appointment'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')

  const appointment = await Appointment.findById(id)
    .populate('contactId', 'name email phone')
    .populate('lawyerId', 'name email')
    .populate('leadId', 'title status')
    .populate('createdBy', 'name email')

  if (!appointment)
    throw createError({ statusCode: 404, message: 'Cita no encontrada' })

  return appointment
})
