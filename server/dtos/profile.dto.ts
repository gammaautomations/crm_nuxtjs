// profile.dto.ts

export interface UpdateProfileDto {
  fullname?: string
  phone?: string
  phone1?: string
  whatsapp?: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const validateUpdateProfileDto = (body: any): UpdateProfileDto => {
  const { fullname, phone, phone1, whatsapp } = body

  if (fullname && fullname.length < 5)
    throw createError({ statusCode: 400, message: 'El nombre debe tener al menos 5 caracteres' })

  if (fullname && fullname.length > 100)
    throw createError({ statusCode: 400, message: 'El nombre no puede exceder los 100 caracteres' })

  const phoneRegex = /^[0-9+ ]+$/

  if (phone && !phoneRegex.test(phone))
    throw createError({ statusCode: 400, message: 'Número de teléfono inválido' })

  if (phone1 && !phoneRegex.test(phone1))
    throw createError({ statusCode: 400, message: 'Número de teléfono alternativo inválido' })

  if (whatsapp && !phoneRegex.test(whatsapp))
    throw createError({ statusCode: 400, message: 'Número de WhatsApp inválido' })

  return { fullname, phone, phone1, whatsapp }
}

export const validateChangePasswordDto = (body: any): ChangePasswordDto => {
  const { currentPassword, newPassword, confirmPassword } = body

  if (!currentPassword || !newPassword || !confirmPassword)
    throw createError({ statusCode: 400, message: 'Todos los campos son requeridos' })

  if (newPassword !== confirmPassword)
    throw createError({ statusCode: 400, message: 'Las contraseñas no coinciden' })

  if (newPassword.length < 8)
    throw createError({ statusCode: 400, message: 'Mínimo 8 caracteres' })

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(newPassword))
    throw createError({ statusCode: 400, message: 'Debe tener mayúscula, minúscula, número y carácter especial' })

  return { currentPassword, newPassword, confirmPassword }
}
