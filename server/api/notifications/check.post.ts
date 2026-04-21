import { createError, defineEventHandler, getHeader } from 'h3'
import Appointment from '~/server/models/Appointment'
import Invoice from '~/server/models/Invoice'
import LegalCase from '~/server/models/LegalCase'
import { Notification } from '~/server/models/Notification'
import { User } from '~/server/models/User'
import { emailTemplate, sendMail } from '~/server/utils/mailer'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()
  const token = getHeader(event, 'x-n8n-token')

  if (!token || token !== config.n8nSecretToken)
    throw createError({ statusCode: 401, message: 'Token inválido' })

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)

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

  // ─── Enviar email resumen ─────────────────────────────────────────────────────
  try {
    const hasAlerts = overdueInvoices.length > 0 || urgentCases.length > 0 || todayAppointments.length > 0

    if (true) {
      const appUrl = config.public.appUrl || 'https://crm.gammaautomations.es'
      let bodyHtml = `<p>Buenos días. Resumen de alertas para hoy <strong>${today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>:</p>`

      if (overdueInvoices.length > 0) {
        bodyHtml += `<div class="alert error"><strong>🔴 Facturas vencidas (${overdueInvoices.length})</strong>`
        for (const inv of overdueInvoices.slice(0, 5))
          bodyHtml += `<p style="margin:4px 0">• ${(inv as any).number} — ${(inv as any).contactId?.fullName || (inv as any).contactId?.name || 'Sin cliente'} — vencida el ${new Date((inv as any).dueDate).toLocaleDateString('es-ES')}</p>`
        if (overdueInvoices.length > 5)
          bodyHtml += `<p style="margin:4px 0">...y ${overdueInvoices.length - 5} más</p>`
        bodyHtml += `<a href="${appUrl}/billing" class="btn">Ver facturas</a></div>`
      }

      if (urgentCases.length > 0) {
        bodyHtml += `<div class="alert warning"><strong>🟡 Expedientes con fecha límite próxima (${urgentCases.length})</strong>`
        for (const c of urgentCases.slice(0, 5)) {
          const days = Math.ceil(((c as any).deadline - today.getTime()) / (1000 * 60 * 60 * 24))

          bodyHtml += `<p style="margin:4px 0">• ${(c as any).number} — ${(c as any).title} — vence en ${days} día${days === 1 ? '' : 's'}</p>`
        }
        bodyHtml += `<a href="${appUrl}/cases" class="btn">Ver expedientes</a></div>`
      }

      if (todayAppointments.length > 0) {
        bodyHtml += `<div class="alert info"><strong>🔵 Citas de hoy (${todayAppointments.length})</strong>`
        for (const apt of todayAppointments) {
          const hour = new Date((apt as any).startAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

          bodyHtml += `<p style="margin:4px 0">• ${hour} — ${(apt as any).title}${(apt as any).contactId ? ` con ${(apt as any).contactId?.fullName || (apt as any).contactId?.name}` : ''}</p>`
        }
        bodyHtml += `<a href="${appUrl}/calendar" class="btn">Ver calendario</a></div>`
      }

      const emails = (adminUsers as any[]).filter(u => u.email).map(u => u.email)
      if (emails.length > 0) {
        console.log('[Notificaciones] Enviando email a:', emails)
        console.log('[Notificaciones] Usuarios:', adminUsers.length, 'Emails:', emails)
        await sendMail({
          to: emails,
          subject: `📋 CRM — Resumen diario ${today.toLocaleDateString('es-ES')}`,
          html: emailTemplate('Resumen diario', bodyHtml),
        })
        console.log('[Notificaciones] Email enviado correctamente')
      }
    }
  }
  catch (err) {
    console.error('[Notificaciones] Error enviando email:', err)
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
