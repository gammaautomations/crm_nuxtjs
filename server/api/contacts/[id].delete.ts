import { Contact } from '~/server/models/Contact'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

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

  return { message: 'Contacto eliminado correctamente' }
})
