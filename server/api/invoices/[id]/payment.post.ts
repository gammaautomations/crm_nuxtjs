import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import Invoice from '~/server/models/Invoice'
import { validateRegisterPaymentDto } from '~/server/dtos/invoice.dto'

export default defineEventHandler(async (event) => {
  const id      = getRouterParam(event, 'id')
  const body    = await readBody(event)
  const dto     = validateRegisterPaymentDto(body)
  const invoice = await Invoice.findById(id)

  if (!invoice)
    throw createError({ statusCode: 404, message: 'Factura no encontrada' })

  if (['cancelled', 'void', 'draft'].includes(invoice.status))
    throw createError({ statusCode: 409, message: `No se puede registrar un pago en estado "${invoice.status}".` })

  if (dto.amount > invoice.amountDue + 0.01)
    throw createError({ statusCode: 422, message: `El importe (${dto.amount}€) supera el saldo pendiente (${invoice.amountDue}€).` })

  invoice.registerPayment({ ...dto, date: new Date(dto.date!) })
  invoice.updatedBy = event.context.user?._id

  await invoice.save()

  return { ok: true, status: invoice.status, amountPaid: invoice.amountPaid, amountDue: invoice.amountDue, paidAt: invoice.paidAt }
})
