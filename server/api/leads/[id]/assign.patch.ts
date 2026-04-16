import { Lawyer } from '~/server/models/Lawyer'
import { Lead } from '~/server/models/Lead'
import { requireAuth } from '~/server/utils/auth.middleware'
import { connectDB } from '~/server/utils/db'

export default defineEventHandler(async event => {
  await connectDB()
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  const { lawyerId } = await readBody(event)

  const lead = await Lead.findByIdAndUpdate(
    id,
    {
      assignedLawyer: lawyerId,
      status: 'contactado',
      $push: {
        activity: {
          action: 'asignacion',
          description: 'Lead asignado a abogado',
          user: (event.context.user as any)?._id,
          date: new Date(),
        },
      },
    },
    { returnDocument: 'after' },
  ).populate('assignedLawyer', 'name email')

  if (!lead)
    throw createError({ statusCode: 404, message: 'Lead no encontrado' })

  // Añadir lead al abogado
  if (lawyerId) {
    await Lawyer.findByIdAndUpdate(lawyerId, {
      $addToSet: { assignedLeads: id },
    })
  }

  return { message: 'Lead asignado correctamente', lead }
})
