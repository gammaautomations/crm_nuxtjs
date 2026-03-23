import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const body = await readBody(event)
  const { email, password } = body

  // Validación básica
  if (!email || !password)
    throw createError({ statusCode: 400, message: 'Email y password son requeridos' })

  // Buscar usuario por email o username
  const user = await User.findOne({ email }).select('+password')

  if (!user)
    throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })

  // Verificar si está activo
  if (!user.status)
    throw createError({ statusCode: 403, message: 'Usuario desactivado' })

  // Verificar password
  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    // Incrementar loginAttempts
    await User.findByIdAndUpdate(user._id, { $inc: { loginAttempts: 1 } })
    throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })
  }

  // Resetear loginAttempts y actualizar lastLogin
  await User.findByIdAndUpdate(user._id, {
    loginAttempts: 0,
    lastLogin: new Date(),
  })

  // Generar JWT
  const config = useRuntimeConfig()

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '7d' },
  )

  // Guardar token en cookie httpOnly
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  })

  // Devolver datos del usuario sin password
  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  }
})
