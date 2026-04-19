// server/utils/appointment-webhook.ts
// Dispara el webhook de n8n cuando se crea/edita/cancela una cita

import type { IAppointment } from '~/server/models/Appointment'

type WebhookAction = 'created' | 'updated' | 'cancelled' | 'completed'

export const sendAppointmentWebhook = async (
  appointment: IAppointment,
  action: WebhookAction,
): Promise<void> => {
  const config = useRuntimeConfig()
  const webhookUrl = config.public.n8nWebhookUrl

  if (!webhookUrl) {
    console.warn('[Webhook] n8nWebhookUrl no configurada — saltando webhook de cita')

    return
  }

  const payload = {
    action,
    appointment: {
      id: (appointment as any)._id?.toString(),
      title: appointment.title,
      description: appointment.description,
      type: appointment.type,
      status: appointment.status,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      allDay: appointment.allDay,
      location: appointment.location,
      meetUrl: appointment.meetUrl,
      reminderMinutes: appointment.reminderMinutes,
      color: appointment.color,
    },

    // n8n puede usar estos IDs para buscar más info si necesita
    relations: {
      contactId: appointment.contactId?.toString() ?? null,
      leadId: appointment.leadId?.toString() ?? null,
      lawyerId: appointment.lawyerId?.toString() ?? null,
    },
    triggeredAt: new Date().toISOString(),
  }

  try {
    const res = await fetch(`${webhookUrl}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok)
      console.error(`[Webhook] Error ${res.status} enviando cita a n8n`)

    // No lanzamos error — el webhook falla silenciosamente para no bloquear la operación
  }
  catch (err) {
    console.error('[Webhook] Error de red enviando cita a n8n:', err)
  }
}
