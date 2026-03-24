export interface RegisterDto {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface LoginDto {
  email: string
  password: string
  remember: boolean
}

export interface AuthUser {
  id: string
  username: string
  email: string
  role: string
  avatar: string
}

export interface AuthResponse {
  user: AuthUser
}

export interface RegisterResponse {
  message: string
  user: {
    id: string
    username: string
    email: string
    role: string
  }
}
