import { defineEventHandler, getRouterParam, setResponseHeaders, createError } from 'h3'
import Invoice from '~/server/models/Invoice'
import { generateInvoicePdf } from '~/server/utils/invoice-pdf'

export default defineEventHandler(async (event) => {
  const id      = getRouterParam(event, 'id')
  const invoice = await Invoice.findById(id)

  if (!invoice)
    throw createError({ statusCode: 404, message: 'Factura no encontrada' })

  const pdfBuffer = await generateInvoicePdf(invoice)

  invoice.pdfGeneratedAt = new Date()
  await invoice.save()

  setResponseHeaders(event, {
    'Content-Type':        'application/pdf',
    'Content-Disposition': `attachment; filename="${invoice.number}.pdf"`,
    'Content-Length':      String(pdfBuffer.length),
  })

  return pdfBuffer
})
