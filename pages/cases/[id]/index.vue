<script setup lang="ts">
// pages/cases/[id]/index.vue
definePageMeta({ middleware: ['auth'] })

const params = useRoute().params
const router = useRouter()
const { swalConfirmation } = useSweetAlert()

const { data: caseData, refresh } = await useFetch<any>(`/api/cases/${params.id}`)
const caseDoc = computed(() => caseData.value)

// ─── Estado UI ────────────────────────────────────────────────────────────────
const loadingAction = ref<string | null>(null)
const milestoneDialog = ref(false)
const noteContent = ref('')

const milestoneForm = ref({
  title: '',
  description: '',
  dueDate: '',
})

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

const feeTypeLabel: Record<string, string> = {
  fixed: 'Tarifa fija',
  hourly: 'Por horas',
  contingency: 'A éxito',
  mixed: 'Mixto',
}

const formatDate = (d: string) => d ? new Intl.DateTimeFormat('es-ES').format(new Date(d)) : '—'
const formatDateTime = (d: string) => d ? new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d)) : '—'
const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)

const milestonesCompleted = computed(() => caseDoc.value?.milestones?.filter((m: any) => m.completed).length || 0)
const milestonesTotal = computed(() => caseDoc.value?.milestones?.length || 0)
const progressPercent = computed(() => milestonesTotal.value > 0 ? Math.round((milestonesCompleted.value / milestonesTotal.value) * 100) : 0)

// ─── Cambiar estado ───────────────────────────────────────────────────────────
const statusItems = [
  { title: 'Abierto', value: 'open' },
  { title: 'En curso', value: 'in_progress' },
  { title: 'En espera', value: 'on_hold' },
  { title: 'Cerrado', value: 'closed' },
]

const changeStatus = async (newStatus: string) => {
  await $fetch(`/api/cases/${params.id}`, { method: 'PUT', body: { status: newStatus } })
  await refresh()
}

// ─── Hitos ────────────────────────────────────────────────────────────────────
const addMilestone = async () => {
  if (!milestoneForm.value.title.trim())
    return
  loadingAction.value = 'milestone'
  try {
    await $fetch(`/api/cases/${params.id}/milestones`, {
      method: 'POST',
      body: {
        title: milestoneForm.value.title,
        description: milestoneForm.value.description,
        dueDate: milestoneForm.value.dueDate || undefined,
      },
    })
    milestoneDialog.value = false
    milestoneForm.value = { title: '', description: '', dueDate: '' }
    await refresh()
  }
  finally {
    loadingAction.value = null
  }
}

const toggleMilestone = async (milestone: any) => {
  await $fetch(`/api/cases/${params.id}/milestones/${milestone._id}`, {
    method: 'PUT',
    body: { completed: !milestone.completed },
  })
  await refresh()
}

// ─── Notas ────────────────────────────────────────────────────────────────────
const addNote = async () => {
  if (!noteContent.value.trim())
    return
  loadingAction.value = 'note'
  try {
    await $fetch(`/api/cases/${params.id}/notes`, {
      method: 'POST',
      body: { content: noteContent.value },
    })
    noteContent.value = ''
    await refresh()
  }
  finally {
    loadingAction.value = null
  }
}

// ─── Archivar ─────────────────────────────────────────────────────────────────
const archiveCase = async () => {
  const confirmed = await swalConfirmation({
    title: '¿Archivar expediente?',
    text: 'El expediente se marcará como archivado.',
    icon: 'warning',
  })

  if (!confirmed)
    return
  await $fetch(`/api/cases/${params.id}`, { method: 'DELETE' })
  await router.push('/cases')
}
</script>

<template>
  <div v-if="caseDoc">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-3">
      <div class="d-flex align-center gap-3">
        <VBtn
          icon="tabler-arrow-left"
          variant="text"
          size="small"
          @click="router.push('/cases')"
        />
        <div>
          <div class="d-flex align-center gap-3 flex-wrap">
            <h4 class="text-h4">
              {{ caseDoc.number }}
            </h4>
            <VChip
              :color="statusConfig[caseDoc.status]?.color"
              label
            >
              {{ statusConfig[caseDoc.status]?.label }}
            </VChip>
            <VChip
              :color="priorityConfig[caseDoc.priority]?.color"
              size="small"
              label
            >
              {{ priorityConfig[caseDoc.priority]?.label }}
            </VChip>
          </div>
          <p class="text-body-2 text-disabled mb-0">
            {{ caseDoc.title }}
          </p>
        </div>
      </div>

      <div class="d-flex gap-2 flex-wrap">
        <AppSelect
          :model-value="caseDoc.status"
          label="Cambiar estado"
          :items="statusItems"
          density="compact"
          hide-details
          style="min-inline-size: 160px;"
          @update:model-value="changeStatus"
        />
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="tabler-edit"
          :to="`/cases/${caseDoc._id}/edit`"
        >
          Editar
        </VBtn>
        <VBtn
          variant="outlined"
          color="error"
          prepend-icon="tabler-archive"
          @click="archiveCase"
        >
          Archivar
        </VBtn>
      </div>
    </div>

    <VRow>
      <!-- Columna principal -->
      <VCol
        cols="12"
        md="8"
      >
        <!-- Descripción -->
        <VCard
          v-if="caseDoc.description"
          class="mb-6"
        >
          <VCardTitle class="pa-6 pb-2">
            Descripción
          </VCardTitle>
          <VCardText>
            <p class="text-body-1 mb-0">
              {{ caseDoc.description }}
            </p>
          </VCardText>
        </VCard>

        <!-- Datos judiciales -->
        <VCard
          v-if="caseDoc.court || caseDoc.procedureNumber || caseDoc.opposingParty"
          class="mb-6"
        >
          <VCardTitle class="pa-6 pb-2">
            Datos judiciales
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                v-if="caseDoc.court"
                cols="12"
                sm="6"
              >
                <p class="text-overline text-disabled mb-1">
                  Juzgado
                </p>
                <p class="mb-0">
                  {{ caseDoc.court }} {{ caseDoc.courtNumber ? `nº ${caseDoc.courtNumber}` : '' }}
                </p>
              </VCol>
              <VCol
                v-if="caseDoc.procedureNumber"
                cols="12"
                sm="6"
              >
                <p class="text-overline text-disabled mb-1">
                  Nº Procedimiento
                </p>
                <p class="mb-0 font-weight-semibold">
                  {{ caseDoc.procedureNumber }}
                </p>
              </VCol>
              <VCol
                v-if="caseDoc.opposingParty"
                cols="12"
              >
                <p class="text-overline text-disabled mb-1">
                  Parte contraria
                </p>
                <p class="mb-0">
                  {{ caseDoc.opposingParty }}
                </p>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Hitos -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2 d-flex align-center justify-space-between">
            <div>
              <span>Hitos</span>
              <span class="text-body-2 text-disabled ms-2">{{ milestonesCompleted }}/{{ milestonesTotal }}</span>
            </div>
            <VBtn
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="tabler-plus"
              @click="milestoneDialog = true"
            >
              Añadir hito
            </VBtn>
          </VCardTitle>

          <VCardText class="pa-0">
            <VProgressLinear
              :model-value="progressPercent"
              color="primary"
              height="4"
            />

            <div
              v-if="!caseDoc.milestones?.length"
              class="text-center text-disabled pa-6"
            >
              No hay hitos definidos
            </div>

            <VList v-else>
              <VListItem
                v-for="milestone in caseDoc.milestones"
                :key="milestone._id"
                :class="milestone.completed ? 'opacity-60' : ''"
              >
                <template #prepend>
                  <VCheckbox
                    :model-value="milestone.completed"
                    color="primary"
                    hide-details
                    @change="toggleMilestone(milestone)"
                  />
                </template>
                <VListItemTitle :class="milestone.completed ? 'text-decoration-line-through' : ''">
                  {{ milestone.title }}
                </VListItemTitle>
                <VListItemSubtitle v-if="milestone.dueDate">
                  Fecha límite: {{ formatDate(milestone.dueDate) }}
                </VListItemSubtitle>
                <template #append>
                  <VChip
                    v-if="milestone.completed"
                    color="success"
                    size="x-small"
                  >
                    Completado
                  </VChip>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>

        <!-- Notas -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Notas internas
          </VCardTitle>
          <VCardText>
            <div class="d-flex gap-3 mb-4">
              <AppTextarea
                v-model="noteContent"
                placeholder="Escribe una nota..."
                rows="2"
                hide-details
                class="flex-grow-1"
              />
              <VBtn
                color="primary"
                :loading="loadingAction === 'note'"
                :disabled="!noteContent.trim()"
                @click="addNote"
              >
                Añadir
              </VBtn>
            </div>

            <div
              v-if="!caseDoc.notes?.length"
              class="text-center text-disabled py-4"
            >
              No hay notas
            </div>

            <div
              v-for="note in [...(caseDoc.notes || [])].reverse()"
              :key="note._id"
              class="mb-3"
            >
              <VCard
                variant="tonal"
                color="secondary"
              >
                <VCardText class="py-3">
                  <p class="mb-1">
                    {{ note.content }}
                  </p>
                  <p class="text-body-2 text-disabled mb-0">
                    {{ note.createdBy?.name || 'Usuario' }} · {{ formatDateTime(note.createdAt) }}
                  </p>
                </VCardText>
              </VCard>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Columna lateral -->
      <VCol
        cols="12"
        md="4"
      >
        <!-- Info general -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Información
          </VCardTitle>
          <VCardText>
            <div class="d-flex flex-column gap-3">
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-disabled">Tipo</span>
                <span>{{ typeLabel[caseDoc.type] || caseDoc.type }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-disabled">Apertura</span>
                <span>{{ formatDate(caseDoc.openedAt) }}</span>
              </div>
              <div
                v-if="caseDoc.deadline"
                class="d-flex justify-space-between"
              >
                <span class="text-body-2 text-disabled">Fecha límite</span>
                <span :class="new Date(caseDoc.deadline) < new Date() && !['closed', 'archived'].includes(caseDoc.status) ? 'text-error font-weight-semibold' : ''">
                  {{ formatDate(caseDoc.deadline) }}
                </span>
              </div>
              <div
                v-if="caseDoc.closedAt"
                class="d-flex justify-space-between"
              >
                <span class="text-body-2 text-disabled">Cierre</span>
                <span>{{ formatDate(caseDoc.closedAt) }}</span>
              </div>
            </div>
          </VCardText>
        </VCard>

        <!-- Cliente y abogado -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Partes
          </VCardTitle>
          <VCardText>
            <div class="mb-4">
              <p class="text-overline text-primary mb-1">
                Cliente
              </p>
              <p class="font-weight-semibold mb-0">
                {{ caseDoc.contactId?.fullName || caseDoc.contactId?.name || '—' }}
              </p>
              <p
                v-if="caseDoc.contactId?.email"
                class="text-body-2 text-disabled mb-0"
              >
                {{ caseDoc.contactId.email }}
              </p>
            </div>
            <div v-if="caseDoc.lawyerId">
              <p class="text-overline text-primary mb-1">
                Abogado responsable
              </p>
              <p class="font-weight-semibold mb-0">
                {{ caseDoc.lawyerId?.name }}
              </p>
              <p class="text-body-2 text-disabled mb-0">
                {{ caseDoc.lawyerId?.email }}
              </p>
            </div>
          </VCardText>
        </VCard>

        <!-- Honorarios -->
        <VCard v-if="caseDoc.feeType">
          <VCardTitle class="pa-6 pb-2">
            Honorarios
          </VCardTitle>
          <VCardText>
            <div class="d-flex flex-column gap-3">
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-disabled">Tipo</span>
                <span>{{ feeTypeLabel[caseDoc.feeType] }}</span>
              </div>
              <div
                v-if="caseDoc.feeAmount"
                class="d-flex justify-space-between"
              >
                <span class="text-body-2 text-disabled">Importe</span>
                <span class="font-weight-semibold">{{ eur(caseDoc.feeAmount) }}</span>
              </div>
              <div
                v-if="caseDoc.hourlyRate"
                class="d-flex justify-space-between"
              >
                <span class="text-body-2 text-disabled">Tarifa/hora</span>
                <span class="font-weight-semibold">{{ eur(caseDoc.hourlyRate) }}/h</span>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Dialog: Añadir hito -->
    <VDialog
      v-model="milestoneDialog"
      max-width="480"
    >
      <VCard>
        <VCardTitle class="pa-6">
          Añadir hito
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="milestoneForm.title"
                label="Título *"
                placeholder="Ej: Presentar demanda"
                autofocus
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="milestoneForm.description"
                label="Descripción (opcional)"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="milestoneForm.dueDate"
                label="Fecha límite (opcional)"
                type="date"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="milestoneDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="loadingAction === 'milestone'"
            @click="addMilestone"
          >
            Añadir
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
