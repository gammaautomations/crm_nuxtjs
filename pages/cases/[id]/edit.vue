<script setup lang="ts">
// pages/cases/[id]/edit.vue
definePageMeta({ middleware: ['auth'] })

const params = useRoute().params
const router = useRouter()

const [contactsData, lawyersData, leadsData, existing] = await Promise.all([
  $fetch<any>('/api/contacts?limit=200'),
  $fetch<any>('/api/lawyers'),
  $fetch<any>('/api/leads?limit=200'),
  $fetch<any>(`/api/cases/${params.id}`),
])

const contacts = contactsData?.data || contactsData || []
const lawyers = lawyersData || []
const leads = leadsData?.data || leadsData || []

const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  title: existing.title || '',
  description: existing.description || '',
  type: existing.type || 'civil',
  status: existing.status || 'open',
  priority: existing.priority || 'medium',
  court: existing.court || '',
  courtNumber: existing.courtNumber || '',
  procedureNumber: existing.procedureNumber || '',
  opposingParty: existing.opposingParty || '',
  openedAt: existing.openedAt?.split('T')[0] || '',
  deadline: existing.deadline?.split('T')[0] || '',
  contactId: existing.contactId?._id || existing.contactId || '',
  lawyerId: existing.lawyerId?._id || existing.lawyerId || '',
  leadId: existing.leadId?._id || existing.leadId || '',
  feeType: existing.feeType || '',
  feeAmount: existing.feeAmount || null,
  hourlyRate: existing.hourlyRate || null,
})

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
    await $fetch(`/api/cases/${params.id}`, {
      method: 'PUT',
      body: {
        ...form.value,
        lawyerId: form.value.lawyerId || undefined,
        leadId: form.value.leadId || undefined,
        feeType: form.value.feeType || undefined,
        feeAmount: form.value.feeAmount || undefined,
        hourlyRate: form.value.hourlyRate || undefined,
        deadline: form.value.deadline || undefined,
      },
    })
    await router.push(`/cases/${params.id}`)
  }
  catch (e: any) {
    errorMsg.value = e?.data?.message || 'Error al guardar'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <VBtn
          icon="tabler-arrow-left"
          variant="text"
          size="small"
          @click="router.push(`/cases/${params.id}`)"
        />
        <div>
          <h4 class="text-h4">
            Editar expediente
          </h4>
          <span class="text-body-2 text-disabled">{{ existing.number }}</span>
        </div>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          color="secondary"
          @click="router.push(`/cases/${params.id}`)"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          prepend-icon="tabler-device-floppy"
          @click="save"
        >
          Guardar cambios
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
      <VCol
        cols="12"
        md="8"
      >
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
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="form.description"
                  label="Descripción"
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
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.courtNumber"
                  label="Número de juzgado"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.procedureNumber"
                  label="Número de procedimiento"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.opposingParty"
                  label="Parte contraria"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

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
                  prefix="€"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Asignación
          </VCardTitle>
          <VCardText>
            <AppSelect
              v-model="form.contactId"
              label="Cliente *"
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
              :items="(leads as any[]).map((l: any) => ({ title: l.title || l.name, value: l._id }))"
              clearable
            />
          </VCardText>
        </VCard>

        <VCard>
          <VCardText class="d-flex flex-column gap-3">
            <VBtn
              block
              color="primary"
              :loading="loading"
              prepend-icon="tabler-device-floppy"
              @click="save"
            >
              Guardar cambios
            </VBtn>
            <VBtn
              block
              variant="text"
              color="secondary"
              @click="router.push(`/cases/${params.id}`)"
            >
              Cancelar
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
