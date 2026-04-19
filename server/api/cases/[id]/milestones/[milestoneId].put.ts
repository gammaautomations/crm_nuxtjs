import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import LegalCase from '~/server/models/LegalCase '
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const milestoneId = getRouterParam(event, 'milestoneId')
  const body = await readBody(event)
  const caseDoc = await LegalCase.findById(id)

  if (!caseDoc)
    throw createError({ statusCode: 404, message: 'Expediente no encontrado' })

  const milestone = caseDoc.milestones.id(milestoneId)
  if (!milestone)
    throw createError({ statusCode: 404, message: 'Hito no encontrado' })

  if (body.completed !== undefined) {
    milestone.completed = body.completed
    milestone.completedAt = body.completed ? new Date() : undefined
  }
  if (body.title)
    milestone.title = body.title
  if (body.dueDate)
    milestone.dueDate = new Date(body.dueDate)

  await caseDoc.save()

  return caseDoc
})
