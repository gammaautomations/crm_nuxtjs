// pages/leads/index.vue

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const search = ref('')
const statusFilter = ref('')
const areaFilter = ref('')
const page = ref(1)
const lawyerFilter = ref('')

const { data, refresh, pending } = useFetch('/api/leads', {
  query: computed(() => ({
    search: search.value || undefined,
    status: statusFilter.value || undefined,
    area: areaFilter.value || undefined,
    lawyer: lawyerFilter.value || undefined,
    page: page.value,
    limit: 20,
  })),
  watch: [search, statusFilter, areaFilter, lawyerFilter, page],
})

const leads = computed(() => (data.value as any)?.data || [])
const pagination = computed(() => (data.value as any)?.pagination || {})

const { data: lawyers } = await useFetch('/api/lawyers')
const lawyersList = computed(() => (lawyers.value as any[]) || [])

const { swalConfirmation } = useSweetAlert()

const assignDialog = ref(false)
const selectedLead = ref<any>(null)
const selectedLawyer = ref('')
const assignLoading = ref(false)

const openAssignDialog = (lead: any) => {
  selectedLead.value = lead
  selectedLawyer.value = lead.assignedLawyer?._id || ''
  assignDialog.value = true
}

const assignLawyer = async () => {
  if (!selectedLawyer.value)
    return

  assignLoading.value = true
  try {
    await $fetch(`/api/leads/${selectedLead.value._id}/assign`, {
      method: 'PATCH',
      body: { lawyerId: selectedLawyer.value },
    })
    assignDialog.value = false
    await refresh()
  }
  catch (error: any) {
    console.error(error)
  }
  finally {
    assignLoading.value = false
  }
}

const statusColor: Record<string, string> = {
  nuevo: 'info',
  contactado: 'warning',
  en_proceso: 'primary',
  cerrado: 'success',
  descartado: 'error',
}

const statusOptions = [
  { title: 'Todos', value: '' },
  { title: 'Nuevo', value: 'nuevo' },
  { title: 'Contactado', value: 'contactado' },
  { title: 'En proceso', value: 'en_proceso' },
  { title: 'Cerrado', value: 'cerrado' },
  { title: 'Descartado', value: 'descartado' },
]

const areaOptions = [
  { title: 'Todas', value: '' },
  { title: 'Penal', value: 'penal' },
  { title: 'Civil', value: 'civil' },
  { title: 'Laboral', value: 'laboral' },
]

const headers = [
  { title: 'Nombre', key: 'nombre', sortable: true },
  { title: 'Área', key: 'area', sortable: true },
  { title: 'Score', key: 'lead_score', sortable: true },
  { title: 'Urgencia', key: 'nivel_urgencia', sortable: false },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Abogado', key: 'assignedLawyer', sortable: false },
  { title: 'Fecha', key: 'createdAt', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Leads
      </h4>
      <VBtn
        color="success"
        prepend-icon="tabler-file-spreadsheet"
        href="/api/leads/export"
        target="_blank"
      >
        Exportar Excel
      </VBtn>
    </div>

    <!-- Filtros -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="search"
              label="Buscar"
              placeholder="Nombre o email..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="statusFilter"
              label="Estado"
              :items="statusOptions"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="areaFilter"
              label="Área"
              :items="areaOptions"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="lawyerFilter"
              label="Abogado"
              :items="[{ title: 'Todos', value: '' }, ...lawyersList.map((l: any) => ({ title: l.name, value: l._id }))]"
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
            class="d-flex align-center"
          >
            <VBtn
              variant="outlined"
              color="secondary"
              block
              @click="search = ''; statusFilter = ''; areaFilter = ''; lawyerFilter = ''; page = 1"
            >
              Limpiar
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Tabla -->
    <VCard>
      <VDataTable
        :headers="headers"
        :items="leads"
        :loading="pending"
        item-value="_id"
        hide-default-footer
      >
        <!-- Nombre -->
        <template #item.nombre="{ item }">
          <div>
            <p class="font-weight-medium mb-0">
              {{ item.nombre || '—' }}
            </p>
            <p class="text-body-2 text-disabled mb-0">
              {{ item.email || '—' }}
            </p>
          </div>
        </template>

        <!-- Área -->
        <template #item.area="{ item }">
          <VChip
            size="small"
            variant="outlined"
          >
            {{ item.area || '—' }}
          </VChip>
        </template>

        <!-- Score -->
        <template #item.lead_score="{ item }">
          <VChip
            size="small"
            :color="item.lead_score > 5 ? 'success' : 'warning'"
          >
            {{ item.lead_score || 0 }}
          </VChip>
        </template>

        <!-- Urgencia -->
        <template #item.nivel_urgencia="{ item }">
          <span class="text-body-2">{{ item.nivel_urgencia || '—' }}</span>
        </template>

        <!-- Estado -->
        <template #item.status="{ item }">
          <VChip
            :color="statusColor[item.status]"
            size="small"
          >
            {{ item.status }}
          </VChip>
        </template>

        <!-- Abogado asignado -->
        <template #item.assignedLawyer="{ item }">
          <span class="text-body-2">
            {{ item.assignedLawyer?.name || '—' }}
          </span>
        </template>

        <!-- Fecha -->
        <template #item.createdAt="{ item }">
          <span class="text-body-2">{{ formatDate(item.createdAt) }}</span>
        </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1 align-center">
            <WhatsAppButton
              v-if="item.telefono"
              :phone="item.telefono"
              :message="`Hola ${item.nombre}, le contactamos desde el despacho Garriga & Asociados respecto a su consulta sobre ${item.area}.`"
              size="x-small"
              variant="tonal"
            />
            <VBtn
              icon
              size="x-small"
              variant="text"
              color="primary"
              @click="openAssignDialog(item)"
            >
              <VIcon
                icon="tabler-user-check"
                size="18"
              />
            </VBtn>
            <VBtn
              icon
              size="x-small"
              variant="text"
              color="secondary"
              :to="`/leads/${item._id}`"
            >
              <VIcon
                icon="tabler-eye"
                size="18"
              />
            </VBtn>
          </div>
        </template>
      </VDataTable>

      <!-- Paginación -->
      <VCardText class="d-flex align-center justify-space-between">
        <span class="text-body-2 text-disabled">
          Total: {{ pagination.total }} leads
        </span>
        <VPagination
          v-model="page"
          :length="pagination.pages"
          :total-visible="5"
        />
      </VCardText>
    </VCard>

    <!-- Dialog asignar abogado -->
    <VDialog
      v-model="assignDialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="pa-6">
          Asignar abogado
        </VCardTitle>
        <VCardText>
          <p class="mb-4">
            Lead: <strong>{{ selectedLead?.nombre }}</strong>
          </p>
          <AppSelect
            v-model="selectedLawyer"
            label="Abogado"
            placeholder="Selecciona un abogado"
            :items="lawyersList.map((l: any) => ({ title: l.name, value: l._id }))"
          />
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="assignDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="assignLoading"
            :disabled="!selectedLawyer"
            @click="assignLawyer"
          >
            Asignar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
