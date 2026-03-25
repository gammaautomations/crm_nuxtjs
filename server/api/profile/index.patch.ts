// index.patch.ts

import jwt from 'jsonwebtoken'
import { Profile } from '~/server/models/Profile'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const token = getCookie(event, 'auth_token')
  if (!token)
    throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig()
  const decoded = jwt.verify(token, config.jwtSecret) as { id: string }

  const body = await readBody(event)
  const { fullname, phone, phone1, whatsapp } = body

  const profile = await Profile.findOneAndUpdate(
    { userId: decoded.id },
    { $set: { fullname, phone, phone1, whatsapp } },
    { returnDocument: 'after', runValidators: true },
  )

  if (!profile)
    throw createError({ statusCode: 404, message: 'Perfil no encontrado' })

  return { message: 'Perfil actualizado correctamente', profile }
})
