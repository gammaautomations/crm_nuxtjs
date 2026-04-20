import { defineEventHandler, getQuery } from 'h3'
import TimeEntry from '~/server/models/TimeEntry'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const { caseId, lawyerId, billed, from, to } = getQuery(event)

  const filter: Record<string, unknown> = {}
  if (caseId)
    filter.caseId = caseId
  if (lawyerId)
    filter.lawyerId = lawyerId
  if (billed !== undefined)
    filter.billed = billed === 'true'
  if (from || to) {
    filter.date = {
      ...(from ? { $gte: new Date(from as string) } : {}),
      ...(to ? { $lte: new Date(to as string) } : {}),
    }
  }

  const entries = await TimeEntry.find(filter)
    .sort({ date: -1 })
    .populate('caseId', 'number title')
    .populate('lawyerId', 'name email')
    .lean()

  const totalHours = entries.reduce((s, e) => s + e.hours, 0)
  const totalAmount = entries.reduce((s, e) => s + e.amount, 0)

  return { data: entries, totalHours: Math.round(totalHours * 100) / 100, totalAmount: Math.round(totalAmount * 100) / 100 }
})
