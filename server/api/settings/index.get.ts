import { GeneralSetting } from '~/server/models/GeneralSetting'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  return await (GeneralSetting as any).get()
})
