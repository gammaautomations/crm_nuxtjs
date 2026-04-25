import { createError, defineEventHandler, getRouterParam } from 'h3'
import Template from '~/server/models/Template'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const tpl = await Template.findById(id).lean()
  if (!tpl)
    throw createError({ statusCode: 404, message: 'Plantilla no encontrada' })

  return tpl
})
