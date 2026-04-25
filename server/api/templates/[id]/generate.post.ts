import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import LegalCase from '~/server/models/LegalCase'
import Template from '~/server/models/Template'
import { requireAuth } from '~/server/utils/auth.middleware'

// Reemplazar variables en el contenido
const replaceVariables = (content: string, vars: Record<string, string>): string => {
  let result = content
  for (const [key, value] of Object.entries(vars))
    result = result.replaceAll(`{{${key}}}`, value || '')

  return result
}

// Convertir HTML básico a párrafos docx
const htmlToDocxParagraphs = (html: string): Paragraph[] => {
  // Eliminar tags HTML y dividir por líneas
  const text = html
    .replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, '\n##$1##\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

  return text.split('\n').filter(l => l.trim()).map(line => {
    if (line.startsWith('##') && line.endsWith('##')) {
      return new Paragraph({
        text: line.replace(/##/g, '').trim(),
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
      })
    }

    return new Paragraph({
      children: [new TextRun({ text: line.trim(), size: 24 })],
      spacing: { after: 120 },
    })
  })
}

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const tpl = await Template.findById(id).lean()
  if (!tpl)
    throw createError({ statusCode: 404, message: 'Plantilla no encontrada' })

  // Si se pasa un caseId, obtener datos del expediente
  let caseVars: Record<string, string> = {}
  if (body.caseId) {
    const caseDoc = await LegalCase.findById(body.caseId)
      .populate('contactId', 'name fullName email phone')
      .populate('lawyerId', 'name email')
      .lean()

    if (caseDoc) {
      caseVars = {
        expediente_numero: (caseDoc as any).number || '',
        expediente_titulo: (caseDoc as any).title || '',
        expediente_tipo: (caseDoc as any).type || '',
        expediente_juzgado: (caseDoc as any).court || '',
        expediente_procedimiento: (caseDoc as any).procedureNumber || '',
        expediente_contrario: (caseDoc as any).opposingParty || '',
        cliente_nombre: (caseDoc as any).contactId?.fullName || (caseDoc as any).contactId?.name || '',
        cliente_email: (caseDoc as any).contactId?.email || '',
        cliente_telefono: (caseDoc as any).contactId?.phone || '',
        abogado_nombre: (caseDoc as any).lawyerId?.name || '',
        abogado_email: (caseDoc as any).lawyerId?.email || '',
        fecha_hoy: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      }
    }
  }

  // Combinar variables del caso con las variables manuales del body
  const allVars = { ...caseVars, ...(body.variables || {}) }

  // Reemplazar variables en el contenido
  const filledContent = replaceVariables((tpl as any).content, allVars)

  // Generar Word
  const paragraphs = htmlToDocxParagraphs(filledContent)

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  const filename = `${(tpl as any).name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`

  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)

  return buffer
})
