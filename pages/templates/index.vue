<script setup lang="ts">
// pages/templates/index.vue
definePageMeta({ middleware: ['auth'] })

const { swalConfirmation } = useSweetAlert()
const router = useRouter()

const { data, refresh, pending } = await useFetch<any[]>('/api/templates', {
  query: { active: 'all' },
})

const templates = computed(() => data.value || [])

const typeLabel: Record<string, string> = {
  contrato:        'Contrato',
  escrito_judicial: 'Escrito judicial',
  carta_cliente:   'Carta al cliente',
  otro:            'Otro',
}

const typeColor: Record<string, string> = {
  contrato:        'primary',
  escrito_judicial: 'error',
  carta_cliente:   'info',
  otro:            'secondary',
}

const formatDate = (d: string) =>
  d ? new Intl.DateTimeFormat('es-ES').format(new Date(d)) : '—'

const deleteTemplate = async (tpl: any) => {
  const confirmed = await swalConfirmation({
    title: '¿Eliminar plantilla?',
    text:  `Se eliminará "${tpl.name}" permanentemente.`,
    icon:  'warning',
  })
  if (!confirmed) return
  await $fetch(`/api/templates/${tpl._id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Plantillas de documentos
      </h4>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="router.push('/templates/new')"
      >
        Nueva plantilla
      </VBtn>
    </div>

    <VRow v-if="!pending && templates.length">
      <VCol
        v-for="tpl in templates"
        :key="tpl._id"
        cols="12"
        sm="6"
        lg="4"
      >
        <VCard height="100%">
          <VCardText>
            <div class="d-flex align-center justify-space-between mb-3">
              <VChip
                :color="typeColor[tpl.type]"
                size="small"
                label
              >
                {{ typeLabel[tpl.type] || tpl.type }}
              </VChip>
              <VChip
                :color="tpl.active ? 'success' : 'default'"
                size="x-small"
              >
                {{ tpl.active ? 'Activa' : 'Inactiva' }}
              </VChip>
            </div>

            <h6 class="text-h6 mb-1">
              {{ tpl.name }}
            </h6>
            <p
              v-if="tpl.description"
              class="text-body-2 text-disabled mb-3"
            >
              {{ tpl.description }}
            </p>

            <div
              v-if="tpl.variables?.length"
              class="mb-3"
            >
              <p class="text-caption text-disabled mb-1">
                Variables ({{ tpl.variables.length }}):
              </p>
              <div class="d-flex flex-wrap gap-1">
                <VChip
                  v-for="v in tpl.variables.slice(0, 4)"
                  :key="v"
                  size="x-small"
                  variant="outlined"
                >
                  {{ v }}
                </VChip>
                <VChip
                  v-if="tpl.variables.length > 4"
                  size="x-small"
                  variant="outlined"
                >
                  +{{ tpl.variables.length - 4 }}
                </VChip>
              </div>
            </div>

            <p class="text-caption text-disabled mb-0">
              Creada el {{ formatDate(tpl.createdAt) }}
            </p>
          </VCardText>

          <VCardActions class="px-4 pb-4 pt-0">
            <VBtn
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="tabler-eye"
              @click="router.push(`/templates/${tpl._id}`)"
            >
              Ver / Usar
            </VBtn>
            <VBtn
              variant="text"
              color="secondary"
              size="small"
              prepend-icon="tabler-edit"
              @click="router.push(`/templates/${tpl._id}/edit`)"
            >
              Editar
            </VBtn>
            <VSpacer />
            <VBtn
              variant="text"
              color="error"
              size="small"
              icon="tabler-trash"
              @click="deleteTemplate(tpl)"
            />
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>

    <VCard
      v-else-if="!pending && !templates.length"
      class="text-center pa-10"
    >
      <VIcon
        icon="tabler-file-off"
        size="48"
        class="mb-3 text-disabled"
      />
      <p class="text-disabled mb-4">
        No hay plantillas todavía
      </p>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="router.push('/templates/new')"
      >
        Crear primera plantilla
      </VBtn>
    </VCard>

    <div
      v-else
      class="d-flex justify-center pa-10"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>
  </div>
</template>
