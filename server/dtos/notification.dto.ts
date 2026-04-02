// server/dtos/notification.dto.ts

export interface CreateNotificationDto {
  userId: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  category?: 'contact' | 'import' | 'system' | 'user'
  link?: string
}

export const validateCreateNotificationDto = (data: any): CreateNotificationDto => {
  const { userId, title, message, type, category, link } = data

  if (!userId)
    throw createError({ statusCode: 400, message: 'userId es requerido' })

  if (!title)
    throw createError({ statusCode: 400, message: 'El título es requerido' })

  if (!message)
    throw createError({ statusCode: 400, message: 'El mensaje es requerido' })

  if (type && !['info', 'success', 'warning', 'error'].includes(type))
    throw createError({ statusCode: 400, message: 'Tipo de notificación inválido' })

  if (category && !['contact', 'import', 'system', 'user'].includes(category))
    throw createError({ statusCode: 400, message: 'Categoría de notificación inválida' })

  return { userId, title, message, type, category, link }
}
