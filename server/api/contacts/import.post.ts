import { Contact } from '~/server/models/Contact'
import { connectDB } from '~/server/utils/db'
import { createNotification } from '~/server/utils/notifications'

export default defineEventHandler(async event => {
  await connectDB()

  const body = await readBody(event)

  // n8n puede enviar un array o un solo contacto
  const contacts = Array.isArray(body) ? body : [body]

  const results = {
    created: 0,
    updated: 0,
    errors: 0,
    details: [] as any[],
  }

  for (const contact of contacts) {
    try {
      const {
        userId,
        firstName,
        lastName,
        fullName,
        email,
        email2,
        phone,
        phone2,
        whatsapp,
        company,
        jobTitle,
        website,
        address,
        city,
        state,
        country,
        zipCode,
        linkedin,
        twitter,
        facebook,
        instagram,
        tags,
        notes,
        avatar,
        externalId,
        source,
        contactData,
      } = contact

      // Buscar por externalId o email para evitar duplicados
      const filter = externalId
        ? { externalId }
        : email
          ? { email }
          : null

      if (!filter) {
        results.errors++
        results.details.push({ error: 'Contacto sin email ni externalId', contact })
        continue
      }

      const update = {
        firstName,
        lastName,
        fullName: fullName || `${firstName || ''} ${lastName || ''}`.trim(),
        email,
        email2,
        phone,
        phone2,
        whatsapp,
        company,
        jobTitle,
        website,
        address,
        city,
        state,
        country,
        zipCode,
        linkedin,
        twitter,
        facebook,
        instagram,
        tags,
        notes,
        avatar,
        externalId,
        contactData,
        owner: userId,
        source: source || 'webhook',
        importedAt: new Date(),
      }

      const existing = await Contact.findOne(filter)

      if (existing) {
        await Contact.findByIdAndUpdate(existing._id, { $set: update })
        results.updated++
      }
      else {
        await Contact.create(update)
        results.created++
      }
    }
    catch (error: any) {
      results.errors++
      results.details.push({ error: error.message, contact })
    }
  }

  if (results.created > 0 || results.updated > 0) {
    await createNotification({
      userId: contacts[0]?.userId || '',
      title: 'Importación completada',
      message: `${results.created} contactos creados, ${results.updated} actualizados.`,
      type: 'success',
      category: 'import',
      link: '/contacts',
    })
  }

  return {
    message: `Importación completada: ${results.created} creados, ${results.updated} actualizados, ${results.errors} errores`,
    results,
  }
})
