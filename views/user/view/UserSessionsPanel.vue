<script setup lang="ts">
const { data: userData } = await useFetch('/api/users/me/sessions')
const sessions = computed(() => (userData.value as any)?.sessions ?? [])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <VCard>
    <VCardText>
      <p class="text-overline text-uppercase mb-4">
        Sesiones recientes
      </p>
      <div v-if="sessions.length">
        <div
          v-for="(session, index) in [...sessions].reverse()"
          :key="index"
          class="d-flex align-center gap-4 mb-4 pa-4 rounded"
          style=" border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));background: rgba(var(--v-theme-surface-variant), 0.1);"
        >
          <VAvatar
            color="primary"
            variant="tonal"
            size="44"
          >
            <VIcon
              :icon="session.os?.toLowerCase().includes('windows') ? 'tabler-brand-windows' : session.os?.toLowerCase().includes('mac') ? 'tabler-brand-apple' : 'tabler-device-mobile'"
              size="22"
            />
          </VAvatar>
          <div class="flex-grow-1">
            <p class="font-weight-medium mb-0">
              {{ session.browser || 'Navegador desconocido' }}
            </p>
            <p class="text-body-2 text-disabled mb-0">
              {{ session.os || 'SO desconocido' }}
            </p>
            <p class="text-caption text-disabled mb-0">
              IP: {{ session.ip }} — {{ formatDate(session.date) }}
            </p>
          </div>
          <VChip
            v-if="index === 0"
            color="success"
            size="small"
          >
            Actual
          </VChip>
        </div>
      </div>
      <p
        v-else
        class="text-center text-disabled pa-6"
      >
        Sin sesiones registradas
      </p>
    </VCardText>
  </VCard>
</template>
