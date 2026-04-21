import { defineEventHandler } from 'h3'
import { requireAuth } from '~/server/utils/auth.middleware'
import { User } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  const auth = requireAuth(event)
  const user = await User.findById(auth.id).lean()
  if (!user) throw createError({ statusCode: 404, message: 'Usuario no encontrado' })
  return (user as any).notificationPrefs || {
    emailInvoiceDue:     true,
    emailCaseDeadline:   true,
    emailAppointments:   true,
    crmInvoiceDue:       true,
    crmCaseDeadline:     true,
    crmAppointments:     true,
  }
})
