import { defineEventHandler, getQuery } from 'h3'
import Template from '~/server/models/Template'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const { type, active = 'true' } = getQuery(event)
  const filter: Record<string, any> = {}
  if (type)
    filter.type = type
  if (active !== 'all')
    filter.active = active === 'true'

  return await Template.find(filter).sort({ createdAt: -1 }).lean()
})
