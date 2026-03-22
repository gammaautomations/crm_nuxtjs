export const useForm = <T extends object>(initialValues: T) => {
  const form = ref<T>({ ...initialValues })
  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  const resetForm = () => {
    form.value = { ...initialValues }
    errorMsg.value = ''
    successMsg.value = ''
  }

  const withLoading = async (fn: () => Promise<void>) => {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      await fn()
    }
    catch (error: any) {
      const { handleError } = useApi()

      errorMsg.value = handleError(error)
    }
    finally {
      loading.value = false
    }
  }

  return {
    form,
    loading,
    errorMsg,
    successMsg,
    resetForm,
    withLoading,
  }
}
