import nodemailer from 'nodemailer'

export const createTransporter = () => {
  const config = useRuntimeConfig()

  return nodemailer.createTransport({
    host: config.mailHost,
    port: Number(config.mailPort),
    auth: {
      user: config.mailUser,
      pass: config.mailPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

// Template base
const baseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #7367F0; padding: 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body { padding: 32px; }
    .footer { background: #f4f4f4; padding: 16px; text-align: center; color: #999; font-size: 12px; }
    .btn { display: inline-block; background: #7367F0; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
    .badge { display: inline-block; background: #f0efff; color: #7367F0; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      Este email fue enviado automáticamente. Por favor no respondas a este mensaje.
    </div>
  </div>
</body>
</html>
`

// Email de bienvenida
export const sendWelcomeEmail = async (email: string, username: string) => {
  const config = useRuntimeConfig()
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"${config.public.appName || 'CRM'}" <${config.mailFrom}>`,
    to: email,
    subject: '¡Bienvenido al CRM! 🎉',
    html: baseTemplate(`
      <h2>Hola ${username}! 👋</h2>
      <p>Tu cuenta ha sido creada correctamente. Ya puedes acceder a la plataforma y empezar a gestionar tus contactos.</p>
      <a href="${config.public.appUrl}" class="btn">Acceder al CRM</a>
    `, '¡Bienvenido!'),
  })
}

// Email de importación completada
export const sendImportCompletedEmail = async (
  email: string,
  username: string,
  created: number,
  updated: number,
) => {
  const config = useRuntimeConfig()
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"${config.public.appName || 'CRM'}" <${config.mailFrom}>`,
    to: email,
    subject: 'Importación de contactos completada ✅',
    html: baseTemplate(`
      <h2>Hola ${username}!</h2>
      <p>La importación de contactos desde Gmail ha finalizado correctamente.</p>
      <p>
        <span class="badge">✅ ${created} creados</span>&nbsp;
        <span class="badge">🔄 ${updated} actualizados</span>
      </p>
      <a href="${config.public.appUrl}/contacts" class="btn">Ver contactos</a>
    `, 'Importación completada'),
  })
}

// Email de verificación (ya lo tienes)
export const sendVerificationEmail = async (email: string, username: string, code: string) => {
  const config = useRuntimeConfig()
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"${config.public.appName || 'CRM'}" <${config.mailFrom}>`,
    to: email,
    subject: 'Verifica tu correo electrónico',
    html: baseTemplate(`
      <h2>Hola ${username}! 👋</h2>
      <p>Gracias por registrarte. Usa el siguiente código para verificar tu email:</p>
      <div style="background:#f4f4f4; border-radius:8px; padding:20px; text-align:center; margin:20px 0;">
        <h1 style="font-size:48px; letter-spacing:8px; color:#7367F0; margin:0;">${code}</h1>
      </div>
      <p>Este código expira en <strong>15 minutos</strong>.</p>
      <p>Si no creaste esta cuenta puedes ignorar este email.</p>
    `, 'Verifica tu email'),
  })
}

// Email genérico para notificaciones automáticas
export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) => {
  const config = useRuntimeConfig()
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"CRM Garriga" <${config.mailFrom}>`,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject,
    html,
  })
}

// Template para notificaciones
export const emailTemplate = (title: string, body: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #7367F0; padding: 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body { padding: 32px; }
    .alert { border-radius: 8px; padding: 16px; margin: 16px 0; }
    .alert.error   { background: #fff0f0; border-left: 4px solid #FF4C51; }
    .alert.warning { background: #fff8e6; border-left: 4px solid #FFB400; }
    .alert.info    { background: #e8f4ff; border-left: 4px solid #16B1FF; }
    .alert strong  { display: block; margin-bottom: 4px; }
    .btn { display: inline-block; background: #7367F0; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 8px; }
    .footer { background: #f4f4f4; padding: 16px; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>⚖️ CRM Garriga</h1></div>
    <div class="body">
      <h2 style="color:#333;margin:0 0 24px;">${title}</h2>
      ${body}
    </div>
    <div class="footer">Email automático. No responder.</div>
  </div>
</body>
</html>
`
