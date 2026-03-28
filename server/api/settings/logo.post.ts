import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { GeneralSetting } from '~/server/models/GeneralSetting'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const formData = await readMultipartFormData(event)
  const logoFile = formData?.find(f => f.name === 'logo')

  if (!logoFile)
    throw createError({ statusCode: 400, message: 'No se envió ningún archivo' })

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'settings')

  await mkdir(uploadDir, { recursive: true })

  const ext = logoFile.filename?.split('.').pop() || 'png'
  const filename = `logo.${ext}`
  const filepath = join(uploadDir, filename)

  await writeFile(filepath, logoFile.data)
  await GeneralSetting.findOneAndUpdate({}, { logo: filename })

  return { logo: filename }
})
