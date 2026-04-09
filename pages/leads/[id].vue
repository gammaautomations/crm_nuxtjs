<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()

const { data: lead, pending } = await useFetch(`/api/leads/${route.params.id}`)

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
</script>

<template>
  <div v-if="!pending && lead">
    <!-- Header -->
    <div class="d-flex align-center gap-2 mb-6">
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
        variant="outlined"
        class="ms-1"
      >
        {{ (lead as any).status }}
      </VChip>
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

            <!-- Resumen ejecutivo -->
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

            <!-- Acción recomendada -->
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
</template>
