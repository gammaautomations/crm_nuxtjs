// server/api/leads/index.post.ts

import { Lead } from '~/server/models/Lead'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'
import { createNotification } from '~/server/utils/notifications'

export default defineEventHandler(async event => {
  await connectDB()

  const body = await readBody(event)

  const lead = await Lead.create({
    fecha_envio: body.fecha_envio || new Date(),
    nombre: body.nombre,
    telefono: body.telefono,
    email: body.email,
    contacto: body.contacto,
    area: body.area,
    motivo: body.motivo,
    urgencia: body.urgencia,
    fecha_plazo: body.fecha_plazo,
    descripcion: body.descripcion,
    documentos: body.documentos,
    lead_score: body.lead_score,
    nivel_urgencia: body.nivel_urgencia,
    area_detectada: body.area_detectada,
    resumen_ejecutivo: body.resumen_ejecutivo,
    accion_recomendada: body.accion_recomendada,
    source: 'landing',
  })

  // Notificar a todos los admins
  const admins = await User.find({ role: 'Admin', status: true }).lean()

  await Promise.all(
    admins.map(admin =>
      createNotification({
        userId: admin._id.toString(),
        title: '🔔 Nuevo lead recibido',
        message: `${lead.nombre} — Área: ${lead.area} — Score: ${lead.lead_score}`,
        type: 'info',
        category: 'contact',
        link: '/leads',
      }),
    ),
  )

  return { message: 'Lead guardado correctamente', lead }
})
