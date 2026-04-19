import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { validateUpdateAppointmentDto } from '~/server/dtos/appointment.dto'
import Appointment from '~/server/models/Appointment'
import { sendAppointmentWebhook } from '~/server/utils/appointment-webhook'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const dto = validateUpdateAppointmentDto(body)

  const appointment = await Appointment.findById(id)
  if (!appointment)
    throw createError({ statusCode: 404, message: 'Cita no encontrada' })

  Object.assign(appointment, {
    ...dto,
    startAt: dto.startAt ? new Date(dto.startAt) : appointment.startAt,
    endAt: dto.endAt ? new Date(dto.endAt) : appointment.endAt,
    updatedBy: user.id,
  })

  await appointment.save()

  const action = appointment.status === 'cancelled'
    ? 'cancelled'
    : appointment.status === 'completed'
      ? 'completed'
      : 'updated'

  sendAppointmentWebhook(appointment, action).catch(console.error)

  return appointment
})
