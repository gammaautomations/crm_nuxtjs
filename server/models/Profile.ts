// models/Profile.ts

import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // 🔒 1 perfil por usuario
      index: true,
    },

    fullname: {
      type: String,
      trim: true,
      required: false,
      minlength: [5, 'El nombre debe tener al menos 5 caracteres'],
      maxlength: [100, 'El nombre no puede exceder los 100 caracteres'],
    },

    phone: {
      type: String,
      trim: true,
      required: false,
      match: [/^[0-9+ ]+$/, 'Número de teléfono inválido'],
      maxlength: [20, 'El teléfono no puede exceder los 20 caracteres'],
    },

    phone1: {
      type: String,
      trim: true,
      required: false,
      match: [/^[0-9+ ]+$/, 'Número de teléfono inválido'],
      maxlength: [20, 'El teléfono no puede exceder los 20 caracteres'],
    },

    whatsapp: {
      type: String,
      trim: true,
      required: false,
      match: [/^[0-9+ ]+$/, 'Número de WhatsApp inválido'],
      maxlength: [20, 'El WhatsApp no puede exceder los 20 caracteres'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

/**
 * 🔥 Obtener perfil por usuario (lazy creation)
 */
profileSchema.statics.getByUser = async function (userId: string) {
  let profile = await this.findOne({ userId })

  if (!profile)
    profile = await this.create({ userId })

  return profile
}

/**
 * 🔥 Actualizar perfil
 */
profileSchema.statics.updateByUser = async function (userId: string, data: any) {
  return await this.findOneAndUpdate(
    { userId },
    { $set: data },
    { new: true, runValidators: true },
  )
}

export const Profile = mongoose.model('Profile', profileSchema)
