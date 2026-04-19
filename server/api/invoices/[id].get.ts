import { createError, defineEventHandler, getRouterParam } from 'h3'
import Invoice from '~/server/models/Invoice'

export default defineEventHandler(async event => {
  const id = getRouterParam(event, 'id')

  const invoice = await Invoice.findById(id)
    .populate('contactId', 'name email phone')
    .populate('leadId', 'title status')
    .populate('lawyerId', 'name email')
    .populate('createdBy', 'name email')

  if (!invoice)
    throw createError({ statusCode: 404, message: 'Factura no encontrada' })

  return invoice
})
