import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, default: 'Viewer' },
  status: { type: Boolean, default: true },
  avatar: { type: String, default: 'sin-imagen.png' },
  emailVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  refreshTokens: [{ type: String }],
  lastLogin: { type: Date },
}, { timestamps: true })

UserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete ret.password
    delete ret.refreshTokens

    return ret
  },
})

export const User = mongoose.models.User || mongoose.model('User', UserSchema)
