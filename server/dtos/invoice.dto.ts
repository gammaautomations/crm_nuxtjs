// invoice.dto.ts

import { createError } from 'h3'
import { IGIC_RATES, type IgicRate } from '~/server/models/Invoice'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface InvoiceAddressDto {
  street?: string
  city?: string
  zip?: string
  island?: string
  province?: string
  country?: string
}

export interface InvoicePartyDto {
  name: string
  nif: string
  email?: string
  phone?: string
  address?: InvoiceAddressDto
  cabildoReg?: string
}

export interface InvoiceLineDto {
  description: string
  quantity: number
  unitPrice: number
  igicRate?: IgicRate
  discount?: number
}

export interface CreateInvoiceDto {
  series?: string
  type?: 'invoice' | 'credit_note' | 'proforma' | 'receipt'
  status?: 'draft' | 'sent'
  contactId?: string
  leadId?: string
  lawyerId?: string
  issuer: InvoicePartyDto
  client: InvoicePartyDto
  lines: InvoiceLineDto[]
  issuedAt?: string
  dueDate?: string
  notes?: string
  internalNotes?: string
}

export interface UpdateInvoiceDto {
  contactId?: string
  leadId?: string
  lawyerId?: string
  issuer?: InvoicePartyDto
  client?: InvoicePartyDto
  lines?: InvoiceLineDto[]
  issuedAt?: string
  dueDate?: string
  notes?: string
  internalNotes?: string
  status?: 'draft' | 'sent'
}

export interface RegisterPaymentDto {
  amount: number
  method?: 'transfer' | 'card' | 'cash' | 'check' | 'other'
  date?: string
  reference?: string
  notes?: string
}

export interface CancelInvoiceDto {
  reason?: string
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

const NIF_REGEX = /^[A-Z0-9]{8,15}$/i
const PHONE_REGEX = /^[0-9+ ]{6,20}$/
const VALID_TYPES = ['invoice', 'credit_note', 'proforma', 'receipt'] as const
const VALID_STATUS = ['draft', 'sent'] as const
const VALID_METHODS = ['transfer', 'card', 'cash', 'check', 'other'] as const

function validateParty(party: any, label: string): InvoicePartyDto {
  if (!party || typeof party !== 'object')
    throw createError({ statusCode: 400, message: `Los datos de ${label} son requeridos` })

  if (!party.name?.trim())
    throw createError({ statusCode: 400, message: `El nombre del ${label} es requerido` })

  if (party.name.length > 200)
    throw createError({ statusCode: 400, message: `El nombre del ${label} no puede exceder 200 caracteres` })

  if (!party.nif?.trim())
    throw createError({ statusCode: 400, message: `El NIF/CIF del ${label} es requerido` })

  if (!NIF_REGEX.test(party.nif.trim()))
    throw createError({ statusCode: 400, message: `El NIF/CIF del ${label} tiene un formato inválido` })

  if (party.email && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(party.email))
    throw createError({ statusCode: 400, message: `El email del ${label} no es válido` })

  if (party.phone && !PHONE_REGEX.test(party.phone))
    throw createError({ statusCode: 400, message: `El teléfono del ${label} no es válido` })

  return {
    name: party.name.trim(),
    nif: party.nif.trim().toUpperCase(),
    email: party.email?.trim() ?? '',
    phone: party.phone?.trim() ?? '',
    cabildoReg: party.cabildoReg?.trim() ?? '',
    address: {
      street: party.address?.street?.trim() ?? '',
      city: party.address?.city?.trim() ?? '',
      zip: party.address?.zip?.trim() ?? '',
      island: party.address?.island?.trim() ?? '',
      province: party.address?.province?.trim() ?? '',
      country: party.address?.country?.trim() ?? 'ES',
    },
  }
}

function validateLines(lines: any): InvoiceLineDto[] {
  if (!Array.isArray(lines) || lines.length === 0)
    throw createError({ statusCode: 400, message: 'Debe incluir al menos una línea en la factura' })

  if (lines.length > 100)
    throw createError({ statusCode: 400, message: 'La factura no puede tener más de 100 líneas' })

  return lines.map((line: any, i: number) => {
    const pos = `Línea ${i + 1}`

    if (!line.description?.trim())
      throw createError({ statusCode: 400, message: `${pos}: la descripción es requerida` })

    if (line.description.length > 500)
      throw createError({ statusCode: 400, message: `${pos}: la descripción no puede exceder 500 caracteres` })

    const quantity = Number(line.quantity)
    if (isNaN(quantity) || quantity <= 0)
      throw createError({ statusCode: 400, message: `${pos}: la cantidad debe ser un número positivo` })

    const unitPrice = Number(line.unitPrice)
    if (isNaN(unitPrice))
      throw createError({ statusCode: 400, message: `${pos}: el precio unitario no es válido` })

    const igicRate = line.igicRate !== undefined ? Number(line.igicRate) : 7
    if (!(IGIC_RATES as readonly number[]).includes(igicRate)) {
      throw createError({
        statusCode: 400,
        message: `${pos}: el tipo IGIC ${igicRate}% no es válido. Valores permitidos: ${IGIC_RATES.join(', ')}%`,
      })
    }

    const discount = line.discount !== undefined ? Number(line.discount) : 0
    if (isNaN(discount) || discount < 0 || discount > 100)
      throw createError({ statusCode: 400, message: `${pos}: el descuento debe estar entre 0 y 100` })

    return {
      description: line.description.trim(),
      quantity,
      unitPrice,
      igicRate: igicRate as IgicRate,
      discount,
    }
  })
}

function validateDate(value: any, field: string): string | undefined {
  if (!value)
    return undefined
  const d = new Date(value)
  if (isNaN(d.getTime()))
    throw createError({ statusCode: 400, message: `La fecha de ${field} no es válida` })

  return d.toISOString()
}

// ─── Validadores públicos ──────────────────────────────────────────────────────

export const validateCreateInvoiceDto = (body: any): CreateInvoiceDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  const {
    series, type, status, contactId, leadId, lawyerId,
    issuer, client, lines, issuedAt, dueDate, notes, internalNotes,
  } = body

  // Series: solo letras, 1-3 caracteres
  if (series && !/^[A-Z]{1,3}$/i.test(series))
    throw createError({ statusCode: 400, message: 'La serie solo puede contener 1-3 letras' })

  if (type && !(VALID_TYPES as readonly string[]).includes(type))
    throw createError({ statusCode: 400, message: `Tipo de factura inválido. Valores: ${VALID_TYPES.join(', ')}` })

  if (status && !(VALID_STATUS as readonly string[]).includes(status))
    throw createError({ statusCode: 400, message: `Estado inválido al crear. Valores: ${VALID_STATUS.join(', ')}` })

  const issuedAtParsed = validateDate(issuedAt, 'emisión')
  const dueDateParsed = validateDate(dueDate, 'vencimiento')

  // Validar que la fecha de vencimiento sea posterior a la de emisión
  if (issuedAtParsed && dueDateParsed && new Date(dueDateParsed) < new Date(issuedAtParsed))
    throw createError({ statusCode: 400, message: 'La fecha de vencimiento debe ser posterior a la de emisión' })

  if (notes && notes.length > 1000)
    throw createError({ statusCode: 400, message: 'Las notas no pueden exceder 1000 caracteres' })

  if (internalNotes && internalNotes.length > 1000)
    throw createError({ statusCode: 400, message: 'Las notas internas no pueden exceder 1000 caracteres' })

  return {
    series: series?.toUpperCase().trim() ?? 'F',
    type: type ?? 'invoice',
    status: status ?? 'draft',
    contactId: contactId ?? undefined,
    leadId: leadId ?? undefined,
    lawyerId: lawyerId ?? undefined,
    issuer: validateParty(issuer, 'emisor'),
    client: validateParty(client, 'cliente'),
    lines: validateLines(lines),
    issuedAt: issuedAtParsed,
    dueDate: dueDateParsed,
    notes: notes?.trim() ?? '',
    internalNotes: internalNotes?.trim() ?? '',
  }
}

export const validateUpdateInvoiceDto = (body: any): UpdateInvoiceDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  const result: UpdateInvoiceDto = {}

  if (body.issuer !== undefined)
    result.issuer = validateParty(body.issuer, 'emisor')
  if (body.client !== undefined)
    result.client = validateParty(body.client, 'cliente')
  if (body.lines !== undefined)
    result.lines = validateLines(body.lines)
  if (body.issuedAt !== undefined)
    result.issuedAt = validateDate(body.issuedAt, 'emisión')
  if (body.dueDate !== undefined)
    result.dueDate = validateDate(body.dueDate, 'vencimiento')
  if (body.contactId !== undefined)
    result.contactId = body.contactId
  if (body.leadId !== undefined)
    result.leadId = body.leadId
  if (body.lawyerId !== undefined)
    result.lawyerId = body.lawyerId
  if (body.notes !== undefined)
    result.notes = body.notes?.trim()
  if (body.internalNotes !== undefined)
    result.internalNotes = body.internalNotes?.trim()

  if (body.status !== undefined) {
    if (!(VALID_STATUS as readonly string[]).includes(body.status))
      throw createError({ statusCode: 400, message: `Estado inválido. Valores: ${VALID_STATUS.join(', ')}` })
    result.status = body.status
  }

  if (result.issuedAt && result.dueDate && new Date(result.dueDate) < new Date(result.issuedAt))
    throw createError({ statusCode: 400, message: 'La fecha de vencimiento debe ser posterior a la de emisión' })

  if (Object.keys(result).length === 0)
    throw createError({ statusCode: 400, message: 'No se han enviado campos para actualizar' })

  return result
}

export const validateRegisterPaymentDto = (body: any): RegisterPaymentDto => {
  if (!body || typeof body !== 'object')
    throw createError({ statusCode: 400, message: 'El cuerpo de la petición es requerido' })

  const amount = Number(body.amount)
  if (isNaN(amount) || amount <= 0)
    throw createError({ statusCode: 400, message: 'El importe debe ser un número positivo' })

  if (body.method && !(VALID_METHODS as readonly string[]).includes(body.method))
    throw createError({ statusCode: 400, message: `Método de pago inválido. Valores: ${VALID_METHODS.join(', ')}` })

  const date = validateDate(body.date, 'pago')

  if (body.reference && body.reference.length > 200)
    throw createError({ statusCode: 400, message: 'La referencia no puede exceder 200 caracteres' })

  if (body.notes && body.notes.length > 500)
    throw createError({ statusCode: 400, message: 'Las notas no pueden exceder 500 caracteres' })

  return {
    amount,
    method: body.method ?? 'transfer',
    date: date ?? new Date().toISOString(),
    reference: body.reference?.trim() ?? '',
    notes: body.notes?.trim() ?? '',
  }
}

export const validateCancelInvoiceDto = (body: any): CancelInvoiceDto => {
  if (body?.reason && body.reason.length > 500)
    throw createError({ statusCode: 400, message: 'El motivo de cancelación no puede exceder 500 caracteres' })

  return { reason: body?.reason?.trim() ?? '' }
}
