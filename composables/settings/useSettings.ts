// useSettings.ts

export const useSettings = () => {
  const { data, refresh } = useFetch('/api/settings', {
    lazy: true,
  })

  const form = ref({
    appName: '',
    siteDescription: '',
    keywords: '',
    appVersion: '',
    appUrl: '',
    logo: '',
    favicon: '',
    contactAddress: '',
    contactEmail: '',
    contactPhone: '',
    contactWhatsapp: '',
    businessHours: '',
    copyright: '',
    terms: '',
    privacy: '',
    googleAnalyticsId: '',
    metaPixelId: '',
    language: 'es',
    timezone: 'Atlantic/Canary',
    dateFormat: 'DD/MM/YYYY',
    maintenanceMode: false,
    maintenanceTitle: '',
    maintenanceMessage: '',

    // FACTURACIÓN
    companyName: '',
    companyNif: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    companyCity: '',
    companyZip: '',
    companyIsland: '',
    companyProvince: '',
    cabildoReg: '',
  })

  // Cargar datos cuando lleguen
  watch(data, val => {
    if (val) {
      Object.keys(form.value).forEach(key => {
        if ((val as any)[key] !== undefined)
          (form.value as any)[key] = (val as any)[key]
      })
    }
  }, { immediate: true })

  const loading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  const saveSettings = async (fields: Partial<typeof form.value>) => {
    loading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      await $fetch('/api/settings', {
        method: 'PATCH',
        body: fields,
      })

      successMsg.value = 'Configuración guardada correctamente'
      await refresh()
    }
    catch (error: any) {
      errorMsg.value = error?.data?.message || 'Error al guardar la configuración'
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
    saveSettings,
    refresh,
  }
}
