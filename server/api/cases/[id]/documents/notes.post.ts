import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { validateCreateNoteDto } from '~/server/dtos/case.dto'
import LegalCase from '~/server/models/LegalCase'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const dto = validateCreateNoteDto(body)
  const caseDoc = await LegalCase.findById(id)

  if (!caseDoc)
    throw createError({ statusCode: 404, message: 'Expediente no encontrado' })

  caseDoc.notes.push({ content: dto.content, createdBy: user.id } as any)
  await caseDoc.save()

  return caseDoc
})
