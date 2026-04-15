// server/api/contacts/export.get.ts

import * as XLSX from 'xlsx'
import { Contact } from '~/server/models/Contact'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const contacts = await Contact.find({ owner: decoded.id }).lean()

  const data = contacts.map((c: any) => ({
    Nombre: c.firstName || '',
    Apellidos: c.lastName || '',
    Email: c.email || '',
    Teléfono: c.phone || '',
    Empresa: c.company || '',
    Estado: c.status || '',
    Origen: c.source || '',
    Tags: (c.tags || []).join(';'),
    Notas: c.notes || '',
    Fecha: new Date(c.createdAt).toLocaleDateString('es-ES'),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(wb, ws, 'Contactos')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="contactos_${new Date().toISOString().split('T')[0]}.xlsx"`)

  return buffer
})
