// composables/auth/useRegisterValidation.ts

import { useVuelidate } from '@vuelidate/core'
import { email, helpers, maxLength, minLength, required, sameAs } from '@vuelidate/validators'
import type { RegisterDto } from '~/types/auth.types'

export const useRegisterValidation = (form: Ref<RegisterDto>) => {
  const passwordRef = computed(() => form.value.password)

  const rules = {
    username: {
      required: helpers.withMessage('El username es requerido', required),
      minLength: helpers.withMessage('Mínimo 3 caracteres', minLength(3)),
      maxLength: helpers.withMessage('Máximo 30 caracteres', maxLength(30)),
    },
    email: {
      required: helpers.withMessage('El email es requerido', required),
      email: helpers.withMessage('Email inválido', email),
    },
    password: {
      required: helpers.withMessage('La contraseña es requerida', required),
      minLength: helpers.withMessage('Mínimo 8 caracteres', minLength(8)),
      strong: helpers.withMessage(
        'Debe tener mayúscula, minúscula, número y carácter especial',
        helpers.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/),
      ),
    },
    confirmPassword: {
      required: helpers.withMessage('Confirma tu contraseña', required),
      sameAs: helpers.withMessage('Las contraseñas no coinciden', sameAs(passwordRef)),
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
