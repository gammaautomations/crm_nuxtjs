// dtos/auth.dto.ts

export interface RegisterDto {
  username: string
  email: string
  password: string
}

export interface LoginDto {
  email: string
  password: string
}

export const validateRegisterDto = (body: any): RegisterDto => {
  const { username, email, password } = body

  if (!username || !email || !password)
    throw createError({ statusCode: 400, message: 'Todos los campos son requeridos' })

  if (username.length < 3)
    throw createError({ statusCode: 400, message: 'El username debe tener al menos 3 caracteres' })

  if (username.length > 30)
    throw createError({ statusCode: 400, message: 'El username no puede exceder los 30 caracteres' })

  if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email))
    throw createError({ statusCode: 400, message: 'Email inválido' })

  if (password.length < 8)
    throw createError({ statusCode: 400, message: 'La contraseña debe tener al menos 8 caracteres' })

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/.test(password))
    throw createError({ statusCode: 400, message: 'Debe tener mayúscula, minúscula, número y carácter especial' })

  return { username, email, password }
}
