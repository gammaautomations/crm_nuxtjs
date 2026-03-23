import { OAuth2Client } from 'google-auth-library'

export default defineEventHandler(async event => {
  const config = useRuntimeConfig()

  const client = new OAuth2Client(
    config.googleClientId,
    config.googleClientSecret,
    `${config.public.appUrl}/api/auth/google/callback`,
  )

  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile'],
    prompt: 'consent',
  })

  return sendRedirect(event, url)
})
