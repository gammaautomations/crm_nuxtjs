import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { validateCreateTemplateDto } from '~/server/dtos/templateForm.dto'
import Template from '~/server/models/Template'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const tpl = await Template.findById(id)
  if (!tpl)
    throw createError({ statusCode: 404, message: 'Plantilla no encontrada' })

  const dto = validateUpdateTemplateDto(body)

  Object.assign(tpl, { ...dto, updatedBy: user.id })
  await tpl.save()

  return tpl
})
