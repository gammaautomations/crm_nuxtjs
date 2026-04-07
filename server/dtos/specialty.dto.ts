// server/dtos/specialty.dto.ts

export interface CreateSpecialtyDto {
  name: string
  description?: string
  color?: string
}

export const validateCreateSpecialtyDto = (body: any): CreateSpecialtyDto => {
  const { name, description, color } = body

  if (!name)
    throw createError({ statusCode: 400, message: 'El nombre es requerido' })

  if (name.length > 100)
    throw createError({ statusCode: 400, message: 'El nombre no puede exceder los 100 caracteres' })

  if (color && !/^#[0-9A-F]{6}$/i.test(color))
    throw createError({ statusCode: 400, message: 'Color inválido — usa formato HEX (#RRGGBB)' })

  return { name, description, color }
}
