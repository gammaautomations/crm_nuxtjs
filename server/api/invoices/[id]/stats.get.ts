import { defineEventHandler, getQuery } from 'h3'
import Invoice from '~/server/models/Invoice'

export default defineEventHandler(async (event) => {
  const { year = new Date().getFullYear().toString() } = getQuery(event)
  const y     = parseInt(year as string, 10)
  const start = new Date(y, 0, 1)
  const end   = new Date(y + 1, 0, 1)

  const [summary, byStatus, monthly] = await Promise.all([
    Invoice.aggregate([
      { $match: { issuedAt: { $gte: start, $lt: end }, type: 'invoice' } },
      { $group: { _id: null, totalIssued: { $sum: '$total' }, totalPaid: { $sum: '$amountPaid' },
          totalPending: { $sum: { $cond: [{ $in: ['$status', ['sent', 'partial']] }, '$amountDue', 0] } },
          totalOverdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$amountDue', 0] } },
          count: { $sum: 1 }, avgTotal: { $avg: '$total' } } },
    ]),
    Invoice.aggregate([
      { $match: { issuedAt: { $gte: start, $lt: end }, type: 'invoice' } },
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$total' } } },
    ]),
    Invoice.aggregate([
      { $match: { issuedAt: { $gte: start, $lt: end }, type: 'invoice', status: { $nin: ['cancelled', 'void', 'draft'] } } },
      { $group: { _id: { $month: '$issuedAt' }, issued: { $sum: '$total' }, paid: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ])

  const monthlyMap  = new Map((monthly as any[]).map(m => [m._id, m]))
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const m = monthlyMap.get(i + 1) as any
    return { month: i + 1, issued: m?.issued ?? 0, paid: m?.paid ?? 0, count: m?.count ?? 0 }
  })

  return {
    year,
    summary:  (summary as any[])[0] ?? { totalIssued: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0, count: 0, avgTotal: 0 },
    byStatus: Object.fromEntries((byStatus as any[]).map(s => [s._id, { count: s.count, amount: s.amount }])),
    monthly:  monthlyData,
  }
})
