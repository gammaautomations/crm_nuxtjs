<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { data: stats, pending } = await useFetch('/api/lawyers/stats')
const lawyerStats = computed(() => (stats.value as any[]) || [])

const statusColor: Record<string, string> = {
  nuevo: 'info',
  contactado: 'warning',
  en_proceso: 'primary',
  cerrado: 'success',
  descartado: 'error',
}

const scoreColor = (score: number) => {
  if (score >= 8)
    return 'error'
  if (score >= 6)
    return 'warning'
  if (score >= 4)
    return 'info'

  return 'secondary'
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Estadísticas por Abogado
      </h4>
      <VBtn
        variant="outlined"
        prepend-icon="tabler-briefcase"
        to="/admin/lawyers"
      >
        Ver abogados
      </VBtn>
    </div>

    <div
      v-if="pending"
      class="d-flex justify-center pa-10"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>

    <VRow v-else>
      <VCol
        v-for="lawyer in lawyerStats"
        :key="lawyer._id"
        cols="12"
        md="6"
      >
        <VCard>
          <VCardText>
            <!-- Header abogado -->
            <div class="d-flex align-center gap-4 mb-6">
              <VAvatar
                color="primary"
                variant="tonal"
                size="56"
              >
                <span class="text-h5">{{ lawyer.name.charAt(0) }}</span>
              </VAvatar>
              <div class="flex-grow-1">
                <p class="font-weight-semibold text-h6 mb-0">
                  {{ lawyer.name }}
                </p>
                <p class="text-body-2 text-disabled mb-0">
                  {{ lawyer.email }}
                </p>
              </div>
              <div class="text-center">
                <p
                  class="text-h4 font-weight-bold mb-0"
                  :class="`text-${scoreColor(lawyer.avgScore)}`"
                >
                  {{ lawyer.avgScore }}
                </p>
                <p class="text-caption text-disabled">
                  Score medio
                </p>
              </div>
            </div>

            <!-- Total leads -->
            <div
              class="d-flex align-center justify-space-between mb-4 pa-4 rounded"
              style="background: rgba(var(--v-theme-primary), 0.05);"
            >
              <span class="font-weight-medium">Total leads asignados</span>
              <VChip
                color="primary"
                size="small"
              >
                {{ lawyer.totalLeads }}
              </VChip>
            </div>

            <!-- Por estado -->
            <div
              v-if="Object.keys(lawyer.byStatus).length"
              class="mb-4"
            >
              <p class="text-body-2 text-disabled mb-2">
                Por estado
              </p>
              <div class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="(count, status) in lawyer.byStatus"
                  :key="status"
                  :color="statusColor[status as string]"
                  size="small"
                >
                  {{ status }}: {{ count }}
                </VChip>
              </div>
            </div>

            <!-- Por área -->
            <div v-if="Object.keys(lawyer.byArea).length">
              <p class="text-body-2 text-disabled mb-2">
                Por área
              </p>
              <div class="d-flex flex-wrap gap-2">
                <VChip
                  v-for="(count, area) in lawyer.byArea"
                  :key="area"
                  variant="outlined"
                  size="small"
                >
                  {{ area }}: {{ count }}
                </VChip>
              </div>
            </div>

            <p
              v-if="!lawyer.totalLeads"
              class="text-center text-disabled mt-4"
            >
              Sin leads asignados
            </p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        v-if="!lawyerStats.length"
        cols="12"
      >
        <VCard>
          <VCardText class="text-center text-disabled pa-10">
            No hay abogados registrados
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
