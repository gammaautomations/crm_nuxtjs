import { createError, defineEventHandler, getRouterParam } from 'h3'
import Appointment from '~/server/models/Appointment'
import { sendAppointmentWebhook } from '~/server/utils/appointment-webhook'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const appointment = await Appointment.findById(id)

  if (!appointment)
    throw createError({ statusCode: 404, message: 'Cita no encontrada' })

  appointment.status = 'cancelled'
  await appointment.save()

  sendAppointmentWebhook(appointment, 'cancelled').catch(console.error)

  return { ok: true }
})
