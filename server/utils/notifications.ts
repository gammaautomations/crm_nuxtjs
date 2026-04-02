// server/utils/notifications.ts

import type { CreateNotificationDto } from '~/server/dtos/notification.dto'
import { Notification } from '~/server/models/Notification'

export const createNotification = async (data: CreateNotificationDto) => {
  await Notification.create({
    userId: data.userId,
    title: data.title,
    message: data.message,
    type: data.type || 'info',
    category: data.category || 'system',
    link: data.link || null,
  })
}
