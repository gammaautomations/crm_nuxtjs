import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()

  const decoded = requireAuth(event)

  const id = getRouterParam(event, 'id')
  const { text } = await readBody(event)

  if (!text?.trim())
    throw createError({ statusCode: 400, message: 'El comentario no puede estar vacío' })

  const lead = await Lead.findByIdAndUpdate(
    id,
    {
      $push: {
        comments: {
          text: text.trim(),
          user: decoded.id,
          createdAt: new Date(),
        },
      },
    },
    { returnDocument: 'after' },
  ).populate('comments.user', 'username avatar')

  if (!lead)
    throw createError({ statusCode: 404, message: 'Lead no encontrado' })

  return lead
})
