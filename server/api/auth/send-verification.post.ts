// server/api/auth/send-verification.post.ts

import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'
import { sendVerificationEmail } from '~/server/utils/mailer'

export default defineEventHandler(async event => {
  await connectDB()

  const body = await readBody(event)
  const { email } = body

  if (!email)
    throw createError({ statusCode: 400, message: 'Email es requerido' })

  const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires')

  if (!user)
    throw createError({ statusCode: 404, message: 'Usuario no encontrado' })

  if (user.emailVerified)
    throw createError({ statusCode: 400, message: 'El email ya está verificado' })

  // Generar código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

  // Guardar código en el usuario
  await User.findByIdAndUpdate(user._id, {
    verificationCode: code,
    verificationCodeExpires: expires,
  })

  // Enviar email
  await sendVerificationEmail(email, user.username, code)

  return { message: 'Código enviado correctamente' }
})
