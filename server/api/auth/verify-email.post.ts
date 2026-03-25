// server/api/auth/verify-email.post.ts

import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const body = await readBody(event)
  const { email, code } = body

  if (!email || !code)
    throw createError({ statusCode: 400, message: 'Email y código son requeridos' })

  const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires')

  if (!user)
    throw createError({ statusCode: 404, message: 'Usuario no encontrado' })

  if (user.emailVerified)
    throw createError({ statusCode: 400, message: 'El email ya está verificado' })

  if (!user.verificationCode || !user.verificationCodeExpires)
    throw createError({ statusCode: 400, message: 'No hay código de verificación activo' })

  // Verificar expiración
  if (new Date() > user.verificationCodeExpires)
    throw createError({ statusCode: 400, message: 'El código ha expirado' })

  // Verificar código
  if (user.verificationCode !== code)
    throw createError({ statusCode: 400, message: 'Código incorrecto' })

  // Marcar email como verificado
  await User.findByIdAndUpdate(user._id, {
    emailVerified: true,
    verificationCode: null,
    verificationCodeExpires: null,
  })

  return { message: 'Email verificado correctamente' }
})
