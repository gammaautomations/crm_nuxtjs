<script setup lang="ts">
// pages/cases/new.vue

definePageMeta({ middleware: ['auth'] })

const router = useRouter()

const [contactsData, lawyersData, leadsData] = await Promise.all([
  $fetch<any>('/api/contacts?limit=200'),
  $fetch<any>('/api/lawyers'),
  $fetch<any>('/api/leads?limit=200'),
])

const contacts = contactsData?.data || contactsData || []
const lawyers = lawyersData || []
const leads = leadsData?.data || leadsData || []

const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  title: '',
  description: '',
  type: 'civil',
  status: 'open',
  priority: 'medium',
  court: '',
  courtNumber: '',
  procedureNumber: '',
  opposingParty: '',
  openedAt: new Date().toISOString().split('T')[0],
  deadline: '',
  contactId: '',
  lawyerId: '',
  leadId: '',
  feeType: '',
  feeAmount: null as number | null,
  hourlyRate: null as number | null,
})

// ─── Items ────────────────────────────────────────────────────────────────────
const typeItems = [
  { title: 'Civil', value: 'civil' },
  { title: 'Penal', value: 'penal' },
  { title: 'Laboral', value: 'laboral' },
  { title: 'Mercantil', value: 'mercantil' },
  { title: 'Administrativo', value: 'administrativo' },
  { title: 'Otro', value: 'otro' },
]

const statusItems = [
  { title: 'Abierto', value: 'open' },
  { title: 'En curso', value: 'in_progress' },
  { title: 'En espera', value: 'on_hold' },
  { title: 'Cerrado', value: 'closed' },
]

const priorityItems = [
  { title: 'Baja', value: 'low' },
  { title: 'Media', value: 'medium' },
  { title: 'Alta', value: 'high' },
  { title: 'Urgente', value: 'urgent' },
]

const feeTypeItems = [
  { title: 'Tarifa fija', value: 'fixed' },
  { title: 'Por horas', value: 'hourly' },
  { title: 'A éxito', value: 'contingency' },
  { title: 'Mixto', value: 'mixed' },
]

// ─── Guardar ──────────────────────────────────────────────────────────────────
const save = async () => {
  errorMsg.value = ''

  if (!form.value.title.trim()) {
    errorMsg.value = 'El título es requerido'

    return
  }

  if (!form.value.contactId) {
    errorMsg.value = 'El cliente es requerido'

    return
  }

  loading.value = true

  try {
    const body = {
      ...form.value,
      lawyerId: form.value.lawyerId || undefined,
      leadId: form.value.leadId || undefined,
      feeType: form.value.feeType || undefined,
      feeAmount: form.value.feeAmount || undefined,
      hourlyRate: form.value.hourlyRate || undefined,
      deadline: form.value.deadline || undefined,
    }

    const created = await $fetch<any>('/api/cases', { method: 'POST', body })

    await router.push(`/cases/${created._id}`)
  }
  catch (e: any) {
    errorMsg.value = e?.data?.message || 'Error al crear el expediente'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <VBtn
          icon="tabler-arrow-left"
          variant="text"
          size="small"
          @click="router.push('/cases')"
        />
        <h4 class="text-h4">
          Nuevo expediente
        </h4>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          color="secondary"
          @click="router.push('/cases')"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          prepend-icon="tabler-device-floppy"
          @click="save"
        >
          Crear expediente
        </VBtn>
      </div>
    </div>

    <VAlert
      v-if="errorMsg"
      type="error"
      density="compact"
      class="mb-4"
      closable
      @click:close="errorMsg = ''"
    >
      {{ errorMsg }}
    </VAlert>

    <VRow>
      <!-- Columna principal -->
      <VCol
        cols="12"
        md="8"
      >
        <!-- Datos básicos -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Datos del expediente
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.title"
                  label="Título *"
                  placeholder="Ej: Reclamación daños y perjuicios"
                  autofocus
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="form.description"
                  label="Descripción"
                  placeholder="Resumen del caso..."
                  rows="3"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppSelect
                  v-model="form.type"
                  label="Tipo"
                  :items="typeItems"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppSelect
                  v-model="form.status"
                  label="Estado"
                  :items="statusItems"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppSelect
                  v-model="form.priority"
                  label="Prioridad"
                  :items="priorityItems"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.openedAt"
                  label="Fecha de apertura"
                  type="date"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.deadline"
                  label="Fecha límite"
                  type="date"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Datos judiciales -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Datos judiciales
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.court"
                  label="Juzgado / Tribunal"
                  placeholder="Juzgado de 1ª Instancia nº 3"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.courtNumber"
                  label="Número de juzgado"
                  placeholder="3"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.procedureNumber"
                  label="Número de procedimiento"
                  placeholder="123/2026"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.opposingParty"
                  label="Parte contraria"
                  placeholder="Nombre del demandado/demandante"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Honorarios -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Honorarios
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                sm="4"
              >
                <AppSelect
                  v-model="form.feeType"
                  label="Tipo de honorario"
                  :items="feeTypeItems"
                  clearable
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model.number="form.feeAmount"
                  label="Importe"
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="€"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model.number="form.hourlyRate"
                  label="Tarifa por hora"
                  type="number"
                  min="0"
                  step="0.01"
                  prefix="€"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Columna lateral -->
      <VCol
        cols="12"
        md="4"
      >
        <!-- Cliente y asignación -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Asignación
          </VCardTitle>
          <VCardText>
            <AppSelect
              v-model="form.contactId"
              label="Cliente *"
              placeholder="Selecciona un contacto"
              :items="(contacts as any[]).map((c: any) => ({ title: c.fullName || c.name, value: c._id }))"
              class="mb-4"
            />
            <AppSelect
              v-model="form.lawyerId"
              label="Abogado responsable"
              :items="(lawyers as any[]).map((l: any) => ({ title: l.name, value: l._id }))"
              clearable
              class="mb-4"
            />
            <AppSelect
              v-model="form.leadId"
              label="Lead relacionado"
              :items="(leads as any[]).map((l: any) => ({ title: l.nombre || l.area || l._id, value: l._id }))"
              clearable
            />
          </VCardText>
        </VCard>

        <!-- Acciones -->
        <VCard>
          <VCardText class="d-flex flex-column gap-3">
            <VBtn
              block
              color="primary"
              :loading="loading"
              prepend-icon="tabler-device-floppy"
              @click="save"
            >
              Crear expediente
            </VBtn>
            <VBtn
              block
              variant="text"
              color="secondary"
              @click="router.push('/cases')"
            >
              Cancelar
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
