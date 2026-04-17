// models/User.ts

import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: [3, 'El username debe tener al menos 3 caracteres'],
      maxlength: [30, 'El username no puede exceder los 30 caracteres'],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/, 'Email inválido'],
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔒 importante
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
        'Debe tener mayúscula, minúscula, número y carácter especial',
      ],
    },

    role: {
      role: {
        type: String,
        enum: ['Admin', 'Abogado', 'Recepcionista', 'Superuser'],
        default: 'Recepcionista',
      },
    },

    status: {
      type: Boolean,
      default: true,
    },

    avatar: {
      type: String,
      default: 'sin-imagen.png',
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    refreshTokens: {
      type: [String],
      select: false, // 🔒 no exponer nunca
    },

    lastLogin: {
      type: Date,
    },

    sessions: [{
      ip: { type: String },
      userAgent: { type: String },
      browser: { type: String },
      os: { type: String },
      date: { type: Date, default: Date.now },
    }],

    verificationCode: {
      type: String,
      select: false,
    },

    verificationCodeExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

/**
 * 🔥 Transformación segura al devolver JSON
 */
UserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password
    delete ret.refreshTokens

    return ret
  },
})

/**
 * 🔥 Método para comparar password (login)
 */
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  const bcrypt = await import('bcrypt')

  return bcrypt.compare(candidatePassword, this.password)
}

/**
 * 🔥 Método para incrementar intentos de login
 */
UserSchema.methods.incrementLoginAttempts = async function () {
  this.loginAttempts += 1
  await this.save()
}

/**
 * 🔥 Resetear intentos al loguear correctamente
 */
UserSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0
  await this.save()
}

export const User
  = mongoose.models.User || mongoose.model('User', UserSchema)
