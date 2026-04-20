import { defineEventHandler, getQuery } from 'h3'
import LegalCase from '~/server/models/LegalCase'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const {
    page = '1', limit = '20', status, type, priority,
    contactId, lawyerId, search, sortBy = 'openedAt', sortOrder = 'desc',
  } = getQuery(event)

  const filter: Record<string, unknown> = {}
  if (status)
    filter.status = status
  if (type)
    filter.type = type
  if (priority)
    filter.priority = priority
  if (contactId)
    filter.contactId = contactId
  if (lawyerId)
    filter.lawyerId = lawyerId
  if (search) {
    const re = new RegExp(search as string, 'i')

    filter.$or = [{ number: re }, { title: re }, { procedureNumber: re }, { opposingParty: re }]
  }

  const pageNum = Math.max(1, Number.parseInt(page as string, 10))
  const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit as string, 10)))
  const skip = (pageNum - 1) * limitNum
  const sort = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 }

  const [data, total] = await Promise.all([
    LegalCase.find(filter).sort(sort).skip(skip).limit(limitNum)
      .populate('contactId', 'name fullName email')
      .populate('lawyerId', 'name email')
      .lean(),
    LegalCase.countDocuments(filter),
  ])

  return { data, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } }
})
