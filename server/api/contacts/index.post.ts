import { Contact } from '~/server/models/Contact'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'
import { createNotification } from '~/server/utils/notifications'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)
  const body = await readBody(event)

  // Verificar duplicado por email
  if (body.email) {
    const exists = await Contact.findOne({
      email: body.email,
      owner: decoded.id,
    })

    if (exists)
      throw createError({ statusCode: 409, message: 'Ya existe un contacto con ese email' })
  }

  // Crear contacto
  const contact = await Contact.create({
    ...body,
    owner: decoded.id,
    source: 'manual',
  })

  // Notificación
  await createNotification({
    userId: decoded.id,
    title: 'Contacto creado',
    message: `El contacto ${contact.fullName || contact.email || 'nuevo'} ha sido creado correctamente.`,
    type: 'success',
    category: 'contact',
    link: `/contacts/${contact._id}`,
  })

  return contact
})
