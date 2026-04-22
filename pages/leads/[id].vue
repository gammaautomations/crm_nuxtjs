<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()

const { data: lead, refresh } = await useFetch(`/api/leads/${route.params.id}`)

const { data: lawyers } = await useFetch('/api/lawyers')
const lawyersList = computed(() => (lawyers.value as any[]) || [])

const scoreColor = (score: number) => {
  if (score >= 8)
    return 'error'
  if (score >= 6)
    return 'warning'
  if (score >= 4)
    return 'info'

  return 'secondary'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Asignar abogado
const assignDialog = ref(false)
const selectedLawyer = ref('')
const assignLoading = ref(false)

const openAssignDialog = () => {
  selectedLawyer.value = (lead.value as any)?.assignedLawyer?._id || ''
  assignDialog.value = true
}

const assignLawyer = async () => {
  assignLoading.value = true
  try {
    await $fetch(`/api/leads/${route.params.id}/assign`, {
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

// Cambiar estado
const statusDialog = ref(false)
const selectedStatus = ref('')
const statusLoading = ref(false)

const statusOptions = [
  { title: 'Nuevo', value: 'nuevo' },
  { title: 'Contactado', value: 'contactado' },
  { title: 'En proceso', value: 'en_proceso' },
  { title: 'Cerrado', value: 'cerrado' },
  { title: 'Descartado', value: 'descartado' },
]

const statusColor: Record<string, string> = {
  nuevo: 'info',
  contactado: 'warning',
  en_proceso: 'primary',
  cerrado: 'success',
  descartado: 'error',
}

const openStatusDialog = () => {
  selectedStatus.value = (lead.value as any)?.status || 'nuevo'
  statusDialog.value = true
}

const changeStatus = async () => {
  statusLoading.value = true
  try {
    await $fetch(`/api/leads/${route.params.id}/status`, {
      method: 'PATCH',
      body: { status: selectedStatus.value },
    })
    statusDialog.value = false
    await refresh()
  }
  catch (error: any) {
    console.error(error)
  }
  finally {
    statusLoading.value = false
  }
}

const newComment = ref('')
const commentLoading = ref(false)

const addComment = async () => {
  if (!newComment.value.trim())
    return
  commentLoading.value = true
  try {
    await $fetch(`/api/leads/${route.params.id}/comments`, {
      method: 'POST',
      body: { text: newComment.value },
    })
    newComment.value = ''
    await refresh()
  }
  catch (error: any) {
    console.error(error)
  }
  finally {
    commentLoading.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="!pending && lead">
      <!-- Header -->
      <div class="d-flex align-center gap-2 mb-6 flex-wrap">
        <VBtn
          icon
          variant="text"
          color="secondary"
          @click="router.back()"
        >
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
        <h4 class="text-h4">
          {{ (lead as any).nombre }}
        </h4>
        <VChip
          :color="scoreColor((lead as any).lead_score)"
          class="ms-2"
        >
          Score: {{ (lead as any).lead_score }}
        </VChip>
        <VChip
          :color="statusColor[(lead as any).status]"
          variant="outlined"
          class="ms-1"
          style="cursor: pointer;"
          @click="openStatusDialog"
        >
          {{ (lead as any).status }}
          <VIcon
            icon="tabler-pencil"
            size="14"
            class="ms-1"
          />
        </VChip>

        <VSpacer />

        <div class="d-flex gap-2">
          <VBtn
            v-if="(lead as any).telefono"
            :href="`tel:${(lead as any).telefono}`"
            color="success"
            variant="outlined"
            size="small"
            prepend-icon="tabler-phone"
          >
            Llamar
          </VBtn>
          <WhatsAppButton
            v-if="(lead as any).telefono"
            :phone="(lead as any).telefono"
            :message="`Hola ${(lead as any).nombre}, le contactamos desde el despacho Garriga & Asociados respecto a su consulta sobre ${(lead as any).area}.`"
            size="small"
          />
          <VBtn
            color="primary"
            size="small"
            prepend-icon="tabler-user-check"
            @click="openAssignDialog"
          >
            {{ (lead as any).assignedLawyer ? 'Reasignar' : 'Asignar abogado' }}
          </VBtn>
        </div>
      </div>

      <VRow>
        <!-- Columna izquierda -->
        <VCol
          cols="12"
          md="4"
        >
          <!-- Datos de contacto -->
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Contacto
              </p>
              <VList>
                <VListItem v-if="(lead as any).nombre">
                  <template #prepend>
                    <VIcon
                      icon="tabler-user"
                      class="me-3"
                    />
                  </template>
                  <VListItemTitle>{{ (lead as any).nombre }}</VListItemTitle>
                </VListItem>
                <VListItem v-if="(lead as any).email">
                  <template #prepend>
                    <VIcon
                      icon="tabler-mail"
                      class="me-3"
                    />
                  </template>
                  <VListItemTitle>{{ (lead as any).email }}</VListItemTitle>
                </VListItem>
                <VListItem v-if="(lead as any).telefono">
                  <template #prepend>
                    <VIcon
                      icon="tabler-phone"
                      class="me-3"
                    />
                  </template>
                  <VListItemTitle>{{ (lead as any).telefono }}</VListItemTitle>
                </VListItem>
                <VListItem v-if="(lead as any).contacto">
                  <template #prepend>
                    <VIcon
                      icon="tabler-message"
                      class="me-3"
                    />
                  </template>
                  <VListItemTitle>Prefiere: {{ (lead as any).contacto }}</VListItemTitle>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>

          <!-- Abogado asignado -->
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Abogado asignado
              </p>
              <div
                v-if="(lead as any).assignedLawyer"
                class="d-flex align-center gap-3"
              >
                <VAvatar
                  color="primary"
                  variant="tonal"
                  size="48"
                >
                  <span class="text-h6">{{ (lead as any).assignedLawyer.name.charAt(0) }}</span>
                </VAvatar>
                <div>
                  <p class="font-weight-semibold mb-0">
                    {{ (lead as any).assignedLawyer.name }}
                  </p>
                  <p class="text-body-2 text-disabled mb-0">
                    {{ (lead as any).assignedLawyer.email }}
                  </p>
                  <p
                    v-if="(lead as any).assignedLawyer.phone"
                    class="text-body-2 text-disabled mb-0"
                  >
                    {{ (lead as any).assignedLawyer.phone }}
                  </p>
                </div>
              </div>
              <p
                v-else
                class="text-disabled"
              >
                Sin abogado asignado
              </p>
            </VCardText>
          </VCard>

          <!-- Fechas -->
          <VCard>
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Fechas
              </p>
              <VList>
                <VListItem>
                  <template #prepend>
                    <VIcon
                      icon="tabler-calendar"
                      class="me-3"
                    />
                  </template>
                  <VListItemTitle class="text-body-2">
                    Recibido: {{ formatDate((lead as any).createdAt) }}
                  </VListItemTitle>
                </VListItem>
                <VListItem v-if="(lead as any).fecha_plazo">
                  <template #prepend>
                    <VIcon
                      icon="tabler-calendar-due"
                      class="me-3"
                      color="error"
                    />
                  </template>
                  <VListItemTitle class="text-body-2">
                    Plazo: {{ (lead as any).fecha_plazo }}
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Columna derecha -->
        <VCol
          cols="12"
          md="8"
        >
          <!-- Análisis IA -->
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Análisis IA
              </p>
              <VRow>
                <VCol
                  cols="12"
                  sm="4"
                >
                  <div class="text-center pa-4 rounded bg-surface">
                    <p
                      class="text-h3 font-weight-bold mb-1"
                      :class="`text-${scoreColor((lead as any).lead_score)}`"
                    >
                      {{ (lead as any).lead_score }}
                    </p>
                    <p class="text-body-2 text-disabled">
                      Score
                    </p>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="4"
                >
                  <div class="text-center pa-4 rounded bg-surface">
                    <p class="text-h6 font-weight-bold mb-1">
                      {{ (lead as any).nivel_urgencia || '—' }}
                    </p>
                    <p class="text-body-2 text-disabled">
                      Urgencia
                    </p>
                  </div>
                </VCol>
                <VCol
                  cols="12"
                  sm="4"
                >
                  <div class="text-center pa-4 rounded bg-surface">
                    <p class="text-h6 font-weight-bold mb-1">
                      {{ (lead as any).area_detectada || '—' }}
                    </p>
                    <p class="text-body-2 text-disabled">
                      Área detectada
                    </p>
                  </div>
                </VCol>
              </VRow>

              <VDivider class="my-4" />

              <div
                v-if="(lead as any).resumen_ejecutivo"
                class="mb-4"
              >
                <p class="font-weight-medium mb-2">
                  Resumen ejecutivo
                </p>
                <p class="text-body-2">
                  {{ (lead as any).resumen_ejecutivo }}
                </p>
              </div>

              <div v-if="(lead as any).accion_recomendada">
                <p class="font-weight-medium mb-2">
                  Acción recomendada
                </p>
                <VAlert
                  type="info"
                  variant="tonal"
                  density="compact"
                >
                  {{ (lead as any).accion_recomendada }}
                </VAlert>
              </div>
            </VCardText>
          </VCard>

          <!-- Descripción del caso -->
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Descripción del caso
              </p>
              <VRow>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <p class="text-body-2 text-disabled mb-1">
                    Área
                  </p>
                  <VChip
                    size="small"
                    variant="outlined"
                  >
                    {{ (lead as any).area || '—' }}
                  </VChip>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <p class="text-body-2 text-disabled mb-1">
                    Motivo
                  </p>
                  <p class="text-body-2">
                    {{ (lead as any).motivo || '—' }}
                  </p>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <p class="text-body-2 text-disabled mb-1">
                    Urgencia
                  </p>
                  <p class="text-body-2">
                    {{ (lead as any).urgencia || '—' }}
                  </p>
                </VCol>
                <VCol
                  cols="12"
                  sm="6"
                >
                  <p class="text-body-2 text-disabled mb-1">
                    Documentos
                  </p>
                  <p class="text-body-2">
                    {{ (lead as any).documentos || '—' }}
                  </p>
                </VCol>
                <VCol cols="12">
                  <p class="text-body-2 text-disabled mb-1">
                    Descripción
                  </p>
                  <p class="text-body-2">
                    {{ (lead as any).descripcion || '—' }}
                  </p>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Historial de actividad -->
          <VCard>
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Historial de actividad
              </p>
              <div v-if="(lead as any).activity?.length">
                <div
                  v-for="(item, index) in [...(lead as any).activity].reverse()"
                  :key="index"
                  class="d-flex gap-3 mb-4"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                    size="36"
                    class="flex-shrink-0"
                  >
                    <VIcon
                      icon="tabler-history"
                      size="18"
                    />
                  </VAvatar>
                  <div>
                    <p class="font-weight-medium mb-0">
                      {{ item.description }}
                    </p>
                    <p class="text-body-2 text-disabled mb-0">
                      {{ item.user?.username || 'Sistema' }} —
                      {{ new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                    </p>
                  </div>
                </div>
              </div>
              <p
                v-else
                class="text-disabled text-center pa-4"
              >
                Sin actividad registrada
              </p>
            </VCardText>
          </VCard>

          <!-- Comentarios -->
          <VCard class="mt-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Comentarios internos
              </p>

              <!-- Lista de comentarios -->
              <div
                v-if="(lead as any).comments?.length"
                class="mb-6"
              >
                <div
                  v-for="(comment, index) in [...(lead as any).comments].reverse()"
                  :key="index"
                  class="d-flex gap-3 mb-4"
                >
                  <VAvatar
                    color="secondary"
                    variant="tonal"
                    size="36"
                    class="flex-shrink-0"
                  >
                    <span>{{ comment.user?.username?.charAt(0).toUpperCase() || '?' }}</span>
                  </VAvatar>
                  <div class="flex-grow-1">
                    <div class="d-flex align-center gap-2 mb-1">
                      <span class="font-weight-medium text-body-2">{{ comment.user?.username || 'Usuario' }}</span>
                      <span class="text-caption text-disabled">
                        {{ new Date(comment.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                      </span>
                    </div>
                    <p
                      class="text-body-2 mb-0 pa-3 rounded"
                      style=" border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));background: rgba(var(--v-theme-surface-variant), 0.1);"
                    >
                      {{ comment.text }}
                    </p>
                  </div>
                </div>
              </div>
              <p
                v-else
                class="text-disabled text-center pa-4 mb-4"
              >
                Sin comentarios
              </p>

              <!-- Nuevo comentario -->
              <div class="d-flex gap-3">
                <VAvatar
                  color="primary"
                  variant="tonal"
                  size="36"
                  class="flex-shrink-0"
                >
                  <span>{{ authStore.user?.username?.charAt(0).toUpperCase() }}</span>
                </VAvatar>
                <div class="flex-grow-1">
                  <AppTextarea
                    v-model="newComment"
                    placeholder="Escribe un comentario interno..."
                    rows="2"
                    auto-grow
                    hide-details
                  />
                  <div class="d-flex justify-end mt-2">
                    <VBtn
                      color="primary"
                      size="small"
                      :loading="commentLoading"
                      :disabled="!newComment.trim()"
                      @click="addComment"
                    >
                      Comentar
                    </VBtn>
                  </div>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <div
      v-else
      class="d-flex justify-center pa-10"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>

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

    <!-- Dialog cambiar estado -->
    <VDialog
      v-model="statusDialog"
      max-width="400"
    >
      <VCard>
        <VCardTitle class="pa-6">
          Cambiar estado
        </VCardTitle>
        <VCardText>
          <AppSelect
            v-model="selectedStatus"
            label="Estado"
            :items="statusOptions"
          />
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="statusDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="statusLoading"
            @click="changeStatus"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
