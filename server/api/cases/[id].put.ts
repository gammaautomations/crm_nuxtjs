import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { validateUpdateCaseDto } from '~/server/dtos/case.dto'
import LegalCase from '~/server/models/LegalCase '
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const dto = validateUpdateCaseDto(body)
  const caseDoc = await LegalCase.findById(id)

  if (!caseDoc)
    throw createError({ statusCode: 404, message: 'Expediente no encontrado' })

  Object.assign(caseDoc, {
    ...dto,
    openedAt: dto.openedAt ? new Date(dto.openedAt) : caseDoc.openedAt,
    deadline: dto.deadline ? new Date(dto.deadline) : caseDoc.deadline,
    lawyerId: dto.lawyerId || undefined,
    leadId: dto.leadId || undefined,
    updatedBy: user.id,
  })

  await caseDoc.save()

  return caseDoc
})
