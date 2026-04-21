// server/utils/local-storage.ts
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import path from 'node:path'

const UPLOAD_DIR = '/app/uploads'

export const ensureUploadDir = async (subDir: string): Promise<string> => {
  const dir = path.join(UPLOAD_DIR, subDir)

  await fs.mkdir(dir, { recursive: true })

  return dir
}

export const saveFile = async (
  buffer: Buffer,
  filename: string,
  subDir: string = 'documents',
): Promise<{ id: string; url: string; filename: string }> => {
  const dir = await ensureUploadDir(subDir)
  const ext = path.extname(filename)
  const id = randomUUID()
  const savedFilename = `${id}${ext}`
  const filePath = path.join(dir, savedFilename)

  await fs.writeFile(filePath, buffer)

  return {
    id,
    url: `/uploads/${subDir}/${savedFilename}`,
    filename: savedFilename,
  }
}

export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const relativePath = fileUrl.replace('/uploads/', '')
    const filePath = path.join(UPLOAD_DIR, relativePath)

    await fs.unlink(filePath)
  }
  catch {
    console.warn(`No se pudo eliminar el archivo: ${fileUrl}`)
  }
}
