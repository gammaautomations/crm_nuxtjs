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

export const sendVerificationEmail = async (email: string, username: string, code: string) => {
  const config = useRuntimeConfig()
  const transporter = createTransporter()

  await transporter.sendMail({
    from: `"${config.public.appName || 'Tu SaaS'}" <${config.mailFrom}>`,
    to: email,
    subject: 'Verifica tu correo electrónico',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${username}! 👋</h2>
        <p>Gracias por registrarte. Usa el siguiente código para verificar tu email:</p>
        <div style="
          background: #f4f4f4;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        ">
          <h1 style="
            font-size: 48px;
            letter-spacing: 8px;
            color: #7367F0;
            margin: 0;
          ">${code}</h1>
        </div>
        <p>Este código expira en <strong>15 minutos</strong>.</p>
        <p>Si no creaste esta cuenta puedes ignorar este email.</p>
      </div>
    `,
  })
}
