// server/utils/google-drive.ts
import { Readable } from 'node:stream'
import { google } from 'googleapis'

export const getDriveClient = () => {
  const config = useRuntimeConfig()

  console.log('Drive email:', config.googleServiceAccountEmail)
  console.log('Drive key length:', config.googleServiceAccountPrivateKey?.length)
  console.log('Drive folder:', config.googleDriveFolderId)

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: config.googleServiceAccountEmail,
      private_key: (config.googleServiceAccountPrivateKey as string)
        ?.replace(/\\n/g, '\n')
        ?.replace(/\\\\n/g, '\n')
        ?.trim(),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return google.drive({ version: 'v3', auth })
}

export const uploadFileToDrive = async (
  buffer: Buffer,
  filename: string,
  mimeType: string,
  folderId: string,
): Promise<{ id: string; webViewLink: string; webContentLink: string }> => {
  const drive = getDriveClient()

  const stream = new Readable()

  stream.push(buffer)
  stream.push(null)

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink, webContentLink',
  })

  // Hacer el archivo accesible con el link
  await drive.permissions.create({
    fileId: res.data.id!,
    requestBody: { role: 'reader', type: 'anyone' },
  })

  return {
    id: res.data.id!,
    webViewLink: res.data.webViewLink!,
    webContentLink: res.data.webContentLink!,
  }
}

export const deleteFileFromDrive = async (fileId: string): Promise<void> => {
  const drive = getDriveClient()

  await drive.files.delete({ fileId })
}
