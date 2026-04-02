// Notification.ts

import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error'],
      default: 'info',
    },
    category: {
      type: String,
      enum: ['contact', 'import', 'system', 'user'],
      default: 'system',
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Notification = mongoose.models.Notification
  || mongoose.model('Notification', NotificationSchema)
