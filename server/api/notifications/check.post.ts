import { createError, defineEventHandler, getHeader } from 'h3'
import Appointment from '~/server/models/Appointment'
import LegalCase from '~/server/models/Case'
import Invoice from '~/server/models/Invoice'
import { Notification } from '~/server/models/Notification'
import { User } from '~/server/models/User'

export default defineEventHandler(async event => {
  // Autenticación por token secreto de n8n
  const config = useRuntimeConfig()
  const token = getHeader(event, 'x-n8n-token')

  if (!token || token !== config.n8nSecretToken)
    throw createError({ statusCode: 401, message: 'Token inválido' })

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Obtener todos los admins y abogados para notificarles
  const adminUsers = await User.find({ status: true }).lean()
  const adminIds = adminUsers.map((u: any) => u._id)

  let created = 0

  // ─── 1. Facturas vencidas ─────────────────────────────────────────────────────
  const overdueInvoices = await Invoice.find({
    status: { $in: ['sent', 'partial'] },
    dueDate: { $lt: today },
    type: 'invoice',
  }).populate('contactId', 'name fullName').lean()

  for (const invoice of overdueInvoices) {
    for (const userId of adminIds) {
      // Evitar duplicados — no crear si ya existe una notificación hoy
      const existing = await Notification.findOne({
        userId,
        link: `/billing/${invoice._id}`,
        createdAt: { $gte: today },
      })

      if (existing)
        continue

      await Notification.create({
        userId,
        title: 'Factura vencida',
        message: `La factura ${(invoice as any).number} de ${(invoice as any).contactId?.fullName || (invoice as any).contactId?.name || 'cliente'} está vencida desde el ${new Date((invoice as any).dueDate).toLocaleDateString('es-ES')}`,
        type: 'error',
        category: 'system',
        link: `/billing/${(invoice as any)._id}`,
      })
      created++
    }
  }

  // ─── 2. Expedientes con fecha límite próxima (3 días) ─────────────────────────
  const urgentCases = await LegalCase.find({
    status: { $in: ['open', 'in_progress'] },
    deadline: { $gte: today, $lte: in3Days },
  }).populate('contactId', 'name fullName').lean()

  for (const caseDoc of urgentCases) {
    for (const userId of adminIds) {
      const existing = await Notification.findOne({
        userId,
        link: `/cases/${caseDoc._id}`,
        createdAt: { $gte: today },
      })

      if (existing)
        continue

      const daysLeft = Math.ceil(((caseDoc as any).deadline - today.getTime()) / (1000 * 60 * 60 * 24))

      await Notification.create({
        userId,
        title: 'Fecha límite próxima',
        message: `El expediente ${(caseDoc as any).number} vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'} (${new Date((caseDoc as any).deadline).toLocaleDateString('es-ES')})`,
        type: daysLeft <= 1 ? 'error' : 'warning',
        category: 'system',
        link: `/cases/${(caseDoc as any)._id}`,
      })
      created++
    }
  }

  // ─── 3. Citas de hoy ──────────────────────────────────────────────────────────
  const todayAppointments = await Appointment.find({
    startAt: { $gte: today, $lt: tomorrow },
    status: { $in: ['pending', 'confirmed'] },
  }).populate('contactId', 'name fullName').lean()

  for (const apt of todayAppointments) {
    // Solo notificar al abogado asignado o a todos si no hay abogado
    const notifyIds = (apt as any).lawyerId
      ? adminIds.filter((id: any) => id.toString() === (apt as any).lawyerId?.toString())
      : adminIds

    for (const userId of notifyIds) {
      const existing = await Notification.findOne({
        userId,
        link: '/calendar',
        message: { $regex: (apt as any).title },
        createdAt: { $gte: today },
      })

      if (existing)
        continue

      const hour = new Date((apt as any).startAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

      await Notification.create({
        userId,
        title: 'Cita hoy',
        message: `${(apt as any).title} a las ${hour}${(apt as any).contactId ? ` con ${(apt as any).contactId?.fullName || (apt as any).contactId?.name}` : ''}`,
        type: 'info',
        category: 'system',
        link: '/calendar',
      })
      created++
    }
  }

  return {
    ok: true,
    created,
    summary: {
      overdueInvoices: overdueInvoices.length,
      urgentCases: urgentCases.length,
      todayAppointments: todayAppointments.length,
    },
  }
})
