// useSettingsStore.ts

import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const appName = ref('Garriga CRM')

  const fetchSettings = async () => {
    try {
      const data = await $fetch('/api/settings') as any
      if (data?.appName)
        appName.value = data.appName
    }
    catch {
      // silently fail
    }
  }

  return { appName, fetchSettings }
})
