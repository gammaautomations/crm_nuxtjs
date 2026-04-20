import { createError, defineEventHandler, getRouterParam } from 'h3'
import LegalCase from '~/server/models/LegalCase'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const caseDoc = await LegalCase.findById(id)

  if (!caseDoc)
    throw createError({ statusCode: 404, message: 'Expediente no encontrado' })

  caseDoc.status = 'archived'
  caseDoc.closedAt = new Date()
  await caseDoc.save()

  return { ok: true }
})
