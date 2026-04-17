// assign.patch.ts

import { Lawyer } from '~/server/models/Lawyer'
import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'
import { createTransporter } from '~/server/utils/mailer'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const id = getRouterParam(event, 'id')
  const { lawyerId } = await readBody(event)

  const lead = await Lead.findByIdAndUpdate(
    id,
    {
      assignedLawyer: lawyerId,
      status: 'contactado',
      $push: {
        activity: {
          action: 'asignacion',
          description: 'Lead asignado a abogado',
          user: decoded.id,
          date: new Date(),
        },
      },
    },
    { returnDocument: 'after' },
  ).populate('assignedLawyer', 'name email')

  if (!lead)
    throw createError({ statusCode: 404, message: 'Lead no encontrado' })

  if (lawyerId) {
    await Lawyer.findByIdAndUpdate(lawyerId, {
      $addToSet: { assignedLeads: id },
    })

    try {
      const lawyer = await Lawyer.findById(lawyerId).lean() as any
      if (lawyer?.email) {
        console.log('📧 Enviando email a:', lawyer.email)

        const transporter = createTransporter()

        await transporter.sendMail({
          from: process.env.NUXT_MAIL_FROM,
          to: lawyer.email,
          subject: `Nuevo lead asignado: ${(lead as any).nombre}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7367f0;">Nuevo lead asignado</h2>
              <p>Hola <strong>${lawyer.name}</strong>,</p>
              <p>Se te ha asignado un nuevo lead:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f8f7fa;">
                  <td style="padding: 10px; border: 1px solid #eee;"><strong>Nombre</strong></td>
                  <td style="padding: 10px; border: 1px solid #eee;">${(lead as any).nombre}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #eee;"><strong>Email</strong></td>
                  <td style="padding: 10px; border: 1px solid #eee;">${(lead as any).email || '—'}</td>
                </tr>
                <tr style="background: #f8f7fa;">
                  <td style="padding: 10px; border: 1px solid #eee;"><strong>Teléfono</strong></td>
                  <td style="padding: 10px; border: 1px solid #eee;">${(lead as any).telefono || '—'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #eee;"><strong>Área</strong></td>
                  <td style="padding: 10px; border: 1px solid #eee;">${(lead as any).area || '—'}</td>
                </tr>
                <tr style="background: #f8f7fa;">
                  <td style="padding: 10px; border: 1px solid #eee;"><strong>Score</strong></td>
                  <td style="padding: 10px; border: 1px solid #eee;">${(lead as any).lead_score}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #eee;"><strong>Urgencia</strong></td>
                  <td style="padding: 10px; border: 1px solid #eee;">${(lead as any).nivel_urgencia || '—'}</td>
                </tr>
              </table>
              <p><strong>Resumen:</strong> ${(lead as any).resumen_ejecutivo || '—'}</p>
              <p><strong>Acción recomendada:</strong> ${(lead as any).accion_recomendada || '—'}</p>
              <a href="${process.env.APP_BASE_URL}/leads/${id}" style="display: inline-block; background: #7367f0; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px;">
                Ver lead en el CRM
              </a>
            </div>
          `,
        })
        console.log('📧 Email enviado correctamente')
      }
    }
    catch (err) {
      console.error('❌ Error enviando email:', err)
    }
  }

  return { message: 'Lead asignado correctamente', lead }
})
