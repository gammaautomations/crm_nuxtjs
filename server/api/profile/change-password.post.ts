// change-password.post.ts

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { validateChangePasswordDto } from '~/server/dtos/profile.dto'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const token = getCookie(event, 'auth_token')
  if (!token)
    throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig()
  const decoded = jwt.verify(token, config.jwtSecret) as { id: string }

  const body = await readBody(event)
  const dto = validateChangePasswordDto(body)

  const user = await User.findById(decoded.id).select('+password')
  if (!user)
    throw createError({ statusCode: 404, message: 'Usuario no encontrado' })

  const validPassword = await bcrypt.compare(dto.currentPassword, user.password)
  if (!validPassword)
    throw createError({ statusCode: 401, message: 'La contraseña actual es incorrecta' })

  const hashedPassword = await bcrypt.hash(dto.newPassword, 10)

  await User.findByIdAndUpdate(decoded.id, { password: hashedPassword })

  return { message: 'Contraseña actualizada correctamente' }
})
