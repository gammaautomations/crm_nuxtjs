import Appointment from '~/server/models/Appointment'
import { Contact } from '~/server/models/Contact'
import Invoice from '~/server/models/Invoice'
import { Lawyer } from '~/server/models/Lawyer'
import { Lead } from '~/server/models/Lead'
import LegalCase from '~/server/models/LegalCase '
import TimeEntry from '~/server/models/TimeEntry'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  const now = new Date()
  const y = now.getFullYear()
  const monthStart = new Date(y, now.getMonth(), 1)
  const monthEnd = new Date(y, now.getMonth() + 1, 1)
  const yearStart = new Date(y, 0, 1)
  const yearEnd = new Date(y + 1, 0, 1)
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [
    // ── Leads (existentes) ──────────────────────────────────────────────────
    totalLeads,
    totalContacts,
    totalLawyers,
    leadsByStatus,
    leadsByArea,
    recentLeads,
    lawyersByLeads,
    leadsByScore,

    // ── Facturación ─────────────────────────────────────────────────────────
    invoiceStats,
    invoiceMonthly,

    // ── Expedientes ─────────────────────────────────────────────────────────
    caseStats,
    recentCases,

    // ── Calendario ──────────────────────────────────────────────────────────
    upcomingAppointments,

    // ── Horas ───────────────────────────────────────────────────────────────
    timeStats,
  ] = await Promise.all([

    // ── Leads ───────────────────────────────────────────────────────────────
    Lead.countDocuments(),
    Contact.countDocuments(),
    Lawyer.countDocuments({ active: true }),
    Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Lead.aggregate([
      { $group: { _id: '$area', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Lead.find().sort({ createdAt: -1 }).limit(5).populate('assignedLawyer', 'name').lean(),
    Lawyer.find({ active: true }).populate('assignedLeads').lean().then(lawyers =>
      lawyers.map(l => ({ name: l.name, count: (l as any).assignedLeads?.length || 0 }))
        .sort((a, b) => b.count - a.count).slice(0, 5),
    ),
    Lead.aggregate([
      { $bucket: { groupBy: '$lead_score', boundaries: [0, 4, 6, 8, 11], default: 'otros', output: { count: { $sum: 1 } } } },
    ]),

    // ── Facturación anual ───────────────────────────────────────────────────
    Invoice.aggregate([
      { $match: { type: 'invoice', issuedAt: { $gte: yearStart, $lt: yearEnd } } },
      {
        $group: {
          _id: null,
          totalIssued: { $sum: '$total' },
          totalPaid: { $sum: '$amountPaid' },
          totalPending: { $sum: { $cond: [{ $in: ['$status', ['sent', 'partial']] }, '$amountDue', 0] } },
          totalOverdue: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, '$amountDue', 0] } },
          count: { $sum: 1 },
        },
      },
    ]),

    // ── Facturación mensual (últimos 6 meses) ───────────────────────────────
    Invoice.aggregate([
      {
        $match: {
          type: 'invoice',
          issuedAt: { $gte: new Date(y, now.getMonth() - 5, 1), $lt: monthEnd },
          status: { $nin: ['cancelled', 'void', 'draft'] },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$issuedAt' }, month: { $month: '$issuedAt' } },
          issued: { $sum: '$total' },
          paid: { $sum: '$amountPaid' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // ── Expedientes ─────────────────────────────────────────────────────────
    LegalCase.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    LegalCase.find({ status: { $in: ['open', 'in_progress'] } })
      .sort({ openedAt: -1 })
      .limit(5)
      .populate('contactId', 'name fullName')
      .populate('lawyerId', 'name')
      .lean(),

    // ── Próximas citas (7 días) ─────────────────────────────────────────────
    Appointment.find({
      startAt: { $gte: now, $lte: weekAhead },
      status: { $in: ['pending', 'confirmed'] },
    })
      .sort({ startAt: 1 })
      .limit(5)
      .populate('contactId', 'name fullName')
      .populate('lawyerId', 'name')
      .lean(),

    // ── Horas del mes ───────────────────────────────────────────────────────
    TimeEntry.aggregate([
      { $match: { date: { $gte: monthStart, $lt: monthEnd } } },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$hours' },
          totalAmount: { $sum: '$amount' },
          billedAmount: { $sum: { $cond: ['$billed', '$amount', 0] } },
        },
      },
    ]),
  ])

  // Formatear facturación mensual
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const invoiceMonthlyFormatted = (invoiceMonthly as any[]).map(m => ({
    label: `${monthNames[m._id.month - 1]} ${m._id.year}`,
    issued: Math.round(m.issued * 100) / 100,
    paid: Math.round(m.paid * 100) / 100,
  }))

  // Formatear expedientes por estado
  const casesByStatus = Object.fromEntries((caseStats as any[]).map(s => [s._id, s.count]))

  return {
    // Leads (existentes)
    totals: { totalLeads, totalContacts, totalLawyers },
    leadsByStatus,
    leadsByArea,
    recentLeads,
    lawyersByLeads,
    leadsByScore,

    // Nuevos
    billing: {
      ...(invoiceStats as any[])[0] ?? { totalIssued: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0, count: 0 },
      monthly: invoiceMonthlyFormatted,
    },
    cases: {
      byStatus: casesByStatus,
      total: (caseStats as any[]).reduce((s, c) => s + c.count, 0),
      active: (casesByStatus.open || 0) + (casesByStatus.in_progress || 0),
      recent: recentCases,
    },
    appointments: upcomingAppointments,
    time: (timeStats as any[])[0] ?? { totalHours: 0, totalAmount: 0, billedAmount: 0 },
  }
})
