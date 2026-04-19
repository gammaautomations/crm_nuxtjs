import type { Document, HydratedDocument, Model, Types } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ─── Constantes ───────────────────────────────────────────────────────────────

export const CASE_TYPES = [
  'civil',
  'penal',
  'laboral',
  'mercantil',
  'administrativo',
  'otro',
] as const

export const CASE_STATUSES = [
  'open', // Abierto
  'in_progress', // En curso
  'on_hold', // En espera
  'closed', // Cerrado
  'archived', // Archivado
] as const

export type CaseType = (typeof CASE_TYPES)[number]
export type CaseStatus = (typeof CASE_STATUSES)[number]

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const MilestoneSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    completedAt: { type: Date },
    completed: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true, timestamps: true },
)

const NoteSchema = new Schema(
  {
    content: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: true, timestamps: true },
)

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IMilestone {
  _id: Types.ObjectId
  title: string
  description: string
  dueDate?: Date
  completedAt?: Date
  completed: boolean
  createdBy?: Types.ObjectId
}

export interface INote {
  _id: Types.ObjectId
  content: string
  createdBy: Types.ObjectId
  createdAt: Date
}

export interface ICase extends Document {

  // ── Identificación ──────────────────────────────────────────────────────────
  number: string // "EXP-2026-0001"
  title: string
  description?: string

  // ── Clasificación ───────────────────────────────────────────────────────────
  type: CaseType
  status: CaseStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'

  // ── Juzgado / tribunal ──────────────────────────────────────────────────────
  court?: string // Juzgado
  courtNumber?: string // Número de juzgado
  procedureNumber?: string // Número de procedimiento
  opposingParty?: string // Parte contraria

  // ── Fechas ──────────────────────────────────────────────────────────────────
  openedAt: Date
  closedAt?: Date
  deadline?: Date // Fecha límite importante

  // ── Relaciones CRM ──────────────────────────────────────────────────────────
  contactId: Types.ObjectId // Cliente principal
  lawyerId?: Types.ObjectId // Abogado responsable
  leadId?: Types.ObjectId // Lead relacionado

  // ── Honorarios ──────────────────────────────────────────────────────────────
  feeType?: 'fixed' | 'hourly' | 'contingency' | 'mixed'
  feeAmount?: number
  hourlyRate?: number

  // ── Hitos y notas ───────────────────────────────────────────────────────────
  milestones: IMilestone[]
  notes: INote[]

  // ── Auditoría ───────────────────────────────────────────────────────────────
  createdBy: Types.ObjectId
  updatedBy?: Types.ObjectId
}

export interface ICaseModel extends Model<ICase> {
  nextNumber(): Promise<string>
}

type CaseDoc = HydratedDocument<ICase>

// ─── Schema ───────────────────────────────────────────────────────────────────

const CaseSchema = new Schema<ICase, ICaseModel>(
  {
    number: { type: String, unique: true, required: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, default: '', trim: true },

    type: {
      type: String,
      enum: CASE_TYPES,
      default: 'civil',
    },
    status: {
      type: String,
      enum: CASE_STATUSES,
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    court: { type: String, default: '' },
    courtNumber: { type: String, default: '' },
    procedureNumber: { type: String, default: '' },
    opposingParty: { type: String, default: '' },

    openedAt: { type: Date, default: Date.now, index: true },
    closedAt: { type: Date },
    deadline: { type: Date, index: true },

    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true, index: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },

    feeType: { type: String, enum: ['fixed', 'hourly', 'contingency', 'mixed'] },
    feeAmount: { type: Number },
    hourlyRate: { type: Number },

    milestones: { type: [MilestoneSchema], default: [] },
    notes: { type: [NoteSchema], default: [] },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// ─── Índices ──────────────────────────────────────────────────────────────────

CaseSchema.index({ status: 1, openedAt: -1 })
CaseSchema.index({ contactId: 1, status: 1 })
CaseSchema.index({ lawyerId: 1, status: 1 })
CaseSchema.index({ createdAt: -1 })

// ─── Virtuals ─────────────────────────────────────────────────────────────────

CaseSchema.virtual('isOverdue').get(function (this: CaseDoc) {
  if (!this.deadline)
    return false

  return !['closed', 'archived'].includes(this.status) && this.deadline < new Date()
})

CaseSchema.virtual('milestonesCompleted').get(function (this: CaseDoc) {
  return this.milestones.filter(m => m.completed).length
})

CaseSchema.virtual('milestonesTotal').get(function (this: CaseDoc) {
  return this.milestones.length
})

// ─── Estáticos ────────────────────────────────────────────────────────────────

CaseSchema.statics.nextNumber = async function (): Promise<string> {
  const year = new Date().getFullYear()
  const regex = new RegExp(`^EXP-${year}-\\d+$`)
  const last = await this.findOne({ number: { $regex: regex } }, { number: 1 }, { sort: { number: -1 } }).lean()
  let seq = 1
  if (last?.number)
    seq = Number.parseInt((last.number as string).split('-').pop()!, 10) + 1

  return `EXP-${year}-${String(seq).padStart(4, '0')}`
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

CaseSchema.pre('save', async function (this: CaseDoc) {
  if (this.isModified('status') && this.status === 'closed' && !this.closedAt)
    this.closedAt = new Date()
})

// ─── Export ───────────────────────────────────────────────────────────────────

const LegalCase: ICaseModel
  = (mongoose.models.LegalCase as ICaseModel)
  || mongoose.model<ICase, ICaseModel>('LegalCase', CaseSchema)

export default LegalCase
