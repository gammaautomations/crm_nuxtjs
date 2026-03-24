// composables/auth/useRegister.ts

import type { RegisterDto, RegisterResponse } from '~/types/auth.types'

export const useRegister = () => {
  const router = useRouter()

  const {
    form,
    loading,
    errorMsg,
    successMsg,
    resetForm,
    withLoading,
  } = useForm<RegisterDto>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const { v$, isFormValid } = useRegisterValidation(form)

  const register = async () => {
    const valid = await isFormValid()
    if (!valid)
      return

    await withLoading(async () => {
      const { post } = useApi()

      await post<RegisterResponse>('/api/auth/register', {
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
      })

      successMsg.value = 'Usuario registrado correctamente'

      setTimeout(() => {
        router.push('/login')
      }, 1500)
    })
  }

  return {
    form,
    loading,
    errorMsg,
    successMsg,
    v$,
    register,
    resetForm,
  }
}
