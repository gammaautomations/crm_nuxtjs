import { Contact } from '~/server/models/Contact'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const contact = await Contact.findOneAndUpdate(
    { _id: id, owner: decoded.id },
    { $set: body },
    { returnDocument: 'after', runValidators: true },
  )

  if (!contact)
    throw createError({ statusCode: 404, message: 'Contacto no encontrado' })

  return contact
})
