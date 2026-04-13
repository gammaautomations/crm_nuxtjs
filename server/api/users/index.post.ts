// server/api/users/index.post.ts

import bcrypt from 'bcrypt'
import { User } from '~/server/models/User'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const body = await readBody(event)

  if (!body.username || !body.email || !body.password)
    throw createError({ statusCode: 400, message: 'Username, email y contraseña son requeridos' })

  const exists = await User.findOne({
    $or: [{ email: body.email }, { username: body.username }],
  })

  if (exists)
    throw createError({ statusCode: 409, message: 'Ya existe un usuario con ese email o username' })

  const hashedPassword = await bcrypt.hash(body.password, 10)

  return await User.create({
    username: body.username,
    email: body.email,
    password: hashedPassword,
    role: body.role || 'Recepcionista',
    emailVerified: true,
  })
})
