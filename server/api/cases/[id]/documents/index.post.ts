import { createError, defineEventHandler, getRouterParam, readMultipartFormData } from 'h3'
import CaseDocument from '~/server/models/CaseDocument'
import { requireAuth } from '~/server/utils/auth.middleware'
import { saveFile } from '~/server/utils/local-storage'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
]

export default defineEventHandler(async event => {
  const user = requireAuth(event)
  const caseId = getRouterParam(event, 'id')

  const formData = await readMultipartFormData(event)
  if (!formData?.length)
    throw createError({ statusCode: 400, message: 'No se ha enviado ningún archivo' })

  const fileField = formData.find(f => f.name === 'file')
  if (!fileField?.data)
    throw createError({ statusCode: 400, message: 'Campo "file" requerido' })

  const mimeType = fileField.type || 'application/octet-stream'
  const filename = fileField.filename || 'documento'

  if (!ALLOWED_TYPES.includes(mimeType))
    throw createError({ statusCode: 422, message: `Tipo de archivo no permitido: ${mimeType}` })

  if (fileField.data.length > MAX_SIZE)
    throw createError({ statusCode: 422, message: 'El archivo no puede superar los 20MB' })

  const saved = await saveFile(fileField.data, filename, `case-${caseId}`)

  const nameField = formData.find(f => f.name === 'name')
  const docName = nameField?.data?.toString() || filename

  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl || 'https://crm.gammaautomations.es'

  return await CaseDocument.create({
    name: docName,
    originalName: filename,
    mimeType,
    size: fileField.data.length,
    driveId: saved.id,
    driveUrl: `${baseUrl}/api/uploads/case-${caseId}/${saved.filename}`,
    downloadUrl: `${baseUrl}/api/uploads/case-${caseId}/${saved.filename}`,
    caseId,
    uploadedBy: user.id,
  })
})
