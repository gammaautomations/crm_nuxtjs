export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const {
    form,
    loading,
    errorMsg,
    resetForm,
    withLoading,
  } = useForm({
    email: '',
    password: '',
    remember: false,
  })

  const { v$, isFormValid } = useLoginValidation(form)

  const login = async () => {
    const valid = await isFormValid()
    if (!valid)
      return

    await withLoading(async () => {
      await authStore.login(form.value.email, form.value.password)
      router.push('/')
    })
  }

  const logout = async () => {
    await authStore.logout()
  }

  return {
    form,
    loading,
    errorMsg,
    v$,
    login,
    logout,
    resetForm,
  }
}
