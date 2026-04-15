// server/api/leads/export.get.ts

import * as XLSX from 'xlsx'
import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  const leads = await Lead.find()
    .populate('assignedLawyer', 'name email')
    .lean()

  const data = leads.map((lead: any) => ({
    'Fecha': new Date(lead.createdAt).toLocaleDateString('es-ES'),
    'Nombre': lead.nombre || '',
    'Teléfono': lead.telefono || '',
    'Email': lead.email || '',
    'Área': lead.area || '',
    'Motivo': lead.motivo || '',
    'Urgencia': lead.urgencia || '',
    'Score': lead.lead_score || 0,
    'Nivel Urgencia': lead.nivel_urgencia || '',
    'Área Detectada': lead.area_detectada || '',
    'Resumen': lead.resumen_ejecutivo || '',
    'Acción Recomendada': lead.accion_recomendada || '',
    'Estado': lead.status || '',
    'Abogado': lead.assignedLawyer?.name || 'Sin asignar',
    'Documentos': lead.documentos || '',
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Leads')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="leads_${new Date().toISOString().split('T')[0]}.xlsx"`)

  return buffer
})
