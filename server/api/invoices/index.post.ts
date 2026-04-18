import { defineEventHandler, readBody, createError } from 'h3'
import Invoice from '~/server/models/Invoice'
import { validateCreateInvoiceDto } from '~/server/dtos/invoice.dto'

export default defineEventHandler(async (event) => {
  const body   = await readBody(event)
  const dto    = validateCreateInvoiceDto(body)
  const userId = event.context.user?._id

  if (!userId)
    throw createError({ statusCode: 401, message: 'No autenticado' })

  const number  = await Invoice.nextNumber(dto.series)

  const invoice = await Invoice.create({
    ...dto,
    number,
    issuedAt:  dto.issuedAt ? new Date(dto.issuedAt) : new Date(),
    dueDate:   dto.dueDate  ? new Date(dto.dueDate)  : undefined,
    createdBy: userId,
  })

  return invoice
})
