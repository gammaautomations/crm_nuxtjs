import bcrypt from 'bcrypt'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  try {
    await connectDB()

    const body = await readBody(event)
    const { username, email, password, confirmPassword } = body

    if (password !== confirmPassword)
      throw createError({ statusCode: 400, message: 'Las contraseñas no coinciden' })

    const encryptedPassword = bcrypt.hashSync(password, 10)

    const newUser = {
      username,
      email,
      password: encryptedPassword,
    }

    const user = await User.create(newUser)

    return {
      status: 'ok',
    }
  }
  catch (error) {
    console.log('ERROR - REGISTRANDO USUARIO')
    console.log(error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error interno del servidor',
    })
  }
})
