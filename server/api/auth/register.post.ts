import bcrypt from 'bcrypt'
import { validateRegisterDto } from '~/server/dtos/auth.dto'
import { Profile } from '~/server/models/Profile'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'
import { sendWelcomeEmail } from '~/server/utils/mailer'

export default defineEventHandler(async event => {
  await connectDB()

  const body = await readBody(event)
  const dto = validateRegisterDto(body)

  // Verificar si ya existe
  const exists = await User.findOne({
    $or: [{ email: dto.email }, { username: dto.username }],
  })

  if (exists) {
    throw createError({
      statusCode: 409,
      message: exists.email === dto.email
        ? 'El email ya está en uso'
        : 'El username ya está en uso',
    })
  }

  // Hashear password
  const hashedPassword = await bcrypt.hash(dto.password, 10)

  // Crear usuario
  const user = await User.create({
    username: dto.username,
    email: dto.email,
    password: hashedPassword,
  })

  // Crear perfil automáticamente
  await Profile.create({ userId: user._id })

  await sendWelcomeEmail(user.email, user.username)

  return {
    message: 'Usuario registrado correctamente',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  }
})
