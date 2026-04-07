import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default defineNitroPlugin(nitro => {
  nitro.hooks.hook('request', event => {
    const url = event.path

    if (
      url.startsWith('/api/')
      || url.startsWith('/_nuxt/')
      || url.startsWith('/uploads/')
      || url.includes('.')
    )
      return

    try {
      const indexPath = join(process.cwd(), '.output/public/index.html')
      const html = readFileSync(indexPath, 'utf-8')

      setHeader(event, 'Content-Type', 'text/html')
      event.node.res.end(html)
    }
    catch {
      // silently fail
    }
  })
})
