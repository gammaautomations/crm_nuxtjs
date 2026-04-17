// server/api/leads/index.get.ts

import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const skip = (page - 1) * limit

  const filter: any = {}

  if (query.status)
    filter.status = query.status
  if (query.area)
    filter.area = query.area
  if (query.search) {
    filter.$or = [
      { nombre: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ]
  }
  if (query.lawyer)
    filter.assignedLawyer = query.lawyer

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate('assignedLawyer', 'name email') // 👈 agregar
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
  ])

  return {
    data: leads,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
})
