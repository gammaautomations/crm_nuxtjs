import { createError, defineEventHandler, getRouterParam } from 'h3'
import CaseDocument from '~/server/models/CaseDocument'
import { requireAuth } from '~/server/utils/auth.middleware'
import { deleteFile } from '~/server/utils/local-storage'

export default defineEventHandler(async event => {
  requireAuth(event)

  const docId = getRouterParam(event, 'docId')
  const doc = await CaseDocument.findById(docId)

  if (!doc)
    throw createError({ statusCode: 404, message: 'Documento no encontrado' })

  await deleteFile(doc.driveUrl)
  await doc.deleteOne()

  return { ok: true }
})
