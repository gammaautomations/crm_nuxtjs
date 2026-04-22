import * as XLSX from 'xlsx'
import LegalCase from '~/server/models/LegalCase'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const cases = await LegalCase.find()
    .populate('contactId', 'name fullName email')
    .populate('lawyerId', 'name')
    .sort({ openedAt: -1 })
    .lean()

  const typeLabel: Record<string, string> = {
    civil: 'Civil',
    penal: 'Penal',
    laboral: 'Laboral',
    mercantil: 'Mercantil',
    administrativo: 'Administrativo',
    otro: 'Otro',
  }

  const statusLabel: Record<string, string> = {
    open: 'Abierto',
    in_progress: 'En curso',
    on_hold: 'En espera',
    closed: 'Cerrado',
    archived: 'Archivado',
  }

  const priorityLabel: Record<string, string> = {
    low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente',
  }

  const data = cases.map((c: any) => ({
    'Número': c.number || '',
    'Título': c.title || '',
    'Tipo': typeLabel[c.type] || c.type || '',
    'Estado': statusLabel[c.status] || c.status || '',
    'Prioridad': priorityLabel[c.priority] || c.priority || '',
    'Cliente': c.contactId?.fullName || c.contactId?.name || '',
    'Email cliente': c.contactId?.email || '',
    'Abogado': c.lawyerId?.name || '',
    'Fecha apertura': c.openedAt ? new Date(c.openedAt).toLocaleDateString('es-ES') : '',
    'Fecha límite': c.deadline ? new Date(c.deadline).toLocaleDateString('es-ES') : '',
    'Fecha cierre': c.closedAt ? new Date(c.closedAt).toLocaleDateString('es-ES') : '',
    'Juzgado': c.court || '',
    'Nº Procedimiento': c.procedureNumber || '',
    'Parte contraria': c.opposingParty || '',
    'Tipo honorario': c.feeType || '',
    'Importe': c.feeAmount || '',
    'Tarifa/hora': c.hourlyRate || '',
    'Hitos totales': c.milestones?.length || 0,
    'Hitos completados': c.milestones?.filter((m: any) => m.completed).length || 0,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Expedientes')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="expedientes_${new Date().toISOString().split('T')[0]}.xlsx"`)

  return buffer
})
