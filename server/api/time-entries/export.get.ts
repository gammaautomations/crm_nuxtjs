import * as XLSX from 'xlsx'
import TimeEntry from '~/server/models/TimeEntry'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const entries = await TimeEntry.find()
    .populate('caseId', 'number title')
    .populate('lawyerId', 'name')
    .sort({ date: -1 })
    .lean()

  const data = entries.map((e: any) => ({
    'Fecha': e.date ? new Date(e.date).toLocaleDateString('es-ES') : '',
    'Expediente': e.caseId?.number || '',
    'Título exp.': e.caseId?.title || '',
    'Abogado': e.lawyerId?.name || '',
    'Descripción': e.description || '',
    'Horas': e.hours || 0,
    'Tarifa/hora': e.hourlyRate || 0,
    'Importe': e.amount || 0,
    'Facturada': e.billed ? 'Sí' : 'No',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Horas')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="horas_${new Date().toISOString().split('T')[0]}.xlsx"`)

  return buffer
})
