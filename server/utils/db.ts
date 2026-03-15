import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
  if (isConnected)
    return

  const config = useRuntimeConfig()

  const uri = config.mongoUri
    || `mongodb://${encodeURIComponent(config.mongoUserName)}:${encodeURIComponent(config.mongoPassword)}@${config.mongoHost}:${config.mongoPort}/${config.mongoDataBase}?authSource=admin`

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 30000,
    })
    isConnected = true
    console.log('✅ MongoDB conectado')
  }
  catch (error) {
    console.error('❌ Error conectando MongoDB:', error)
    throw error
  }
}
