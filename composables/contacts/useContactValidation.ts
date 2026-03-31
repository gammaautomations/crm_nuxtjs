import { useVuelidate } from '@vuelidate/core'
import { email, helpers, required, url } from '@vuelidate/validators'
import type { ContactDto } from '~/types/contact.types'

export const useContactValidation = (form: Ref<ContactDto>) => {
  const state = computed(() => form.value)

  const phoneRegex = helpers.regex(/^[0-9+ ]+$/)

  const rules = {
    firstName: {
      required: helpers.withMessage('El nombre es requerido', required),
    },
    email: {
      email: helpers.withMessage('Email inválido', email),
    },
    email2: {
      email: helpers.withMessage('Email secundario inválido', email),
    },
    phone: {
      phoneFormat: helpers.withMessage('Teléfono inválido', phoneRegex),
    },
    phone2: {
      phoneFormat: helpers.withMessage('Teléfono alternativo inválido', phoneRegex),
    },
    whatsapp: {
      phoneFormat: helpers.withMessage('WhatsApp inválido', phoneRegex),
    },
    website: {
      url: helpers.withMessage('URL inválida', url),
    },
    linkedin: {
      url: helpers.withMessage('URL de LinkedIn inválida', url),
    },
  }

  const v$ = useVuelidate(rules, state)

  const isFormValid = async (): Promise<boolean> => {
    return await v$.value.$validate()
  }

  return {
    v$,
    isFormValid,
  }
}
