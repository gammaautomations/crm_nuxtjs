import { Contact } from '~/server/models/Contact'
import { GeneralSetting } from '~/server/models/GeneralSetting'
import { Notification } from '~/server/models/Notification'
import { connectDB } from '~/server/utils/db'

export default defineNitroPlugin(async () => {
  console.log('🚀 Iniciando plugin...')
  try {
    await connectDB()
    console.log('✅ DB conectada')
    await (GeneralSetting as any).get()
    console.log('✅ GeneralSetting ok')
    await Contact.init()
    console.log('✅ Contact ok')
    await Notification.init()
    console.log('✅ Notification ok')
    console.log('✅ Modelos inicializados')
  }
  catch (error) {
    console.error('❌ Error inicializando modelos:', error)
  }
})
