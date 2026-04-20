import { defineEventHandler, readBody } from 'h3'
import { validateCreateTimeEntryDto } from '~/server/dtos/time-entry.dto'
import TimeEntry from '~/server/models/TimeEntry'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const dto = validateCreateTimeEntryDto(body)

  const entry = await TimeEntry.create({
    ...dto,
    date: new Date(dto.date!),
    lawyerId: dto.lawyerId || undefined,
    createdBy: user.id,
  })

  return entry.populate(['caseId', 'lawyerId'])
})
