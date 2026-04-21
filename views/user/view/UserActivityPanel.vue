<script setup lang="ts">
// views/user/view/UserActivityPanel.vue

const { data, pending } = await useFetch<any[]>('/api/user/activity')
const activities = computed(() => data.value || [])

const typeConfig: Record<string, { color: string; icon: string }> = {
  info: { color: 'info', icon: 'tabler-info-circle' },
  success: { color: 'success', icon: 'tabler-circle-check' },
  warning: { color: 'warning', icon: 'tabler-alert-triangle' },
  error: { color: 'error', icon: 'tabler-circle-x' },
}

const categoryLabel: Record<string, string> = {
  contact: 'Contacto',
  import: 'Importación',
  system: 'Sistema',
  user: 'Usuario',
}

const formatDateTime = (d: string) =>
  d ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d)) : '—'
</script>

<template>
  <VCard>
    <VCardTitle class="pa-6 pb-2">
      Actividad reciente
    </VCardTitle>
    <VCardText class="pa-0">
      <div
        v-if="pending"
        class="d-flex justify-center pa-8"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
      </div>

      <div
        v-else-if="!activities.length"
        class="text-center text-disabled pa-8"
      >
        <VIcon
          icon="tabler-history"
          size="48"
          class="mb-3"
        />
        <p class="mb-0">
          No hay actividad reciente
        </p>
      </div>

      <VTimeline
        v-else
        side="end"
        align="start"
        truncate-line="both"
        class="px-6 py-4"
        density="compact"
      >
        <VTimelineItem
          v-for="activity in activities"
          :key="activity._id"
          :dot-color="typeConfig[activity.type]?.color || 'primary'"
          size="x-small"
        >
          <div class="d-flex align-center justify-space-between mb-1">
            <div class="d-flex align-center gap-2">
              <span class="font-weight-semibold">{{ activity.title }}</span>
              <VChip
                size="x-small"
                :color="typeConfig[activity.type]?.color"
                label
              >
                {{ categoryLabel[activity.category] || activity.category }}
              </VChip>
            </div>
            <span class="text-body-2 text-disabled">{{ formatDateTime(activity.createdAt) }}</span>
          </div>
          <p class="text-body-2 text-disabled mb-0">
            {{ activity.message }}
          </p>
          <VBtn
            v-if="activity.link"
            variant="text"
            size="x-small"
            color="primary"
            :to="activity.link"
            class="mt-1 pa-0"
          >
            Ver detalle →
          </VBtn>
        </VTimelineItem>
      </VTimeline>
    </VCardText>
  </VCard>
</template>
