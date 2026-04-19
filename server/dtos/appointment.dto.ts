import { createError } from 'h3'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateAppointmentDto {
  title: string
  description?: string
  type?: 'appointment' | 'task' | 'reminder' | 'hearing' | 'meeting'
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  startAt: string
  endAt: string
  allDay?: boolean
  contactId?: string
  leadId?: string
  lawyerId?: string
  location?: string
  meetUrl?: string
  reminderMinutes?: number
  color?: string
}

export interface UpdateAppointmentDto extends Partial<CreateAppointmentDto> {}

// ─── Constantes ───────────────────────────────────────────────────────────────

const VALID_TYPES = ['appointment', 'task', 'reminder', 'hearing', 'meeting'] as const
const VALID_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const
const VALID_COLORS = ['#7367F0', '#28C76F', '#FF4C51', '#FFB400', '#00CFE8', '#6c757d'] as const

// ─── Validadores ──────────────────────────────────────────────────────────────

export const validateCreateAppointmentDto = (body: any): CreateAppointmentDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  if (!body.title?.trim())
    throw createError({ statusCode: 400, message: 'El título es requerido' })

  if (body.title.length > 200)
    throw createError({ statusCode: 400, message: 'El título no puede exceder 200 caracteres' })

  if (!body.startAt)
    throw createError({ statusCode: 400, message: 'La fecha de inicio es requerida' })

  if (!body.endAt)
    throw createError({ statusCode: 400, message: 'La fecha de fin es requerida' })

  const startAt = new Date(body.startAt)
  const endAt = new Date(body.endAt)

  if (isNaN(startAt.getTime()))
    throw createError({ statusCode: 400, message: 'La fecha de inicio no es válida' })

  if (isNaN(endAt.getTime()))
    throw createError({ statusCode: 400, message: 'La fecha de fin no es válida' })

  if (endAt <= startAt)
    throw createError({ statusCode: 400, message: 'La fecha de fin debe ser posterior a la de inicio' })

  if (body.type && !(VALID_TYPES as readonly string[]).includes(body.type))
    throw createError({ statusCode: 400, message: `Tipo inválido. Valores: ${VALID_TYPES.join(', ')}` })

  if (body.status && !(VALID_STATUSES as readonly string[]).includes(body.status))
    throw createError({ statusCode: 400, message: `Estado inválido. Valores: ${VALID_STATUSES.join(', ')}` })

  if (body.reminderMinutes !== undefined && (isNaN(Number(body.reminderMinutes)) || Number(body.reminderMinutes) < 0))
    throw createError({ statusCode: 400, message: 'El recordatorio debe ser un número positivo en minutos' })

  return {
    title: body.title.trim(),
    description: body.description?.trim() ?? '',
    type: body.type ?? 'appointment',
    status: body.status ?? 'pending',
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    allDay: Boolean(body.allDay),
    contactId: body.contactId || undefined,
    leadId: body.leadId || undefined,
    lawyerId: body.lawyerId || undefined,
    location: body.location?.trim() ?? '',
    meetUrl: body.meetUrl?.trim() ?? '',
    reminderMinutes: body.reminderMinutes !== undefined ? Number(body.reminderMinutes) : 30,
    color: body.color ?? null,
  }
}

export const validateUpdateAppointmentDto = (body: any): UpdateAppointmentDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  const dto: UpdateAppointmentDto = {}

  if (body.title !== undefined) {
    if (!body.title?.trim())
      throw createError({ statusCode: 400, message: 'El título no puede estar vacío' })
    dto.title = body.title.trim()
  }

  if (body.startAt !== undefined) {
    const d = new Date(body.startAt)
    if (isNaN(d.getTime()))
      throw createError({ statusCode: 400, message: 'La fecha de inicio no es válida' })
    dto.startAt = d.toISOString()
  }

  if (body.endAt !== undefined) {
    const d = new Date(body.endAt)
    if (isNaN(d.getTime()))
      throw createError({ statusCode: 400, message: 'La fecha de fin no es válida' })
    dto.endAt = d.toISOString()
  }

  if (dto.startAt && dto.endAt && new Date(dto.endAt) <= new Date(dto.startAt))
    throw createError({ statusCode: 400, message: 'La fecha de fin debe ser posterior a la de inicio' })

  if (body.type !== undefined) {
    if (!(VALID_TYPES as readonly string[]).includes(body.type))
      throw createError({ statusCode: 400, message: `Tipo inválido. Valores: ${VALID_TYPES.join(', ')}` })
    dto.type = body.type
  }

  if (body.status !== undefined) {
    if (!(VALID_STATUSES as readonly string[]).includes(body.status))
      throw createError({ statusCode: 400, message: `Estado inválido. Valores: ${VALID_STATUSES.join(', ')}` })
    dto.status = body.status
  }

  const simpleFields = ['description', 'allDay', 'contactId', 'leadId', 'lawyerId', 'location', 'meetUrl', 'reminderMinutes', 'color']
  for (const field of simpleFields) {
    if (body[field] !== undefined)
      (dto as any)[field] = body[field]
  }

  if (Object.keys(dto).length === 0)
    throw createError({ statusCode: 400, message: 'No se han enviado campos para actualizar' })

  return dto
}
