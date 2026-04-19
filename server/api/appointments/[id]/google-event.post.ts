// server/api/appointments/[id]/google-event.post.ts
import { createError, defineEventHandler, getHeader, getRouterParam, readBody } from 'h3'
import Appointment from '~/server/models/Appointment'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getHeader(event, 'x-n8n-token')

  if (!token || token !== config.n8nSecretToken)
    throw createError({ statusCode: 401, message: 'Token inválido' })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  await Appointment.findByIdAndUpdate(id, {
    googleEventId: body.googleEventId,
    syncedAt: new Date(),
  })

  return { ok: true }
})
