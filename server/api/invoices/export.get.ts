import * as XLSX from 'xlsx'
import Invoice from '~/server/models/Invoice'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const invoices = await Invoice.find({ type: 'invoice' })
    .populate('contactId', 'name fullName')
    .populate('lawyerId', 'name')
    .sort({ issuedAt: -1 })
    .lean()

  const data = invoices.map((inv: any) => ({
    'Número': inv.number || '',
    'Fecha emisión': inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString('es-ES') : '',
    'Fecha vencimiento': inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('es-ES') : '',
    'Cliente': inv.client?.name || inv.contactId?.fullName || inv.contactId?.name || '',
    'NIF Cliente': inv.client?.nif || '',
    'Estado': inv.status || '',
    'Base imponible': inv.subtotal || 0,
    'IGIC': inv.totalIgic || 0,
    'Total': inv.total || 0,
    'Pagado': inv.amountPaid || 0,
    'Pendiente': inv.amountDue || 0,
    'Abogado': inv.lawyerId?.name || '',
    'Notas': inv.notes || '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Facturas')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="facturas_${new Date().toISOString().split('T')[0]}.xlsx"`)

  return buffer
})
