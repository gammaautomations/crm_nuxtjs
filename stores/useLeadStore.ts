// useLeadStore.ts

import { defineStore } from 'pinia'

export const useLeadStore = defineStore('lead', () => {
  const unassignedCount = ref(0)

  const fetchUnassigned = async () => {
    try {
      const data = await $fetch('/api/leads', {
        query: { status: 'nuevo', limit: 1 },
      }) as any

      unassignedCount.value = data?.pagination?.total || 0
    }
    catch {
      unassignedCount.value = 0
    }
  }

  return { unassignedCount, fetchUnassigned }
})
