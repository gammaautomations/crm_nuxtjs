// server/models/Contact.ts

import mongoose from 'mongoose'

const ContactSchema = new mongoose.Schema(
  {
    // IDENTIFICACIÓN
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, index: true, sparse: true },
    email2: { type: String, trim: true, lowercase: true },

    // TELÉFONOS
    phone: { type: String, trim: true },
    phone2: { type: String, trim: true },
    whatsapp: { type: String, trim: true },

    // EMPRESA
    company: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    website: { type: String, trim: true },

    // DIRECCIÓN
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    zipCode: { type: String, trim: true },

    // REDES SOCIALES
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },

    // CRM
    status: {
      type: String,
      enum: ['lead', 'prospect', 'client', 'inactive'],
      default: 'lead',
    },
    source: {
      type: String,
      enum: ['manual', 'gmail', 'csv', 'webhook', 'other'],
      default: 'manual',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    tags: [{ type: String, trim: true }],
    notes: { type: String, trim: true },
    avatar: { type: String, default: null },

    // PROPIETARIO
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // METADATA
    lastContactedAt: { type: Date, default: null },
    importedAt: { type: Date, default: null },
    externalId: { type: String, default: null }, // ID en Gmail, CSV, etc.
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Contact = mongoose.models.Contact
  || mongoose.model('Contact', ContactSchema)
