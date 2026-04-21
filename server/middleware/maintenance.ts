import { GeneralSetting } from '~/server/models/GeneralSetting'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  const url = event.path

  if (
    url.startsWith('/_nuxt/')
  || url.startsWith('/api/auth/')
  || url.includes('.')
  || url.includes('/google-event')
  ) return

  // Rutas públicas — no requieren auth
  if (
    url.startsWith('/_nuxt/')
    || url.startsWith('/api/auth/')
    || url.includes('.')
    || url.startsWith('/api/uploads/')
  ) return

  // Proteger toda la API con JWT
  if (url.startsWith('/api/'))
    requireAuth(event)

  // Modo mantenimiento (solo para rutas no-API)
  if (!url.startsWith('/api/')) {
    try {
      await connectDB()

      const settings = await (GeneralSetting as any).get()

      if (settings?.maintenanceMode) {
        const token = getCookie(event, 'auth_token')
        if (token)
          return

        setHeader(event, 'Content-Type', 'text/html')

        return `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${settings.maintenanceTitle || 'Sitio en mantenimiento'}</title>
            <style>
              body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8f7fa; }
              .box { text-align: center; padding: 3rem; background: white; border-radius: 1rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 500px; }
              h1 { color: #7367f0; margin-bottom: 1rem; }
              p { color: #6c757d; }
            </style>
          </head>
          <body>
            <div class="box">
              <h1>🔧 ${settings.maintenanceTitle || 'Sitio en mantenimiento'}</h1>
              <p>${settings.maintenanceMessage || 'Volveremos pronto.'}</p>
            </div>
          </body>
          </html>
        `
      }
    }
    catch {
      // silently fail
    }
  }
})
