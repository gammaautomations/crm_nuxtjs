import { createError, defineEventHandler, getRouterParam } from 'h3'
import LegalCase from '~/server/models/LegalCase'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')

  const caseDoc = await LegalCase.findById(id)
    .populate('contactId', 'name fullName email phone')
    .populate('lawyerId', 'name email')
    .populate('leadId', 'title status')
    .populate('createdBy', 'name email')

  if (!caseDoc)
    throw createError({ statusCode: 404, message: 'Expediente no encontrado' })

  return caseDoc
})
