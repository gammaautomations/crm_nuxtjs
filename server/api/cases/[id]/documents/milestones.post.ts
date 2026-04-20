import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { validateCreateMilestoneDto } from '~/server/dtos/case.dto'
import LegalCase from '~/server/models/LegalCase'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const dto = validateCreateMilestoneDto(body)
  const caseDoc = await LegalCase.findById(id)

  if (!caseDoc)
    throw createError({ statusCode: 404, message: 'Expediente no encontrado' })

  caseDoc.milestones.push({
    ...dto,
    dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    completed: false,
    createdBy: user.id,
  } as any)

  await caseDoc.save()

  return caseDoc
})
