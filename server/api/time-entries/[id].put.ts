import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { validateUpdateTimeEntryDto } from '~/server/dtos/time-entry.dto'
import TimeEntry from '~/server/models/TimeEntry'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const dto = validateUpdateTimeEntryDto(body)
  const entry = await TimeEntry.findById(id)

  if (!entry)
    throw createError({ statusCode: 404, message: 'Entrada no encontrada' })

  if (entry.billed)
    throw createError({ statusCode: 409, message: 'No se puede editar una entrada ya facturada' })

  Object.assign(entry, { ...dto, date: dto.date ? new Date(dto.date) : entry.date })
  await entry.save()

  return entry
})
