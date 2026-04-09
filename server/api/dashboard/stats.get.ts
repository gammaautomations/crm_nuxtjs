// server/api/dashboard/stats.get.ts

import { Contact } from '~/server/models/Contact'
import { Lawyer } from '~/server/models/Lawyer'
import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  const [
    totalLeads,
    totalContacts,
    totalLawyers,
    leadsByStatus,
    leadsByArea,
    recentLeads,
    lawyersByLeads,
    leadsByScore,
  ] = await Promise.all([
    // Totales
    Lead.countDocuments(),
    Contact.countDocuments(),
    Lawyer.countDocuments({ active: true }),

    // Leads por estado
    Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Leads por área
    Lead.aggregate([
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Leads recientes
    Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedLawyer', 'name')
      .lean(),

    // Abogados con más leads
    Lawyer.find({ active: true })
      .populate('assignedLeads')
      .lean()
      .then(lawyers =>
        lawyers
          .map(l => ({
            name: l.name,
            count: l.assignedLeads?.length || 0,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      ),

    // Leads por score
    Lead.aggregate([
      {
        $bucket: {
          groupBy: '$lead_score',
          boundaries: [0, 4, 6, 8, 11],
          default: 'otros',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
  ])

  return {
    totals: { totalLeads, totalContacts, totalLawyers },
    leadsByStatus,
    leadsByArea,
    recentLeads,
    lawyersByLeads,
    leadsByScore,
  }
})
