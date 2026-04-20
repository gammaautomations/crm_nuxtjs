import { createError } from 'h3'
import { CASE_STATUSES, CASE_TYPES, type CaseStatus, type CaseType } from '~/server/models/LegalCase'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateCaseDto {
  title: string
  description?: string
  type?: CaseType
  status?: CaseStatus
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  court?: string
  courtNumber?: string
  procedureNumber?: string
  opposingParty?: string
  openedAt?: string
  deadline?: string
  contactId: string
  lawyerId?: string
  leadId?: string
  feeType?: 'fixed' | 'hourly' | 'contingency' | 'mixed'
  feeAmount?: number
  hourlyRate?: number
}

export interface UpdateCaseDto extends Partial<CreateCaseDto> {}

export interface CreateMilestoneDto {
  title: string
  description?: string
  dueDate?: string
}

export interface CreateNoteDto {
  content: string
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
const VALID_FEE_TYPES = ['fixed', 'hourly', 'contingency', 'mixed'] as const

// ─── Validadores ──────────────────────────────────────────────────────────────

export const validateCreateCaseDto = (body: any): CreateCaseDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  if (!body.title?.trim())
    throw createError({ statusCode: 400, message: 'El título es requerido' })

  if (body.title.length > 300)
    throw createError({ statusCode: 400, message: 'El título no puede exceder 300 caracteres' })

  if (!body.contactId)
    throw createError({ statusCode: 400, message: 'El cliente es requerido' })

  if (body.type && !(CASE_TYPES as readonly string[]).includes(body.type))
    throw createError({ statusCode: 400, message: `Tipo inválido. Valores: ${CASE_TYPES.join(', ')}` })

  if (body.status && !(CASE_STATUSES as readonly string[]).includes(body.status))
    throw createError({ statusCode: 400, message: `Estado inválido. Valores: ${CASE_STATUSES.join(', ')}` })

  if (body.priority && !(VALID_PRIORITIES as readonly string[]).includes(body.priority))
    throw createError({ statusCode: 400, message: `Prioridad inválida. Valores: ${VALID_PRIORITIES.join(', ')}` })

  if (body.feeType && !(VALID_FEE_TYPES as readonly string[]).includes(body.feeType))
    throw createError({ statusCode: 400, message: 'Tipo de honorario inválido' })

  return {
    title: body.title.trim(),
    description: body.description?.trim() ?? '',
    type: body.type ?? 'civil',
    status: body.status ?? 'open',
    priority: body.priority ?? 'medium',
    court: body.court?.trim() ?? '',
    courtNumber: body.courtNumber?.trim() ?? '',
    procedureNumber: body.procedureNumber?.trim() ?? '',
    opposingParty: body.opposingParty?.trim() ?? '',
    openedAt: body.openedAt ?? new Date().toISOString(),
    deadline: body.deadline ?? undefined,
    contactId: body.contactId,
    lawyerId: body.lawyerId || undefined,
    leadId: body.leadId || undefined,
    feeType: body.feeType ?? undefined,
    feeAmount: body.feeAmount ? Number(body.feeAmount) : undefined,
    hourlyRate: body.hourlyRate ? Number(body.hourlyRate) : undefined,
  }
}

export const validateUpdateCaseDto = (body: any): UpdateCaseDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  const dto: UpdateCaseDto = {}

  if (body.title !== undefined) {
    if (!body.title?.trim())
      throw createError({ statusCode: 400, message: 'El título no puede estar vacío' })
    dto.title = body.title.trim()
  }

  if (body.type !== undefined) {
    if (!(CASE_TYPES as readonly string[]).includes(body.type))
      throw createError({ statusCode: 400, message: 'Tipo inválido' })
    dto.type = body.type
  }

  if (body.status !== undefined) {
    if (!(CASE_STATUSES as readonly string[]).includes(body.status))
      throw createError({ statusCode: 400, message: 'Estado inválido' })
    dto.status = body.status
  }

  if (body.priority !== undefined) {
    if (!(VALID_PRIORITIES as readonly string[]).includes(body.priority))
      throw createError({ statusCode: 400, message: 'Prioridad inválida' })
    dto.priority = body.priority
  }

  const simpleFields = [
    'description',
    'court',
    'courtNumber',
    'procedureNumber',
    'opposingParty',
    'openedAt',
    'deadline',
    'contactId',
    'lawyerId',
    'leadId',
    'feeType',
    'feeAmount',
    'hourlyRate',
  ]

  for (const field of simpleFields) {
    if (body[field] !== undefined)
      (dto as any)[field] = body[field] || undefined
  }

  if (Object.keys(dto).length === 0)
    throw createError({ statusCode: 400, message: 'No se han enviado campos para actualizar' })

  return dto
}

export const validateCreateMilestoneDto = (body: any): CreateMilestoneDto => {
  if (!body.title?.trim())
    throw createError({ statusCode: 400, message: 'El título del hito es requerido' })

  return {
    title: body.title.trim(),
    description: body.description?.trim() ?? '',
    dueDate: body.dueDate ?? undefined,
  }
}

export const validateCreateNoteDto = (body: any): CreateNoteDto => {
  if (!body.content?.trim())
    throw createError({ statusCode: 400, message: 'El contenido de la nota es requerido' })

  if (body.content.length > 2000)
    throw createError({ statusCode: 400, message: 'La nota no puede exceder 2000 caracteres' })

  return { content: body.content.trim() }
}
