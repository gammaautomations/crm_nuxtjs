// server/models/Lead.ts

import mongoose from 'mongoose'

const LeadSchema = new mongoose.Schema(
  {
    activity: [{
      action: { type: String, required: true },
      description: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now },
    }],

    // Datos del formulario
    fecha_envio: { type: Date, default: Date.now },
    nombre: { type: String, trim: true },
    telefono: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    contacto: { type: String, trim: true },
    area: { type: String, trim: true },
    motivo: { type: String, trim: true },
    urgencia: { type: String, trim: true },
    fecha_plazo: { type: String, trim: true },
    descripcion: { type: String, trim: true },
    documentos: { type: String, trim: true },

    // Datos de IA
    lead_score: { type: Number, default: 0 },
    nivel_urgencia: { type: String, trim: true },
    area_detectada: { type: String, trim: true },
    resumen_ejecutivo: { type: String, trim: true },
    accion_recomendada: { type: String, trim: true },
    tono_email: { type: String, trim: true },
    motivo_score_bajo: { type: String, trim: true },
    email_enviado: { type: String, trim: true },

    // Metadata
    assignedLawyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lawyer',
      default: null,
    },
    source: { type: String, default: 'landing' },
    status: {
      type: String,
      enum: ['nuevo', 'contactado', 'en_proceso', 'cerrado', 'descartado'],
      default: 'nuevo',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Lead = mongoose.models.Lead
  || mongoose.model('Lead', LeadSchema)
