// server/api/contacts/export.get.ts

import { Contact } from '~/server/models/Contact'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const contacts = await Contact.find({ owner: decoded.id }).lean()

  // Generar CSV
  const headers = [
    'Nombre',
    'Apellidos',
    'Email',
    'Email2',
    'Teléfono',
    'Teléfono2',
    'WhatsApp',
    'Empresa',
    'Cargo',
    'Web',
    'Dirección',
    'Ciudad',
    'Provincia',
    'País',
    'LinkedIn',
    'Twitter',
    'Estado',
    'Origen',
    'Tags',
    'Notas',
  ]

  const rows = contacts.map(c => [
    c.firstName || '',
    c.lastName || '',
    c.email || '',
    c.email2 || '',
    c.phone || '',
    c.phone2 || '',
    c.whatsapp || '',
    c.company || '',
    c.jobTitle || '',
    c.website || '',
    c.address || '',
    c.city || '',
    c.state || '',
    c.country || '',
    c.linkedin || '',
    c.twitter || '',
    c.status || '',
    c.source || '',
    (c.tags || []).join(';'),
    c.notes || '',
  ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))

  const csv = [headers.join(','), ...rows].join('\n')

  // Configurar headers de respuesta
  setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
  setHeader(event, 'Content-Disposition', 'attachment; filename="contactos.csv"')

  return csv
})
