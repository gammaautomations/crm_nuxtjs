import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { GeneralSetting } from '~/server/models/GeneralSetting'
import { requireRole } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireRole(event, ['Admin'])

  const formData = await readMultipartFormData(event)
  const faviconFile = formData?.find(f => f.name === 'favicon')

  if (!faviconFile)
    throw createError({ statusCode: 400, message: 'No se envió ningún archivo' })

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'settings')

  await mkdir(uploadDir, { recursive: true })

  const ext = faviconFile.filename?.split('.').pop() || 'ico'
  const filename = `favicon.${ext}`
  const filepath = join(uploadDir, filename)

  await writeFile(filepath, faviconFile.data)
  await GeneralSetting.findOneAndUpdate({}, { favicon: filename })

  return { favicon: filename }
})
