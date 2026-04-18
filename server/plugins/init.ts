import { Contact } from '~/server/models/Contact'
import { GeneralSetting } from '~/server/models/GeneralSetting'
import Invoice from '~/server/models/Invoice'
import { Lawyer } from '~/server/models/Lawyer'
import { Lead } from '~/server/models/Lead'
import { Notification } from '~/server/models/Notification'
import { Specialty } from '~/server/models/Specialty'
import { User } from '~/server/models/User'
import { connectDB } from '~/server/utils/db'

export default defineNitroPlugin(async () => {
  console.log('🚀 Iniciando plugin...')
  try {
    await connectDB()
    console.log('✅ DB conectada')
    await User.init()
    console.log('✅ User ok')
    await (GeneralSetting as any).get()
    console.log('✅ GeneralSetting ok')
    await Contact.init()
    console.log('✅ Contact ok')
    await Notification.init()
    console.log('✅ Notification ok')
    await Lead.init()
    console.log('✅ Lead ok')
    await Specialty.init()
    await Lawyer.init()
    console.log('✅ Specialty y Lawyer ok')
    await Invoice.init()
    console.log('✅ Invoice ok')
    console.log('✅ Modelos inicializados')
  }
  catch (error) {
    console.error('❌ Error inicializando modelos:', error)
  }
})
