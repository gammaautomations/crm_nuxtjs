import { Contact } from '~/server/models/Contact'
import { GeneralSetting } from '~/server/models/GeneralSetting'
import { Notification } from '~/server/models/Notification'
import { connectDB } from '~/server/utils/db'

export default defineNitroPlugin(async () => {
  try {
    await connectDB()
    await (GeneralSetting as any).get()
    await Contact.init()
    await Notification.init()
    console.log('✅ Modelos inicializados')
  }
  catch (error) {
    console.error('❌ Error inicializando modelos:', error)

    // No relanzar el error para que el servidor no se caiga
  }
})
