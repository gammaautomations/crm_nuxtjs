<script setup lang="ts">
// pages/cases/index.vue
definePageMeta({ middleware: ['auth'] })

const { swalConfirmation } = useSweetAlert()

const search = ref('')
const status = ref('')
const type = ref('')
const priority = ref('')
const page = ref(1)
const limit = 20

const { data, refresh, pending } = await useFetch('/api/cases', {
  query: computed(() => ({
    page: page.value,
    limit,
    search: search.value || undefined,
    status: status.value || undefined,
    type: type.value || undefined,
    priority: priority.value || undefined,
    sortBy: 'openedAt',
    sortOrder: 'desc',
  })),
  watch: [page, search, status, type, priority],
})

const cases = computed(() => (data.value as any)?.data || [])
const meta = computed(() => (data.value as any)?.meta || { total: 0, totalPages: 1 })

let searchTimeout: ReturnType<typeof setTimeout>

const onSearch = (val: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { search.value = val; page.value = 1 }, 400)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: 'Abierto', color: 'primary' },
  in_progress: { label: 'En curso', color: 'info' },
  on_hold: { label: 'En espera', color: 'warning' },
  closed: { label: 'Cerrado', color: 'success' },
  archived: { label: 'Archivado', color: 'default' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Baja', color: 'default' },
  medium: { label: 'Media', color: 'info' },
  high: { label: 'Alta', color: 'warning' },
  urgent: { label: 'Urgente', color: 'error' },
}

const typeLabel: Record<string, string> = {
  civil: 'Civil',
  penal: 'Penal',
  laboral: 'Laboral',
  mercantil: 'Mercantil',
  administrativo: 'Administrativo',
  otro: 'Otro',
}

const statusItems = [
  { title: 'Todos los estados', value: '' },
  ...Object.entries(statusConfig).map(([value, { label }]) => ({ title: label, value })),
]

const typeItems = [
  { title: 'Todos los tipos', value: '' },
  ...Object.entries(typeLabel).map(([value, title]) => ({ title, value })),
]

const priorityItems = [
  { title: 'Todas las prioridades', value: '' },
  ...Object.entries(priorityConfig).map(([value, { label }]) => ({ title: label, value })),
]

const formatDate = (d: string) =>
  d ? new Intl.DateTimeFormat('es-ES').format(new Date(d)) : '—'

// ─── Archivar ─────────────────────────────────────────────────────────────────
const archiveCase = async (c: any) => {
  const confirmed = await swalConfirmation({
    title: '¿Archivar expediente?',
    text: `El expediente "${c.title}" se marcará como archivado.`,
    icon: 'warning',
  })

  if (!confirmed)
    return

  await $fetch(`/api/cases/${c._id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Expedientes
      </h4>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        to="/cases/new"
      >
        Nuevo expediente
      </VBtn>
    </div>

    <!-- Filtros -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            sm="4"
          >
            <AppTextField
              :model-value="search"
              label="Buscar"
              placeholder="Número, título, procedimiento..."
              prepend-inner-icon="tabler-search"
              clearable
              @update:model-value="onSearch"
            />
          </VCol>
          <VCol
            cols="12"
            sm="3"
          >
            <AppSelect
              v-model="status"
              label="Estado"
              :items="statusItems"
              @update:model-value="() => { page = 1 }"
            />
          </VCol>
          <VCol
            cols="12"
            sm="2"
          >
            <AppSelect
              v-model="type"
              label="Tipo"
              :items="typeItems"
              @update:model-value="() => { page = 1 }"
            />
          </VCol>
          <VCol
            cols="12"
            sm="2"
          >
            <AppSelect
              v-model="priority"
              label="Prioridad"
              :items="priorityItems"
              @update:model-value="() => { page = 1 }"
            />
          </VCol>
          <VCol
            cols="12"
            sm="1"
            class="d-flex align-end"
          >
            <VBtn
              variant="outlined"
              color="secondary"
              icon="tabler-refresh"
              @click="() => { search = ''; status = ''; type = ''; priority = ''; page = 1 }"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Tabla -->
    <VCard>
      <VCardText class="pa-0">
        <div
          v-if="pending"
          class="d-flex justify-center pa-10"
        >
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </div>

        <div
          v-else-if="!cases.length"
          class="text-center text-disabled pa-10"
        >
          <VIcon
            icon="tabler-folder-off"
            size="48"
            class="mb-3"
          />
          <p class="mb-0">
            No hay expedientes
          </p>
        </div>

        <VTable v-else>
          <thead>
            <tr>
              <th>Número</th>
              <th>Título</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Apertura</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in cases"
              :key="c._id"
              style="cursor: pointer;"
              @click="$router.push(`/cases/${c._id}`)"
            >
              <td>
                <span class="font-weight-semibold text-primary">{{ c.number }}</span>
              </td>
              <td>
                <p class="mb-0 font-weight-medium">
                  {{ c.title }}
                </p>
                <p
                  v-if="c.procedureNumber"
                  class="text-body-2 text-disabled mb-0"
                >
                  Proc: {{ c.procedureNumber }}
                </p>
              </td>
              <td>
                <p class="mb-0">
                  {{ c.contactId?.fullName || c.contactId?.name || '—' }}
                </p>
              </td>
              <td>{{ typeLabel[c.type] || c.type }}</td>
              <td>
                <VChip
                  :color="priorityConfig[c.priority]?.color"
                  size="small"
                  label
                >
                  {{ priorityConfig[c.priority]?.label }}
                </VChip>
              </td>
              <td>
                <VChip
                  :color="statusConfig[c.status]?.color"
                  size="small"
                  label
                >
                  {{ statusConfig[c.status]?.label }}
                </VChip>
              </td>
              <td>{{ formatDate(c.openedAt) }}</td>
              <td @click.stop>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                >
                  <VIcon icon="tabler-dots-vertical" />
                  <VMenu activator="parent">
                    <VList density="compact">
                      <VListItem
                        prepend-icon="tabler-eye"
                        title="Ver detalle"
                        :to="`/cases/${c._id}`"
                      />
                      <VListItem
                        prepend-icon="tabler-edit"
                        title="Editar"
                        :to="`/cases/${c._id}/edit`"
                      />
                      <VDivider class="my-1" />
                      <VListItem
                        prepend-icon="tabler-archive"
                        title="Archivar"
                        class="text-warning"
                        @click="archiveCase(c)"
                      />
                    </VList>
                  </VMenu>
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <div
          v-if="meta.totalPages > 1"
          class="d-flex justify-center pa-4"
        >
          <VPagination
            v-model="page"
            :length="meta.totalPages"
            :total-visible="5"
          />
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
