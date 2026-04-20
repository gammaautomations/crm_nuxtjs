import { createError, defineEventHandler, getRouterParam } from 'h3'
import CaseDocument from '~/server/models/CaseDocument'
import { requireAuth } from '~/server/utils/auth.middleware'
import { deleteFileFromDrive } from '~/server/utils/google-drive'

export default defineEventHandler(async event => {
  requireAuth(event)

  const docId = getRouterParam(event, 'docId')
  const doc = await CaseDocument.findById(docId)

  if (!doc)
    throw createError({ statusCode: 404, message: 'Documento no encontrado' })

  // Eliminar de Drive
  try {
    await deleteFileFromDrive(doc.driveId)
  }
  catch {
    // Si falla en Drive, igual eliminamos de la BD
    console.warn(`No se pudo eliminar el archivo ${doc.driveId} de Drive`)
  }

  await doc.deleteOne()

  return { ok: true }
})
