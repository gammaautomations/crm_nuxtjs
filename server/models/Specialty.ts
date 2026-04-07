// server/models/Specialty.ts

import mongoose from 'mongoose'

const SpecialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    color: {
      type: String,
      default: '#7367F0',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Specialty = mongoose.models.Specialty
  || mongoose.model('Specialty', SpecialtySchema)
