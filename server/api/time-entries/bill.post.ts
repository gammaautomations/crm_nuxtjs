import { createError, defineEventHandler, readBody } from 'h3'
import Invoice from '~/server/models/Invoice'
import TimeEntry from '~/server/models/TimeEntry'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const body = await readBody(event)

  const { entryIds, invoiceId } = body

  if (!entryIds?.length)
    throw createError({ statusCode: 400, message: 'Selecciona al menos una entrada' })

  if (!invoiceId)
    throw createError({ statusCode: 400, message: 'El ID de la factura es requerido' })

  const invoice = await Invoice.findById(invoiceId)
  if (!invoice)
    throw createError({ statusCode: 404, message: 'Factura no encontrada' })

  if (!invoice.canEdit())
    throw createError({ statusCode: 409, message: 'Solo se pueden añadir horas a facturas en borrador' })

  const entries = await TimeEntry.find({ _id: { $in: entryIds }, billed: false })

  if (!entries.length)
    throw createError({ statusCode: 400, message: 'No hay entradas válidas para facturar' })

  // Añadir líneas a la factura
  for (const entry of entries) {
    invoice.lines.push({
      description: `${entry.description} (${entry.hours}h × ${entry.hourlyRate}€/h)`,
      quantity: entry.hours,
      unitPrice: entry.hourlyRate,
      igicRate: 7,
      discount: 0,
    } as any)
  }

  await invoice.save()

  // Marcar entradas como facturadas
  const startIndex = invoice.lines.length - entries.length

  await Promise.all(entries.map((entry, i) =>
    TimeEntry.findByIdAndUpdate(entry._id, {
      billed: true,
      invoiceId: invoice._id,
      invoiceLineIndex: startIndex + i,
    }),
  ))

  return { ok: true, linesAdded: entries.length, invoice }
})
