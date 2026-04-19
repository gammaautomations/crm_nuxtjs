import { defineEventHandler, readBody } from 'h3'
import { validateCreateCaseDto } from '~/server/dtos/case.dto'
import LegalCase from '~/server/models/LegalCase '
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const dto = validateCreateCaseDto(body)
  const number = await LegalCase.nextNumber()

  const caseDoc = await LegalCase.create({
    ...dto,
    number,
    openedAt: dto.openedAt ? new Date(dto.openedAt) : new Date(),
    deadline: dto.deadline ? new Date(dto.deadline) : undefined,
    createdBy: user.id,
  })

  return caseDoc.populate(['contactId', 'lawyerId'])
})
