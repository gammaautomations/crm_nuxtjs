// server/api/specialties/index.get.ts

import { Specialty } from '~/server/models/Specialty'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  return await Specialty.find({ active: true }).lean()
})
