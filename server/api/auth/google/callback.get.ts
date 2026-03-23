import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const config = useRuntimeConfig()
  const query = getQuery(event)
  const code = query.code as string

  if (!code)
    return sendRedirect(event, '/login?error=no_code')

  try {
    // Intercambiar código por tokens
    const client = new OAuth2Client(
      config.googleClientId,
      config.googleClientSecret,
      `${config.public.appUrl}/api/auth/google/callback`,
    )

    const { tokens } = await client.getToken(code)

    client.setCredentials(tokens)

    // Obtener datos del usuario de Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.googleClientId,
    })

    const payload = ticket.getPayload()
    if (!payload?.email)
      return sendRedirect(event, '/login?error=no_email')

    // Buscar o crear usuario en MongoDB
    let user = await User.findOne({ email: payload.email })

    if (!user) {
      // Crear usuario nuevo con datos de Google
      user = await User.create({
        username: payload.email.split('@')[0],
        email: payload.email,
        avatar: payload.picture || 'sin-imagen.png',
        role: 'Viewer',
        status: true,
        emailVerified: true,
      })
    }

    // Verificar que está activo
    if (!user.status)
      return sendRedirect(event, '/login?error=disabled')

    // Actualizar lastLogin
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

    // Generar JWT igual que el login normal
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

    // Guardar en cookie httpOnly
    setCookie(event, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    })

    return sendRedirect(event, '/')
  }
  catch (error) {
    console.error('Google OAuth error:', error)

    return sendRedirect(event, '/auth/callback', 302)
  }
})
