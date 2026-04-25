import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import LegalCase from '~/server/models/LegalCase'
import Template from '~/server/models/Template'
import { requireAuth } from '~/server/utils/auth.middleware'

export default defineEventHandler(async event => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const tpl = await Template.findById(id).lean()
  if (!tpl)
    throw createError({ statusCode: 404, message: 'Plantilla no encontrada' })

  // Obtener datos del expediente si se pasa caseId
  let caseContext = ''
  if (body.caseId) {
    const caseDoc = await LegalCase.findById(body.caseId)
      .populate('contactId', 'name fullName email phone')
      .populate('lawyerId', 'name email')
      .lean()

    if (caseDoc) {
      caseContext = `
Datos del expediente:
- Número: ${(caseDoc as any).number}
- Título: ${(caseDoc as any).title}
- Tipo: ${(caseDoc as any).type}
- Cliente: ${(caseDoc as any).contactId?.fullName || (caseDoc as any).contactId?.name}
- Email cliente: ${(caseDoc as any).contactId?.email || ''}
- Abogado: ${(caseDoc as any).lawyerId?.name || ''}
- Juzgado: ${(caseDoc as any).court || ''}
- Nº Procedimiento: ${(caseDoc as any).procedureNumber || ''}
- Parte contraria: ${(caseDoc as any).opposingParty || ''}
- Descripción: ${(caseDoc as any).description || ''}
      `.trim()
    }
  }

  const prompt = `Eres un asistente jurídico especializado en derecho español. 
Genera el contenido de un documento de tipo "${(tpl as any).type}" basándote en la siguiente plantilla y los datos del caso.

Plantilla base:
${(tpl as any).content.replace(/<[^>]+>/g, '')}

${caseContext ? `\n${caseContext}` : ''}

${body.instructions ? `\nInstrucciones adicionales: ${body.instructions}` : ''}

Genera el documento completo en español, manteniendo el formato profesional y jurídico. 
Devuelve solo el texto del documento, sin explicaciones adicionales.`

  // Llamar a la API de Anthropic
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok)
    throw createError({ statusCode: 500, message: 'Error al generar el documento con IA' })

  const data = await response.json()
  const generatedContent = data.content?.[0]?.text || ''

  return { content: generatedContent }
})
