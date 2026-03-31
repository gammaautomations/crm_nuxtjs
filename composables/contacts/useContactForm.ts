import type { ContactDto } from '~/types/contact.types'

export const useContactForm = (initialValues?: Partial<ContactDto>) => {
  const router = useRouter()

  const form = ref<ContactDto>({
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    email2: '',
    phone: '',
    phone2: '',
    whatsapp: '',
    company: '',
    jobTitle: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    status: 'lead',
    tags: [],
    notes: '',
    ...initialValues,
  })

  const { v$, isFormValid } = useContactValidation(form as Ref<ContactDto>)

  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  const createContact = async () => {
    const valid = await isFormValid()
    if (!valid)
      return

    loading.value = true
    errorMsg.value = ''

    try {
      if (!form.value.fullName)
        form.value.fullName = `${form.value.firstName} ${form.value.lastName}`.trim()

      await $fetch('/api/contacts', {
        method: 'POST',
        body: form.value,
      })

      successMsg.value = 'Contacto creado correctamente'
      setTimeout(() => router.push('/contacts'), 1500)
    }
    catch (error: any) {
      errorMsg.value = error?.data?.message || 'Error al crear el contacto'
    }
    finally {
      loading.value = false
    }
  }

  const updateContact = async (id: string) => {
    const valid = await isFormValid()
    if (!valid)
      return

    loading.value = true
    errorMsg.value = ''

    try {
      if (!form.value.fullName)
        form.value.fullName = `${form.value.firstName} ${form.value.lastName}`.trim()

      await $fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        body: form.value,
      })

      successMsg.value = 'Contacto actualizado correctamente'
    }
    catch (error: any) {
      errorMsg.value = error?.data?.message || 'Error al actualizar el contacto'
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
    v$,
    createContact,
    updateContact,
  }
}
