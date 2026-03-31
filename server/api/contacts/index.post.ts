import { Contact } from '~/server/models/Contact'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

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

  return await Contact.create({
    ...body,
    owner: decoded.id,
    source: 'manual',
  })
})
