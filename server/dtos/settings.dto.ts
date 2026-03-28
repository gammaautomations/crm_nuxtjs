export interface UpdateSettingsDto {

  // APP INFO
  appName?: string
  siteDescription?: string
  keywords?: string

  // APPEARANCE
  logo?: string
  favicon?: string
  appVersion?: string
  appUrl?: string

  // CONTACT INFO
  contactAddress?: string
  contactEmail?: string
  contactPhone?: string
  contactWhatsapp?: string
  businessHours?: string

  // LEGAL
  copyright?: string
  terms?: string
  privacy?: string

  // SEO & ANALYTICS
  googleAnalyticsId?: string
  metaPixelId?: string

  // LOCALIZACIÓN
  language?: string
  timezone?: string
  dateFormat?: string

  // MANTENIMIENTO
  maintenanceMode?: boolean
  maintenanceTitle?: string
  maintenanceMessage?: string
}

export const validateUpdateSettingsDto = (body: any): UpdateSettingsDto => {
  const dto: UpdateSettingsDto = {}

  if (body.appName !== undefined) {
    if (body.appName.length > 100)
      throw createError({ statusCode: 400, message: 'El nombre no puede exceder los 100 caracteres' })
    dto.appName = body.appName
  }

  if (body.siteDescription !== undefined) {
    if (body.siteDescription.length > 500)
      throw createError({ statusCode: 400, message: 'La descripción no puede exceder los 500 caracteres' })
    dto.siteDescription = body.siteDescription
  }

  if (body.contactEmail !== undefined) {
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(body.contactEmail))
      throw createError({ statusCode: 400, message: 'Email de contacto inválido' })
    dto.contactEmail = body.contactEmail
  }

  if (body.language !== undefined) {
    if (!['es', 'en', 'fr', 'de'].includes(body.language))
      throw createError({ statusCode: 400, message: 'Idioma no válido' })
    dto.language = body.language
  }

  if (body.dateFormat !== undefined) {
    if (!['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(body.dateFormat))
      throw createError({ statusCode: 400, message: 'Formato de fecha no válido' })
    dto.dateFormat = body.dateFormat
  }

  if (body.maintenanceMode !== undefined)
    dto.maintenanceMode = Boolean(body.maintenanceMode)

  // Resto de campos sin validación especial
  const simpleFields = [
    'keywords',
    'logo',
    'favicon',
    'appVersion',
    'appUrl',
    'contactAddress',
    'contactPhone',
    'contactWhatsapp',
    'businessHours',
    'copyright',
    'terms',
    'privacy',
    'googleAnalyticsId',
    'metaPixelId',
    'timezone',
    'maintenanceTitle',
    'maintenanceMessage',
  ]

  for (const field of simpleFields) {
    if (body[field] !== undefined)
      (dto as any)[field] = body[field]
  }

  return dto
}
