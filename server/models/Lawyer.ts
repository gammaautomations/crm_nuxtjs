// server/models/Lawyer.ts

import mongoose from 'mongoose'

const LawyerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    specialties: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Specialty',
    }],
    assignedLeads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    }],
    active: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Lawyer = mongoose.models.Lawyer
  || mongoose.model('Lawyer', LawyerSchema)
