import { defineEventHandler, getQuery } from 'h3'
import Invoice from '~/server/models/Invoice'

export default defineEventHandler(async (event) => {
  const {
    page = '1', limit = '20', status, series, type,
    contactId, leadId, lawyerId, search, from, to,
    overdueOnly, sortBy = 'issuedAt', sortOrder = 'desc',
  } = getQuery(event)

  const filter: Record<string, unknown> = {}

  if (status)    filter.status    = status
  if (series)    filter.series    = series
  if (type)      filter.type      = type
  if (contactId) filter.contactId = contactId
  if (leadId)    filter.leadId    = leadId
  if (lawyerId)  filter.lawyerId  = lawyerId

  if (overdueOnly === 'true') {
    filter.status    = { $in: ['sent', 'partial', 'overdue'] }
    filter.dueDate   = { $lt: new Date() }
    filter.amountDue = { $gt: 0 }
  }

  if (from || to) {
    filter.issuedAt = {
      ...(from ? { $gte: new Date(from as string) } : {}),
      ...(to   ? { $lte: new Date(to   as string) } : {}),
    }
  }

  if (search) {
    const re = new RegExp(search as string, 'i')
    filter.$or = [
      { number:          re },
      { 'client.name':   re },
      { 'client.nif':    re },
      { notes:           re },
    ]
  }

  const pageNum  = Math.max(1, parseInt(page  as string, 10))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)))
  const skip     = (pageNum - 1) * limitNum
  const sort     = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 }

  const [data, total] = await Promise.all([
    Invoice.find(filter)
      .sort(sort).skip(skip).limit(limitNum)
      .populate('contactId', 'name email')
      .populate('lawyerId',  'name email')
      .lean(),
    Invoice.countDocuments(filter),
  ])

  return { data, meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } }
})
