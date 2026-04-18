import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import Invoice from '~/server/models/Invoice'
import { validateCancelInvoiceDto } from '~/server/dtos/invoice.dto'

export default defineEventHandler(async (event) => {
  const id      = getRouterParam(event, 'id')
  const body    = await readBody(event).catch(() => ({}))
  const dto     = validateCancelInvoiceDto(body)
  const invoice = await Invoice.findById(id)

  if (!invoice)
    throw createError({ statusCode: 404, message: 'Factura no encontrada' })

  if (!invoice.canCancel())
    throw createError({ statusCode: 409, message: `No se puede cancelar una factura en estado "${invoice.status}".` })

  invoice.status       = invoice.amountPaid > 0 ? 'void' : 'cancelled'
  invoice.cancelledAt  = new Date()
  invoice.cancelReason = dto.reason ?? ''
  invoice.updatedBy    = event.context.user?._id

  await invoice.save()
  return { ok: true, status: invoice.status }
})
