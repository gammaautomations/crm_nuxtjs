import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const query = getQuery(event)

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).lean(),
    User.countDocuments(),
  ])

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
})
