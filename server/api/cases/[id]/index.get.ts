import { defineEventHandler, getRouterParam } from 'h3'
import CaseDocument from '~/server/models/CaseDocument'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')

  return await CaseDocument.find({ caseId: id })
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'name')
    .lean()
})
