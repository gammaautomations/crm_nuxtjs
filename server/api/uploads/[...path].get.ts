import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createError, defineEventHandler, setHeader } from 'h3'

const UPLOAD_DIR = '/app/uploads'

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
}

export default defineEventHandler(async event => {
  const filePath = event.context.params?.path

  if (!filePath)
    throw createError({ statusCode: 400, message: 'Ruta requerida' })

  // Evitar path traversal
  const safePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '')
  const fullPath = path.join(UPLOAD_DIR, safePath)

  if (!fullPath.startsWith(UPLOAD_DIR))
    throw createError({ statusCode: 403, message: 'Acceso denegado' })

  try {
    const buffer = await fs.readFile(fullPath)
    const ext = path.extname(fullPath).toLowerCase()
    const mime = MIME_TYPES[ext] || 'application/octet-stream'

    setHeader(event, 'Content-Type', mime)
    setHeader(event, 'Cache-Control', 'private, max-age=3600')

    return buffer
  }
  catch {
    throw createError({ statusCode: 404, message: 'Archivo no encontrado' })
  }
})
