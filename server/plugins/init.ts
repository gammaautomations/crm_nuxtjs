import { GeneralSetting } from '~/server/models/GeneralSetting'
import { connectDB } from '~/server/utils/db'

export default defineNitroPlugin(async () => {
  await connectDB()

  // Inicializar configuración general si no existe
  await (GeneralSetting as any).get()

  console.log('✅ Modelos inicializados')
})
