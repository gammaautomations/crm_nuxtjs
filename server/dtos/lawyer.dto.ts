// server/dtos/lawyer.dto.ts

export interface CreateLawyerDto {
  name: string
  email: string
  phone?: string
  specialties?: string[]
}

export interface UpdateLawyerDto {
  name?: string
  email?: string
  phone?: string
  specialties?: string[]
  active?: boolean
}

export const validateCreateLawyerDto = (body: any): CreateLawyerDto => {
  const { name, email, phone, specialties } = body

  if (!name)
    throw createError({ statusCode: 400, message: 'El nombre es requerido' })

  if (!email)
    throw createError({ statusCode: 400, message: 'El email es requerido' })

  if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email))
    throw createError({ statusCode: 400, message: 'Email inválido' })

  if (phone && !/^[0-9+ ]+$/.test(phone))
    throw createError({ statusCode: 400, message: 'Teléfono inválido' })

  return { name, email, phone, specialties }
}

export const validateUpdateLawyerDto = (body: any): UpdateLawyerDto => {
  const dto: UpdateLawyerDto = {}

  if (body.name !== undefined) {
    if (!body.name)
      throw createError({ statusCode: 400, message: 'El nombre no puede estar vacío' })
    dto.name = body.name
  }

  if (body.email !== undefined) {
    if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(body.email))
      throw createError({ statusCode: 400, message: 'Email inválido' })
    dto.email = body.email
  }

  if (body.phone !== undefined) {
    if (body.phone && !/^[0-9+ ]+$/.test(body.phone))
      throw createError({ statusCode: 400, message: 'Teléfono inválido' })
    dto.phone = body.phone
  }

  if (body.specialties !== undefined)
    dto.specialties = body.specialties

  if (body.active !== undefined)
    dto.active = Boolean(body.active)

  return dto
}
