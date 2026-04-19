import { defineEventHandler, readBody } from 'h3'
import { validateCreateAppointmentDto } from '~/server/dtos/appointment.dto'
import Appointment from '~/server/models/Appointment'
import { sendAppointmentWebhook } from '~/server/utils/appointment-webhook'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const dto = validateCreateAppointmentDto(body)

  const appointment = await Appointment.create({
    ...dto,
    startAt: new Date(dto.startAt),
    endAt: new Date(dto.endAt),
    createdBy: user.id,
    contactId: dto.contactId || undefined,
    leadId: dto.leadId || undefined,
    lawyerId: dto.lawyerId || undefined,
  })

  // Disparar webhook n8n de forma asíncrona (no bloquea la respuesta)
  sendAppointmentWebhook(appointment, 'created').catch(console.error)

  return appointment.populate(['contactId', 'lawyerId', 'leadId'])
})
