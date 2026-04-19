import type { Document, HydratedDocument, Model, Types } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IAppointment extends Document {
  title: string
  description?: string
  type: 'appointment' | 'task' | 'reminder' | 'hearing' | 'meeting'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'

  // Fechas
  startAt: Date
  endAt: Date
  allDay: boolean

  // Relaciones CRM
  contactId?: Types.ObjectId
  leadId?: Types.ObjectId
  lawyerId?: Types.ObjectId

  // Ubicación
  location?: string
  meetUrl?: string // Google Meet, Zoom, etc.

  // Notificaciones
  reminderMinutes: number // minutos antes del evento
  notified: boolean

  // Google Calendar
  googleEventId?: string
  googleCalendarId?: string
  syncedAt?: Date

  // n8n
  webhookSentAt?: Date
  webhookStatus?: 'pending' | 'sent' | 'failed'

  // Colores para FullCalendar
  color?: string

  // Auditoría
  createdBy: Types.ObjectId
  updatedBy?: Types.ObjectId
}

export interface IAppointmentModel extends Model<IAppointment> {}

type AppointmentDoc = HydratedDocument<IAppointment>

// ─── Schema ───────────────────────────────────────────────────────────────────

const AppointmentSchema = new Schema<IAppointment, IAppointmentModel>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true },
    type: {
      type: String,
      enum: ['appointment', 'task', 'reminder', 'hearing', 'meeting'],
      default: 'appointment',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },

    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    allDay: { type: Boolean, default: false },

    contactId: { type: Schema.Types.ObjectId, ref: 'Contact', index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', index: true },
    lawyerId: { type: Schema.Types.ObjectId, ref: 'Lawyer', index: true },

    location: { type: String, default: '' },
    meetUrl: { type: String, default: '' },

    reminderMinutes: { type: Number, default: 30 },
    notified: { type: Boolean, default: false },

    googleEventId: { type: String, default: null },
    googleCalendarId: { type: String, default: null },
    syncedAt: { type: Date },

    webhookSentAt: { type: Date },
    webhookStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },

    color: { type: String, default: null },

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

AppointmentSchema.index({ startAt: 1, endAt: 1 })
AppointmentSchema.index({ lawyerId: 1, startAt: 1 })
AppointmentSchema.index({ status: 1, startAt: 1 })
AppointmentSchema.index({ createdAt: -1 })

// ─── Virtuals ─────────────────────────────────────────────────────────────────

AppointmentSchema.virtual('isPast').get(function (this: AppointmentDoc) {
  return this.endAt < new Date()
})

AppointmentSchema.virtual('isUpcoming').get(function (this: AppointmentDoc) {
  return this.startAt > new Date() && this.status !== 'cancelled'
})

// ─── Export ───────────────────────────────────────────────────────────────────

const Appointment: IAppointmentModel
  = (mongoose.models.Appointment as IAppointmentModel)
  || mongoose.model<IAppointment, IAppointmentModel>('Appointment', AppointmentSchema)

export default Appointment
