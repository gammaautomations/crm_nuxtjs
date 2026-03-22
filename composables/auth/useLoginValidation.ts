import { useVuelidate } from '@vuelidate/core'
import { email, helpers, minLength, required } from '@vuelidate/validators'

export const useLoginValidation = (form: Ref<{ email: string; password: string }>) => {
  const rules = {
    email: {
      required: helpers.withMessage('El correo electrónico es requerido', required),
      email: helpers.withMessage('Introduce un correo electrónico válido', email),
    },
    password: {
      required: helpers.withMessage('La contraseña es requerida', required),
      minLength: helpers.withMessage('La contraseña debe tener al menos 6 caracteres', minLength(6)),
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
