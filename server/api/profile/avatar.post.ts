// avatar.post.ts

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import jwt from 'jsonwebtoken'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const token = getCookie(event, 'auth_token')
  if (!token)
    throw createError({ statusCode: 401, message: 'No autenticado' })

  const config = useRuntimeConfig()
  const decoded = jwt.verify(token, config.jwtSecret) as { id: string }

  // Leer el archivo
  const formData = await readMultipartFormData(event)
  const avatarFile = formData?.find(f => f.name === 'avatar')

  if (!avatarFile)
    throw createError({ statusCode: 400, message: 'No se envió ningún archivo' })

  // Crear carpeta si no existe
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')

  await mkdir(uploadDir, { recursive: true })

  // Guardar archivo con el userId como nombre
  const ext = avatarFile.filename?.split('.').pop() || 'jpg'
  const filename = `${decoded.id}.${ext}`
  const filepath = join(uploadDir, filename)

  await writeFile(filepath, avatarFile.data)

  // Actualizar avatar en el usuario
  await User.findByIdAndUpdate(decoded.id, { avatar: filename })

  return { message: 'Avatar actualizado', avatar: filename }
})
