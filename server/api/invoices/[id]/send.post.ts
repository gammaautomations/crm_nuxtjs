import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import Invoice from '~/server/models/Invoice'
import { generateInvoicePdf } from '~/server/utils/invoice-pdf'
import { sendInvoiceEmail } from '~/server/utils/invoice-mailer'

export default defineEventHandler(async (event) => {
  const id      = getRouterParam(event, 'id')
  const body    = await readBody(event).catch(() => ({}))
  const invoice = await Invoice.findById(id)

  if (!invoice)
    throw createError({ statusCode: 404, message: 'Factura no encontrada' })

  if (['cancelled', 'void'].includes(invoice.status))
    throw createError({ statusCode: 409, message: `No se puede enviar una factura en estado "${invoice.status}".` })

  const targetEmail = body?.email?.trim() || invoice.client.email
  if (!targetEmail)
    throw createError({ statusCode: 422, message: 'El cliente no tiene email. Indícalo en el body: { "email": "..." }' })

  const pdfBuffer = await generateInvoicePdf(invoice)

  await sendInvoiceEmail(targetEmail, invoice.client.name, invoice.number, invoice.total, invoice.dueDate, pdfBuffer)

  if (invoice.status === 'draft') invoice.status = 'sent'
  invoice.sentAt         = new Date()
  invoice.pdfGeneratedAt = new Date()
  invoice.updatedBy      = event.context.user?._id

  await invoice.save()

  return { ok: true, sentTo: targetEmail, sentAt: invoice.sentAt, status: invoice.status }
})
