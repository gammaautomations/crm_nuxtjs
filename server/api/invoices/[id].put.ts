import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import Invoice from '~/server/models/Invoice'
import { validateUpdateInvoiceDto } from '~/server/dtos/invoice.dto'

export default defineEventHandler(async (event) => {
  const id      = getRouterParam(event, 'id')
  const body    = await readBody(event)
  const dto     = validateUpdateInvoiceDto(body)
  const invoice = await Invoice.findById(id)

  if (!invoice)
    throw createError({ statusCode: 404, message: 'Factura no encontrada' })

  if (!invoice.canEdit())
    throw createError({ statusCode: 409, message: `No se puede editar una factura en estado "${invoice.status}". Emite una factura rectificativa.` })

  Object.assign(invoice, {
    ...dto,
    issuedAt:  dto.issuedAt ? new Date(dto.issuedAt) : invoice.issuedAt,
    dueDate:   dto.dueDate  ? new Date(dto.dueDate)  : invoice.dueDate,
    updatedBy: event.context.user?._id,
  })

  await invoice.save()
  return invoice
})
