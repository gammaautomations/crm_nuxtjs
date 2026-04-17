import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { UAParser } from 'ua-parser-js'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password)
    throw createError({ statusCode: 400, message: 'Email y password son requeridos' })

  const user = await User.findOne({ email }).select('+password')

  if (!user)
    throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })

  if (!user.status)
    throw createError({ statusCode: 403, message: 'Usuario desactivado' })

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    await User.findByIdAndUpdate(user._id, { $inc: { loginAttempts: 1 } })
    throw createError({ statusCode: 401, message: 'Credenciales incorrectas' })
  }

  // Capturar IP y navegador
  const ip = getHeader(event, 'x-forwarded-for')
    || getHeader(event, 'x-real-ip')
    || event.node.req.socket?.remoteAddress
    || 'desconocida'

  const userAgent = getHeader(event, 'user-agent') || ''
  const parser = new UAParser(userAgent)
  const browser = `${parser.getBrowser().name || ''} ${parser.getBrowser().version || ''}`.trim()
  const os = `${parser.getOS().name || ''} ${parser.getOS().version || ''}`.trim()

  // Actualizar usuario
  await User.findByIdAndUpdate(user._id, {
    loginAttempts: 0,
    lastLogin: new Date(),
    $push: {
      sessions: {
        $each: [{
          ip,
          userAgent,
          browser,
          os,
          date: new Date(),
        }],
        $slice: -10, // guardar solo las últimas 10 sesiones
      },
    },
  })

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

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
  })

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
