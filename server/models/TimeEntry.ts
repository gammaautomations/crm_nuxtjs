import type { Document, HydratedDocument, Model, Types } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export interface ITimeEntry extends Document {

  // Descripción del trabajo
  description: string
  date: Date

  // Tiempo
  hours: number // horas trabajadas (ej: 1.5 = 1h 30min)
  hourlyRate: number // tarifa/hora aplicada

  // Calculado
  amount: number // hours * hourlyRate

  // Relaciones
  caseId: Types.ObjectId // expediente
  lawyerId?: Types.ObjectId // abogado que trabajó
  invoiceId?: Types.ObjectId // factura donde se incluyó (null = pendiente de facturar)
  invoiceLineIndex?: number // índice de la línea en la factura

  // Estado
  billed: boolean // si ya fue incluido en una factura

  // Auditoría
  createdBy: Types.ObjectId
}

export interface ITimeEntryModel extends Model<ITimeEntry> {}

type TimeEntryDoc = HydratedDocument<ITimeEntry>

const TimeEntrySchema = new Schema<ITimeEntry, ITimeEntryModel>(
  {
    description: { type: String, required: true, trim: true, maxlength: 500 },
    date: { type: Date, required: true, default: Date.now, index: true },

    hours: { type: Number, required: true, min: 0.1 },
    hourlyRate: { type: Number, required: true, min: 0 },
    amount: { type: Number, default: 0 },

    caseId: { type: Schema.Types.ObjectId, ref: 'LegalCase', required: true, index: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', index: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    invoiceLineIndex: { type: Number },

    billed: { type: Boolean, default: false, index: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

TimeEntrySchema.index({ caseId: 1, billed: 1 })
TimeEntrySchema.index({ lawyerId: 1, date: -1 })
TimeEntrySchema.index({ createdAt: -1 })

// Calcular amount antes de guardar
TimeEntrySchema.pre('save', async function (this: TimeEntryDoc) {
  this.amount = Math.round(this.hours * this.hourlyRate * 100) / 100
})

const TimeEntry: ITimeEntryModel
  = (mongoose.models.TimeEntry as ITimeEntryModel)
  || mongoose.model<ITimeEntry, ITimeEntryModel>('TimeEntry', TimeEntrySchema)

export default TimeEntry
