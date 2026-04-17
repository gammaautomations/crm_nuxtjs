import { Lawyer } from '~/server/models/Lawyer'
import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  const lawyers = await Lawyer.find({ active: true }).lean()

  const stats = await Promise.all(
    lawyers.map(async (lawyer: any) => {
      const leads = await Lead.find({ assignedLawyer: lawyer._id }).lean()

      const byStatus = leads.reduce((acc: any, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1

        return acc
      }, {})

      const byArea = leads.reduce((acc: any, lead: any) => {
        acc[lead.area] = (acc[lead.area] || 0) + 1

        return acc
      }, {})

      const avgScore = leads.length
        ? Math.round(leads.reduce((sum: number, l: any) => sum + (l.lead_score || 0), 0) / leads.length)
        : 0

      return {
        _id: lawyer._id,
        name: lawyer.name,
        email: lawyer.email,
        phone: lawyer.phone,
        totalLeads: leads.length,
        byStatus,
        byArea,
        avgScore,
      }
    }),
  )

  return stats.sort((a, b) => b.totalLeads - a.totalLeads)
})
