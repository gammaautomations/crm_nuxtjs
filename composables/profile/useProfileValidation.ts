// UseProfileValidation.ts

import { useVuelidate } from '@vuelidate/core'
import { helpers, maxLength, minLength, required } from '@vuelidate/validators'

export const useProfileValidation = (form: Ref<{
  fullname: string
  phone: string
  phone1: string
  whatsapp: string
}>) => {
  const phoneRegex = helpers.regex(/^[0-9+ ]+$/)

  const rules = {
    fullname: {
      required: helpers.withMessage('El nombre completo es requerido', required),
      minLength: helpers.withMessage('Mínimo 5 caracteres', minLength(5)),
      maxLength: helpers.withMessage('Máximo 100 caracteres', maxLength(100)),
    },
    phone: {
      phoneFormat: helpers.withMessage('Número de teléfono inválido', phoneRegex),
      maxLength: helpers.withMessage('Máximo 20 caracteres', maxLength(20)),
    },
    phone1: {
      phoneFormat: helpers.withMessage('Número de teléfono inválido', phoneRegex),
      maxLength: helpers.withMessage('Máximo 20 caracteres', maxLength(20)),
    },
    whatsapp: {
      phoneFormat: helpers.withMessage('Número de WhatsApp inválido', phoneRegex),
      maxLength: helpers.withMessage('Máximo 20 caracteres', maxLength(20)),
    },
  }

  const v$ = useVuelidate(rules, form)

  const isFormValid = async (): Promise<boolean> => {
    return await v$.value.$validate()
  }

  return {
    v$,
    isFormValid,
  }
}
