// GeneralSetting.ts

import mongoose from 'mongoose'

const generalSettingSchema = new mongoose.Schema(
  {
    // APP INFO
    appName: {
      type: String,
      default: 'Gamma Automations CRM',
      trim: true,
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },
    siteDescription: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder los 500 caracteres'],
    },
    keywords: {
      type: String,
      default: null,
      trim: true,
      maxlength: [255, 'Las keywords no pueden exceder los 255 caracteres'],
    },

    // APPEARANCE
    logo: { type: String, default: null },
    favicon: { type: String, default: null },
    appVersion: { type: String, default: '1.0.1' },
    appUrl: { type: String, default: null },

    // CONTACT INFO
    contactAddress: {
      type: String,
      default: null,
      trim: true,
      maxlength: [255, 'La dirección no puede exceder los 255 caracteres'],
    },
    contactEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Email inválido'],
    },
    contactPhone: {
      type: String,
      default: null,
      trim: true,
      maxlength: [20, 'El teléfono no puede exceder los 20 caracteres'],
    },
    contactWhatsapp: {
      type: String,
      default: null,
      trim: true,
      maxlength: [20, 'El WhatsApp no puede exceder los 20 caracteres'],
    },
    businessHours: { type: String, default: null },

    // LEGAL
    copyright: {
      type: String,
      default: `© ${new Date().getFullYear()} Gamma Automations. All rights reserved.`,
      trim: true,
      maxlength: [255, 'El copyright no puede exceder los 255 caracteres'],
    },
    terms: { type: String, default: null, trim: true },
    privacy: { type: String, default: null, trim: true },

    // SEO & ANALYTICS
    googleAnalyticsId: { type: String, default: null, trim: true },
    metaPixelId: { type: String, default: null, trim: true },

    // LOCALIZACIÓN
    language: {
      type: String,
      default: 'es',
      enum: ['es', 'en', 'fr', 'de'],
    },
    timezone: { type: String, default: 'Atlantic/Canary' },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    },

    // MANTENIMIENTO
    maintenanceMode: { type: Boolean, default: false },
    maintenanceTitle: {
      type: String,
      default: 'Sitio en mantenimiento',
      trim: true,
      maxlength: [100, 'El título no puede exceder los 100 caracteres'],
    },
    maintenanceMessage: {
      type: String,
      default: 'Volveremos pronto. Estamos realizando tareas de mantenimiento.',
      trim: true,
      maxlength: [255, 'El mensaje no puede exceder los 255 caracteres'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// Si no existe configuración la crea automáticamente
generalSettingSchema.statics.get = async function () {
  let settings = await this.findOne()
  if (!settings)
    settings = await this.create({})

  return settings
}

export const GeneralSetting = mongoose.models.GeneralSetting
  || mongoose.model('GeneralSetting', generalSettingSchema)
