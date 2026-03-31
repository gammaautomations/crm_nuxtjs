import { Contact } from '~/server/models/Contact'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const skip = (page - 1) * limit

  // Filtros
  const filter: any = { owner: decoded.id }

  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ]
  }

  if (query.status)
    filter.status = query.status
  if (query.source)
    filter.source = query.source
  if (query.tag)
    filter.tags = { $in: [query.tag] }

  const [contacts, total] = await Promise.all([
    Contact.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Contact.countDocuments(filter),
  ])

  return {
    data: contacts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
})
