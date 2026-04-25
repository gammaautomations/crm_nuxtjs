import { createError } from 'h3'

const TEMPLATE_TYPES = ['contrato', 'escrito_judicial', 'carta_cliente', 'otro'] as const
type TemplateType = (typeof TEMPLATE_TYPES)[number]

export interface CreateTemplateDto {
  name:        string
  description: string
  type:        TemplateType
  content:     string
  active?:     boolean
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

export const validateCreateTemplateDto = (body: any): CreateTemplateDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  if (!body.name?.trim())
    throw createError({ statusCode: 400, message: 'El nombre es requerido' })

  if (body.name.length > 200)
    throw createError({ statusCode: 400, message: 'El nombre no puede exceder 200 caracteres' })

  if (!body.content?.trim())
    throw createError({ statusCode: 400, message: 'El contenido es requerido' })

  if (body.type && !(TEMPLATE_TYPES as readonly string[]).includes(body.type))
    throw createError({ statusCode: 400, message: `Tipo inválido. Valores: ${TEMPLATE_TYPES.join(', ')}` })

  return {
    name:        body.name.trim(),
    description: body.description?.trim() ?? '',
    type:        body.type                ?? 'contrato',
    content:     body.content,
    active:      body.active              ?? true,
  }
}

export const validateUpdateTemplateDto = (body: any): UpdateTemplateDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  const dto: UpdateTemplateDto = {}

  if (body.name !== undefined) {
    if (!body.name?.trim())
      throw createError({ statusCode: 400, message: 'El nombre no puede estar vacío' })
    dto.name = body.name.trim()
  }

  if (body.type !== undefined) {
    if (!(TEMPLATE_TYPES as readonly string[]).includes(body.type))
      throw createError({ statusCode: 400, message: `Tipo inválido` })
    dto.type = body.type
  }

  if (body.content     !== undefined) dto.content     = body.content
  if (body.description !== undefined) dto.description = body.description?.trim() ?? ''
  if (body.active      !== undefined) dto.active      = Boolean(body.active)

  if (Object.keys(dto).length === 0)
    throw createError({ statusCode: 400, message: 'No se han enviado campos para actualizar' })

  return dto
}
