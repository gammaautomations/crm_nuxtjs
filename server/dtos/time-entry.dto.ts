import { createError } from 'h3'

export interface CreateTimeEntryDto {
  description: string
  date?: string
  hours: number
  hourlyRate: number
  caseId: string
  lawyerId?: string
}

export interface UpdateTimeEntryDto {
  description?: string
  date?: string
  hours?: number
  hourlyRate?: number
  lawyerId?: string
}

export const validateCreateTimeEntryDto = (body: any): CreateTimeEntryDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  if (!body.description?.trim())
    throw createError({ statusCode: 400, message: 'La descripción es requerida' })

  const hours = Number(body.hours)
  if (isNaN(hours) || hours < 0.1)
    throw createError({ statusCode: 400, message: 'Las horas deben ser un número positivo (mínimo 0.1)' })

  if (hours > 24)
    throw createError({ statusCode: 400, message: 'No se pueden registrar más de 24 horas en una entrada' })

  const hourlyRate = Number(body.hourlyRate)
  if (isNaN(hourlyRate) || hourlyRate < 0)
    throw createError({ statusCode: 400, message: 'La tarifa por hora debe ser un número positivo' })

  if (!body.caseId)
    throw createError({ statusCode: 400, message: 'El expediente es requerido' })

  return {
    description: body.description.trim(),
    date: body.date ?? new Date().toISOString(),
    hours,
    hourlyRate,
    caseId: body.caseId,
    lawyerId: body.lawyerId || undefined,
  }
}

export const validateUpdateTimeEntryDto = (body: any): UpdateTimeEntryDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  const dto: UpdateTimeEntryDto = {}

  if (body.description !== undefined) {
    if (!body.description?.trim())
      throw createError({ statusCode: 400, message: 'La descripción no puede estar vacía' })
    dto.description = body.description.trim()
  }

  if (body.hours !== undefined) {
    const hours = Number(body.hours)
    if (isNaN(hours) || hours < 0.1 || hours > 24)
      throw createError({ statusCode: 400, message: 'Horas inválidas' })
    dto.hours = hours
  }

  if (body.hourlyRate !== undefined) {
    const rate = Number(body.hourlyRate)
    if (isNaN(rate) || rate < 0)
      throw createError({ statusCode: 400, message: 'Tarifa inválida' })
    dto.hourlyRate = rate
  }

  if (body.date !== undefined)
    dto.date = body.date
  if (body.lawyerId !== undefined)
    dto.lawyerId = body.lawyerId || undefined

  if (Object.keys(dto).length === 0)
    throw createError({ statusCode: 400, message: 'No se han enviado campos para actualizar' })

  return dto
}
