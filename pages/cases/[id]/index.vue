<script setup lang="ts">
// pages/cases/[id]/index.vue
definePageMeta({ middleware: ['auth'] })

const params = useRoute().params
const router = useRouter()
const { swalConfirmation } = useSweetAlert()

const { data: caseData, refresh } = await useFetch<any>(`/api/cases/${params.id}`)
const caseDoc = computed(() => caseData.value)

// ─── Horas ────────────────────────────────────────────────────────────────────
const { data: timeData, refresh: refreshTime } = await useFetch<any>('/api/time-entries', {
  query: { caseId: params.id },
})

const timeEntries = computed(() => timeData.value?.data || [])
const totalHours = computed(() => timeData.value?.totalHours || 0)
const totalAmount = computed(() => timeData.value?.totalAmount || 0)
const unbilledEntries = computed(() => timeEntries.value.filter((e: any) => !e.billed))

// ─── Estado UI ────────────────────────────────────────────────────────────────
const loadingAction = ref<string | null>(null)
const milestoneDialog = ref(false)
const timeDialog = ref(false)
const billDialog = ref(false)
const noteContent = ref('')
const editingTimeId = ref<string | null>(null)
const selectedEntries = ref<string[]>([])
const billInvoiceId = ref('')

const milestoneForm = ref({ title: '', description: '', dueDate: '' })

const timeForm = ref({
  description: '',
  date: new Date().toISOString().split('T')[0],
  hours: 1,
  hourlyRate: caseDoc.value?.hourlyRate || 0,
  lawyerId: caseDoc.value?.lawyerId?._id || '',
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

// ─── Estado ───────────────────────────────────────────────────────────────────
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
      body: { title: milestoneForm.value.title, description: milestoneForm.value.description, dueDate: milestoneForm.value.dueDate || undefined },
    })
    milestoneDialog.value = false
    milestoneForm.value = { title: '', description: '', dueDate: '' }
    await refresh()
  }
  finally { loadingAction.value = null }
}

const toggleMilestone = async (milestone: any) => {
  await $fetch(`/api/cases/${params.id}/milestones/${milestone._id}`, {
    method: 'PUT', body: { completed: !milestone.completed },
  })
  await refresh()
}

// ─── Notas ────────────────────────────────────────────────────────────────────
const addNote = async () => {
  if (!noteContent.value.trim())
    return
  loadingAction.value = 'note'
  try {
    await $fetch(`/api/cases/${params.id}/notes`, { method: 'POST', body: { content: noteContent.value } })
    noteContent.value = ''
    await refresh()
  }
  finally { loadingAction.value = null }
}

// ─── Horas ────────────────────────────────────────────────────────────────────
const openTimeDialog = (entry?: any) => {
  if (entry) {
    editingTimeId.value = entry._id
    timeForm.value = {
      description: entry.description,
      date: entry.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      hours: entry.hours,
      hourlyRate: entry.hourlyRate,
      lawyerId: entry.lawyerId?._id || entry.lawyerId || '',
    }
  }
  else {
    editingTimeId.value = null
    timeForm.value = {
      description: '',
      date: new Date().toISOString().split('T')[0],
      hours: 1,
      hourlyRate: caseDoc.value?.hourlyRate || 0,
      lawyerId: caseDoc.value?.lawyerId?._id || '',
    }
  }
  timeDialog.value = true
}

const saveTimeEntry = async () => {
  if (!timeForm.value.description.trim())
    return
  loadingAction.value = 'time'
  try {
    const body = {
      ...timeForm.value,
      caseId: params.id,
      lawyerId: timeForm.value.lawyerId || undefined,
    }

    if (editingTimeId.value)
      await $fetch(`/api/time-entries/${editingTimeId.value}`, { method: 'PUT', body })
    else
      await $fetch('/api/time-entries', { method: 'POST', body })

    timeDialog.value = false
    await refreshTime()
  }
  finally { loadingAction.value = null }
}

const deleteTimeEntry = async (entry: any) => {
  const confirmed = await swalConfirmation({
    title: '¿Eliminar entrada?',
    text: `Se eliminará "${entry.description}"`,
    icon: 'warning',
  })

  if (!confirmed)
    return
  await $fetch(`/api/time-entries/${entry._id}`, { method: 'DELETE' })
  await refreshTime()
}

// ─── Facturar horas ───────────────────────────────────────────────────────────
const billHours = async () => {
  if (!selectedEntries.value.length || !billInvoiceId.value.trim())
    return
  loadingAction.value = 'bill'
  try {
    await $fetch('/api/time-entries/bill', {
      method: 'POST',
      body: { entryIds: selectedEntries.value, invoiceId: billInvoiceId.value.trim() },
    })
    billDialog.value = false
    selectedEntries.value = []
    billInvoiceId.value = ''
    await refreshTime()
  }
  catch (e: any) {
    alert(e?.data?.message || 'Error al facturar las horas')
  }
  finally { loadingAction.value = null }
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

        <!-- Registro de horas -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2 d-flex align-center justify-space-between">
            <div>
              <span>Registro de horas</span>
              <span class="text-body-2 text-disabled ms-2">{{ totalHours }}h · {{ eur(totalAmount) }}</span>
            </div>
            <div class="d-flex gap-2">
              <VBtn
                v-if="unbilledEntries.length"
                size="small"
                variant="tonal"
                color="success"
                prepend-icon="tabler-file-invoice"
                @click="billDialog = true"
              >
                Facturar
              </VBtn>
              <VBtn
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="tabler-plus"
                @click="openTimeDialog"
              >
                Registrar horas
              </VBtn>
            </div>
          </VCardTitle>

          <VCardText class="pa-0">
            <div
              v-if="!timeEntries.length"
              class="text-center text-disabled pa-6"
            >
              No hay horas registradas
            </div>

            <VTable
              v-else
              density="compact"
            >
              <thead>
                <tr>
                  <th>
                    <VCheckbox
                      :model-value="selectedEntries.length === unbilledEntries.length && unbilledEntries.length > 0"
                      hide-details
                      density="compact"
                      @change="selectedEntries = selectedEntries.length === unbilledEntries.length ? [] : unbilledEntries.map((e: any) => e._id)"
                    />
                  </th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th class="text-center">
                    Horas
                  </th>
                  <th class="text-end">
                    Importe
                  </th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="entry in timeEntries"
                  :key="entry._id"
                >
                  <td>
                    <VCheckbox
                      v-if="!entry.billed"
                      v-model="selectedEntries"
                      :value="entry._id"
                      hide-details
                      density="compact"
                    />
                  </td>
                  <td>{{ entry.description }}</td>
                  <td>{{ formatDate(entry.date) }}</td>
                  <td class="text-center">
                    {{ entry.hours }}h
                  </td>
                  <td class="text-end font-weight-semibold">
                    {{ eur(entry.amount) }}
                  </td>
                  <td>
                    <VChip
                      :color="entry.billed ? 'success' : 'warning'"
                      size="x-small"
                      label
                    >
                      {{ entry.billed ? 'Facturada' : 'Pendiente' }}
                    </VChip>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <VBtn
                        v-if="!entry.billed"
                        icon="tabler-edit"
                        variant="text"
                        size="x-small"
                        @click="openTimeDialog(entry)"
                      />
                      <VBtn
                        v-if="!entry.billed"
                        icon="tabler-trash"
                        variant="text"
                        color="error"
                        size="x-small"
                        @click="deleteTimeEntry(entry)"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </VTable>
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
        <!-- Resumen horas -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Horas
          </VCardTitle>
          <VCardText class="pa-0">
            <div class="px-6 py-3 d-flex justify-space-between">
              <span class="text-body-2 text-disabled">Total horas</span>
              <span class="font-weight-semibold">{{ totalHours }}h</span>
            </div>
            <VDivider />
            <div class="px-6 py-3 d-flex justify-space-between">
              <span class="text-body-2 text-disabled">Total importe</span>
              <span class="font-weight-semibold text-primary">{{ eur(totalAmount) }}</span>
            </div>
            <VDivider />
            <div class="px-6 py-3 d-flex justify-space-between">
              <span class="text-body-2 text-disabled">Pendiente facturar</span>
              <span
                class="font-weight-semibold"
                :class="unbilledEntries.length ? 'text-warning' : 'text-success'"
              >
                {{ unbilledEntries.length }} entradas
              </span>
            </div>
          </VCardText>
        </VCard>

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

        <!-- Partes -->
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

    <!-- Dialog: Registrar horas -->
    <VDialog
      v-model="timeDialog"
      max-width="480"
    >
      <VCard>
        <VCardTitle class="pa-6">
          {{ editingTimeId ? 'Editar entrada' : 'Registrar horas' }}
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="timeForm.description"
                label="Descripción *"
                placeholder="Ej: Redacción de demanda"
                autofocus
              />
            </VCol>
            <VCol
              cols="12"
              sm="5"
            >
              <AppTextField
                v-model="timeForm.date"
                label="Fecha"
                type="date"
              />
            </VCol>
            <VCol
              cols="12"
              sm="3"
            >
              <AppTextField
                v-model.number="timeForm.hours"
                label="Horas *"
                type="number"
                min="0.1"
                step="0.25"
              />
            </VCol>
            <VCol
              cols="12"
              sm="4"
            >
              <AppTextField
                v-model.number="timeForm.hourlyRate"
                label="€/hora"
                type="number"
                min="0"
                prefix="€"
              />
            </VCol>
            <VCol
              v-if="timeForm.hours && timeForm.hourlyRate"
              cols="12"
            >
              <VAlert
                type="info"
                density="compact"
                variant="tonal"
              >
                Importe: <strong>{{ eur(timeForm.hours * timeForm.hourlyRate) }}</strong>
              </VAlert>
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="timeDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="loadingAction === 'time'"
            @click="saveTimeEntry"
          >
            {{ editingTimeId ? 'Actualizar' : 'Registrar' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Dialog: Facturar horas -->
    <VDialog
      v-model="billDialog"
      max-width="480"
    >
      <VCard>
        <VCardTitle class="pa-6">
          Facturar horas
        </VCardTitle>
        <VCardText>
          <VAlert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Se añadirán <strong>{{ selectedEntries.length || unbilledEntries.length }}</strong> entradas como líneas a la factura indicada.
          </VAlert>
          <AppTextField
            v-model="billInvoiceId"
            label="ID de la factura *"
            placeholder="Pega el ID de la factura en borrador"
            hint="Puedes encontrar el ID en la URL de la factura"
            persistent-hint
          />
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="billDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="success"
            :loading="loadingAction === 'bill'"
            :disabled="!billInvoiceId.trim()"
            @click="billHours"
          >
            Añadir a factura
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

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
