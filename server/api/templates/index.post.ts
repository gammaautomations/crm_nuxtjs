import { createError, defineEventHandler, readBody } from 'h3'
import { validateCreateTemplateDto } from '~/server/dtos/template.dto'
import Template from '~/server/models/Template'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const body = await readBody(event)

  if (!body.name?.trim())
    throw createError({ statusCode: 400, message: 'El nombre es requerido' })
  if (!body.content?.trim())
    throw createError({ statusCode: 400, message: 'El contenido es requerido' })

  const dto = validateCreateTemplateDto(body)

  return await Template.create({ ...dto, createdBy: user.id })
})
