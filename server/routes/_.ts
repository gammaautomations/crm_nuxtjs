import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(event => {
  const url = event.path

  if (url.startsWith('/api/') || url.startsWith('/_nuxt/') || url.includes('.'))
    return

  const indexPath = join(process.cwd(), '.output/public/index.html')
  const html = readFileSync(indexPath, 'utf-8')

  setHeader(event, 'Content-Type', 'text/html')

  return html
})
