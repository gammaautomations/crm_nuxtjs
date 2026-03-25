// useChangePasswordValidation.ts

import { useVuelidate } from '@vuelidate/core'
import { helpers, minLength, required, sameAs } from '@vuelidate/validators'

export const useChangePasswordValidation = (form: Ref<{
  currentPassword: string
  newPassword: string
  confirmPassword: string
}>) => {
  const newPasswordRef = computed(() => form.value.newPassword)

  const rules = {
    currentPassword: {
      required: helpers.withMessage('La contraseña actual es requerida', required),
    },
    newPassword: {
      required: helpers.withMessage('La nueva contraseña es requerida', required),
      minLength: helpers.withMessage('Mínimo 8 caracteres', minLength(8)),
      strong: helpers.withMessage(
        'Debe tener mayúscula, minúscula, número y carácter especial',
        helpers.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/),
      ),
    },
    confirmPassword: {
      required: helpers.withMessage('Confirma tu contraseña', required),
      sameAs: helpers.withMessage('Las contraseñas no coinciden', sameAs(newPasswordRef)),
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
