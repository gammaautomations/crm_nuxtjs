import type { Document, HydratedDocument, Model, Types } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ─── Tipos IGIC ───────────────────────────────────────────────────────────────
//
//  0%   → Exento / operaciones no sujetas
//  3%   → Superreducido (alimentos básicos, medicamentos, libros…)
//  7%   → Reducido (servicios jurídicos, transporte, hostelería…)  ← habitual en despachos
//  9.5% → General (resto de bienes y servicios)
//  15%  → Incrementado (vehículos, joyería, perfumería…)
//  20%  → Especial tabaco
//
export const IGIC_RATES = [0, 3, 7, 9.5, 15, 20] as const
export type IgicRate = (typeof IGIC_RATES)[number]

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const AddressSchema = new Schema(
  {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    zip: { type: String, default: '' },
    island: { type: String, default: '' }, // Gran Canaria, Tenerife, Lanzarote…
    province: { type: String, default: '' }, // Las Palmas | Santa Cruz de Tenerife
    country: { type: String, default: 'ES' },
  },
  { _id: false },
)

const PartySchema = new Schema(
  {
    name: { type: String, required: true },
    nif: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: AddressSchema, default: () => ({}) },
    cabildoReg: { type: String, default: '' },
  },
  { _id: false },
)

const LineSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true },
    igicRate: { type: Number, enum: IGIC_RATES, default: 7 },
    discount: { type: Number, default: 0, min: 0, max: 100 },

    // Calculados — guardados para inmutabilidad contable
    subtotal: { type: Number },
    igicAmount: { type: Number },
    total: { type: Number },
  },
  { _id: false },
)

const PaymentSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    method: {
      type: String,
      enum: ['transfer', 'card', 'cash', 'check', 'other'],
      default: 'transfer',
    },
    date: { type: Date, required: true, default: Date.now },
    reference: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: true, timestamps: false },
)

// ─── Interfaces TypeScript ────────────────────────────────────────────────────

export interface IInvoiceLine {
  description: string
  quantity: number
  unitPrice: number
  igicRate: IgicRate
  discount: number
  subtotal: number
  igicAmount: number
  total: number
}

export interface IPayment {
  _id: Types.ObjectId
  amount: number
  method: 'transfer' | 'card' | 'cash' | 'check' | 'other'
  date: Date
  reference: string
  notes: string
}

export interface IIgicBreakdown {
  rate: number
  base: number
  amount: number
}

export interface IInvoice extends Document {
  number: string
  series: string
  type: 'invoice' | 'credit_note' | 'proforma' | 'receipt'
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' | 'void'

  contactId?: Types.ObjectId
  leadId?: Types.ObjectId
  lawyerId?: Types.ObjectId

  issuer: {
    name: string; nif: string; email: string; phone: string; cabildoReg: string
    address: { street: string; city: string; zip: string; island: string; province: string; country: string }
  }
  client: {
    name: string; nif: string; email: string; phone: string; cabildoReg: string
    address: { street: string; city: string; zip: string; island: string; province: string; country: string }
  }

  lines: IInvoiceLine[]
  subtotal: number
  igicBreakdown: IIgicBreakdown[]
  totalIgic: number
  total: number

  payments: IPayment[]
  amountPaid: number
  amountDue: number

  issuedAt: Date
  dueDate?: Date
  paidAt?: Date
  sentAt?: Date

  pdfUrl?: string
  pdfGeneratedAt?: Date

  notes?: string
  internalNotes?: string

  createdBy: Types.ObjectId
  updatedBy?: Types.ObjectId
  cancelledAt?: Date
  cancelReason?: string

  // Métodos de instancia
  recalculate(): void
  registerPayment(payment: Omit<IPayment, '_id'>): void
  canEdit(): boolean
  canCancel(): boolean
}

export interface IInvoiceModel extends Model<IInvoice> {
  nextNumber(series?: string): Promise<string>
}

// ─── Tipo hidratado ───────────────────────────────────────────────────────────
//
// Mongoose pasa HydratedDocument<IInvoice> como `this` en métodos, virtuals y
// hooks — no IInvoice directamente. Usar este tipo elimina el error
// @typescript-eslint/no-invalid-this sin necesidad de deshabilitar la regla.
//
type InvoiceDoc = HydratedDocument<IInvoice>

// ─── Schema principal ─────────────────────────────────────────────────────────

const InvoiceSchema = new Schema<IInvoice, IInvoiceModel>(
  {
    number: { type: String, unique: true, required: true, uppercase: true, trim: true },
    series: { type: String, default: 'F', uppercase: true, trim: true },
    type: {
      type: String,
      enum: ['invoice', 'credit_note', 'proforma', 'receipt'],
      default: 'invoice',
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'void'],
      default: 'draft',
    },

    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', index: true },

    issuer: { type: PartySchema, required: true },
    client: { type: PartySchema, required: true },

    lines: { type: [LineSchema], default: [] },

    subtotal: { type: Number, default: 0 },
    igicBreakdown: { type: [{ rate: Number, base: Number, amount: Number }], default: [] },
    totalIgic: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    payments: { type: [PaymentSchema], default: [] },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },

    issuedAt: { type: Date, default: Date.now, index: true },
    dueDate: { type: Date, index: true },
    paidAt: { type: Date },
    sentAt: { type: Date },

    pdfUrl: { type: String },
    pdfGeneratedAt: { type: Date },

    notes: { type: String, default: '' },
    internalNotes: { type: String, default: '' },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// ─── Índices compuestos ───────────────────────────────────────────────────────

InvoiceSchema.index({ series: 1, number: 1 })
InvoiceSchema.index({ status: 1, dueDate: 1 })
InvoiceSchema.index({ 'client.nif': 1, 'issuedAt': -1 })
InvoiceSchema.index({ createdAt: -1 })

// ─── Virtuals ─────────────────────────────────────────────────────────────────

InvoiceSchema.virtual('isOverdue').get(function (this: InvoiceDoc) {
  if (!this.dueDate)
    return false

  return (
    ['sent', 'partial'].includes(this.status)
    && this.dueDate < new Date()
    && this.amountDue > 0
  )
})

InvoiceSchema.virtual('isPaid').get(function (this: InvoiceDoc) {
  return this.amountDue <= 0
})

// ─── Métodos de instancia ─────────────────────────────────────────────────────

InvoiceSchema.methods.recalculate = function (this: InvoiceDoc): void {
  const round2 = (n: number) => Math.round(n * 100) / 100

  // 1. Recalcular cada línea
  for (const line of this.lines) {
    const base = round2(line.quantity * line.unitPrice * (1 - line.discount / 100))
    const igic = round2(base * (line.igicRate / 100))

    line.subtotal = base
    line.igicAmount = igic
    line.total = round2(base + igic)
  }

  // 2. Base imponible total
  this.subtotal = round2(this.lines.reduce((s, l) => s + l.subtotal, 0))

  // 3. Desglose IGIC agrupado por tipo (para PDF y modelo 420 trimestral)
  const igicMap = new Map<number, { base: number; amount: number }>()
  for (const line of this.lines) {
    const prev = igicMap.get(line.igicRate) ?? { base: 0, amount: 0 }

    igicMap.set(line.igicRate, {
      base: round2(prev.base + line.subtotal),
      amount: round2(prev.amount + line.igicAmount),
    })
  }
  this.igicBreakdown = Array.from(igicMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rate, v]) => ({ rate, base: v.base, amount: v.amount }))

  this.totalIgic = round2(this.igicBreakdown.reduce((s, v) => s + v.amount, 0))

  // 4. Total final
  this.total = round2(this.subtotal + this.totalIgic)

  // 5. Saldos de pago
  this.amountPaid = round2(this.payments.reduce((s, p) => s + p.amount, 0))
  this.amountDue = round2(Math.max(0, this.total - this.amountPaid))
}

InvoiceSchema.methods.registerPayment = function (
  this: InvoiceDoc,
  payment: Omit<IPayment, '_id'>,
): void {
  this.payments.push(payment as IPayment)
  this.amountPaid = Math.round((this.amountPaid + payment.amount) * 100) / 100
  this.amountDue = Math.max(0, Math.round((this.total - this.amountPaid) * 100) / 100)

  if (this.amountDue <= 0) {
    this.status = 'paid'
    this.paidAt = new Date()
  }
  else if (this.amountPaid > 0) {
    this.status = 'partial'
  }
}

InvoiceSchema.methods.canEdit = function (this: InvoiceDoc): boolean {
  return this.status === 'draft'
}

InvoiceSchema.methods.canCancel = function (this: InvoiceDoc): boolean {
  return ['draft', 'sent', 'partial'].includes(this.status)
}

// ─── Métodos estáticos ────────────────────────────────────────────────────────

InvoiceSchema.statics.nextNumber = async function (series = 'F'): Promise<string> {
  const year = new Date().getFullYear()
  const regex = new RegExp(`^${series}-${year}-\\d+$`)

  const last = await this.findOne(
    { number: { $regex: regex } },
    { number: 1 },
    { sort: { number: -1 } },
  ).lean()

  let seq = 1
  if (last?.number) {
    const parts = (last.number as string).split('-')

    seq = Number.parseInt(parts[parts.length - 1], 10) + 1
  }

  return `${series}-${year}-${String(seq).padStart(4, '0')}`
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

InvoiceSchema.pre('save', async function (this: InvoiceDoc) {
  this.recalculate()

  if (
    this.dueDate
    && this.dueDate < new Date()
    && ['sent', 'partial'].includes(this.status)
  )
    this.status = 'overdue'
})

InvoiceSchema.pre('save', async function (this: InvoiceDoc) {
  if (!this.isNew && !this.isModified('status') && this.status !== 'draft') {
    const allowed = [
      'status',
      'payments',
      'amountPaid',
      'amountDue',
      'paidAt',
      'pdfUrl',
      'pdfGeneratedAt',
      'internalNotes',
      'updatedBy',
      'cancelledAt',
      'cancelReason',
      'sentAt',
    ]

    const forbidden = this.modifiedPaths().filter(
      p => !allowed.some(a => p.startsWith(a)),
    )

    if (forbidden.length > 0) {
      throw new Error(
        `No se puede editar una factura en estado "${this.status}". `
        + `Campos bloqueados: ${forbidden.join(', ')}. `
        + 'Emite una factura rectificativa si necesitas corregirla.',
      )
    }
  }
})

// ─── Export ───────────────────────────────────────────────────────────────────

const Invoice: IInvoiceModel
  = (mongoose.models.Invoice as IInvoiceModel)
  || mongoose.model<IInvoice, IInvoiceModel>('Invoice', InvoiceSchema)

export default Invoice
