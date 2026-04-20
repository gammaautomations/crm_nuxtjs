import { createError, defineEventHandler, getRouterParam } from 'h3'
import TimeEntry from '~/server/models/TimeEntry'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const entry = await TimeEntry.findById(id)

  if (!entry)
    throw createError({ statusCode: 404, message: 'Entrada no encontrada' })

  if (entry.billed)
    throw createError({ statusCode: 409, message: 'No se puede eliminar una entrada ya facturada' })

  await entry.deleteOne()

  return { ok: true }
})
