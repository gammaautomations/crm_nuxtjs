// pages/leads/kanban.vue

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { data, refresh } = await useFetch('/api/leads', {
  query: { limit: 100, sort: 'score' },
})

const leads = computed(() => (data.value as any)?.data || [])

// Columnas por score
const columns = computed(() => [
  {
    title: 'Crítico',
    color: 'error',
    icon: 'tabler-flame',
    items: [...leads.value]
      .filter((l: any) => l.lead_score >= 8)
      .sort((a: any, b: any) => {
        if (b.lead_score !== a.lead_score)
          return b.lead_score - a.lead_score

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }),
  },
  {
    title: 'Alto',
    color: 'warning',
    icon: 'tabler-trending-up',
    items: [...leads.value]
      .filter((l: any) => l.lead_score >= 6 && l.lead_score < 8)
      .sort((a: any, b: any) => {
        if (b.lead_score !== a.lead_score)
          return b.lead_score - a.lead_score

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }),
  },
  {
    title: 'Medio',
    color: 'info',
    icon: 'tabler-minus',
    items: [...leads.value]
      .filter((l: any) => l.lead_score >= 4 && l.lead_score < 6)
      .sort((a: any, b: any) => {
        if (b.lead_score !== a.lead_score)
          return b.lead_score - a.lead_score

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }),
  },
  {
    title: 'Bajo',
    color: 'secondary',
    icon: 'tabler-trending-down',
    items: [...leads.value]
      .filter((l: any) => l.lead_score < 4)
      .sort((a: any, b: any) => {
        if (b.lead_score !== a.lead_score)
          return b.lead_score - a.lead_score

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }),
  },
])

const scoreMap: Record<string, number> = {
  Crítico: 9,
  Alto: 7,
  Medio: 5,
  Bajo: 2,
}

const handleDrop = async (lead: any, targetColumn: string) => {
  const newScore = scoreMap[targetColumn]
  try {
    await $fetch(`/api/leads/${lead._id}/score`, {
      method: 'PATCH',
      body: { lead_score: newScore },
    })
    await refresh()
  }
  catch (error) {
    console.error('Error updating score:', error)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
  })
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
        Kanban — Leads por Score
      </h4>
      <VBtn
        variant="outlined"
        prepend-icon="tabler-list"
        to="/leads"
      >
        Vista tabla
      </VBtn>
    </div>

    <div class="d-flex gap-4 pb-4 kanban-board">
      <div
        v-for="column in columns"
        :key="column.title"
        class="kanban-column flex-shrink-0"
        style="inline-size: 300px;"
        @dragover.prevent
        @drop="e => {
          const leadData = JSON.parse(e.dataTransfer?.getData('lead') || '{}')
          if (leadData._id) handleDrop(leadData, column.title)
        }"
      >
        <!-- Header columna -->
        <div class="d-flex align-center gap-2 mb-3">
          <VIcon
            :icon="column.icon"
            :color="column.color"
            size="20"
          />
          <span class="font-weight-semibold">{{ column.title }}</span>
          <VChip
            size="x-small"
            :color="column.color"
            class="ms-auto"
          >
            {{ column.items.length }}
          </VChip>
        </div>

        <!-- Cards -->
        <div class="d-flex flex-column gap-3">
          <VCard
            v-for="lead in column.items"
            :key="lead._id"
            class="cursor-grab"
            draggable="true"
            :style="`border-left: 4px solid rgb(var(--v-theme-${scoreColor(lead.lead_score)}))`"
            @click="navigateTo(`/leads/${lead._id}`)"
            @dragstart="e => e.dataTransfer?.setData('lead', JSON.stringify(lead))"
          >
            <VCardText class="pa-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="font-weight-semibold text-body-1">{{ lead.nombre }}</span>
                <VChip
                  size="x-small"
                  :color="scoreColor(lead.lead_score)"
                >
                  {{ lead.lead_score }}
                </VChip>
              </div>

              <p class="text-body-2 text-disabled mb-2">
                {{ lead.email }}
              </p>

              <div class="d-flex align-center gap-2 mb-2">
                <VChip
                  size="x-small"
                  variant="outlined"
                >
                  {{ lead.area }}
                </VChip>
                <VChip
                  size="x-small"
                  variant="outlined"
                >
                  {{ lead.nivel_urgencia }}
                </VChip>
              </div>

              <div class="d-flex align-center justify-space-between">
                <span class="text-caption text-disabled">{{ formatDate(lead.createdAt) }}</span>
                <span
                  v-if="lead.assignedLawyer"
                  class="text-caption text-primary"
                >
                  {{ lead.assignedLawyer.name }}
                </span>
                <span
                  v-else
                  class="text-caption text-disabled"
                >Sin asignar</span>
              </div>
            </VCardText>
          </VCard>

          <!-- Empty state -->
          <div
            v-if="!column.items.length"
            class="text-center text-disabled pa-6 border-dashed rounded"
            style="border: 2px dashed rgba(0, 0, 0, 10%);"
          >
            Sin leads
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-grab {
  cursor: grab;
}

.cursor-grab:active {
  cursor: grabbing;
}

.kanban-board {
  -ms-overflow-style: none;
  overflow-x: auto;
  scrollbar-width: none;
}

.kanban-board::-webkit-scrollbar {
  display: none;
}
</style>
