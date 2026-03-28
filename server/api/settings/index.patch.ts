import { validateUpdateSettingsDto } from '~/server/dtos/settings.dto'
import { GeneralSetting } from '~/server/models/GeneralSetting'
import { requireRole } from '~/server/utils/auth.middleware' // 👈 agregar
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  requireRole(event, ['Admin'])

  const body = await readBody(event)
  const dto = validateUpdateSettingsDto(body)

  const settings = await GeneralSetting.findOneAndUpdate(
    {},
    { $set: dto },
    { returnDocument: 'after', runValidators: true },
  )

  return { message: 'Configuración actualizada correctamente', settings }
})
