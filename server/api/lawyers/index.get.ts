// server/api/lawyers/index.get.ts

import { Lawyer } from '~/server/models/Lawyer'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  return await Lawyer.find({ active: true })
    .populate('specialties')
    .lean()
})
