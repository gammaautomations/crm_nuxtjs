import { Contact } from '~/server/models/Contact'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'
import { createNotification } from '~/server/utils/notifications'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const id = getRouterParam(event, 'id')

  const contact = await Contact.findOneAndDelete({
    _id: id,
    owner: decoded.id,
  })

  if (!contact)
    throw createError({ statusCode: 404, message: 'Contacto no encontrado' })

  await createNotification({
    userId: decoded.id,
    title: 'Contacto eliminado',
    message: `El contacto ${contact.fullName || contact.email || ''} ha sido eliminado.`,
    type: 'warning',
    category: 'contact',
  })

  return { message: 'Contacto eliminado correctamente' }
})
