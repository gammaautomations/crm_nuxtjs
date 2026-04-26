<script setup lang="ts">
// pages/templates/[id]/index.vue
definePageMeta({ middleware: ['auth'] })

const params = useRoute().params
const router = useRouter()
const { swalConfirmation } = useSweetAlert()

const { data: tpl, refresh } = await useFetch<any>(`/api/templates/${params.id}`)

// Datos para el generador
const { data: casesData } = await useFetch<any>('/api/cases', {
  query: { limit: 100, status: 'open,in_progress' },
})
const cases = computed(() => casesData.value?.data || [])

// ─── Estado ───────────────────────────────────────────────────────────────────
const loadingGenerate  = ref(false)
const loadingAI        = ref(false)
const selectedCaseId   = ref('')
const aiInstructions   = ref('')
const aiResult         = ref('')
const manualVars       = ref<Record<string, string>>({})
const activeTab        = ref(0)

// Inicializar variables manuales cuando carga la plantilla
watch(tpl, (val) => {
  if (val?.variables) {
    const vars: Record<string, string> = {}
    for (const v of val.variables) vars[v] = ''
    manualVars.value = vars
  }
}, { immediate: true })

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeLabel: Record<string, string> = {
  contrato:         'Contrato',
  escrito_judicial: 'Escrito judicial',
  carta_cliente:    'Carta al cliente',
  otro:             'Otro',
}

const formatDate = (d: string) =>
  d ? new Intl.DateTimeFormat('es-ES').format(new Date(d)) : '—'

// ─── Generar Word ─────────────────────────────────────────────────────────────
const generateWord = async () => {
  loadingGenerate.value = true
  try {
    const response = await $fetch<Blob>(`/api/templates/${params.id}/generate`, {
      method:         'POST',
      body:           { caseId: selectedCaseId.value || undefined, variables: manualVars.value },
      responseType:   'blob',
    })

    const url  = URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href     = url
    link.download = `${tpl.value?.name}_${new Date().toISOString().split('T')[0]}.docx`
    link.click()
    URL.revokeObjectURL(url)
  }
  catch (e: any) {
    alert(e?.data?.message || 'Error al generar el documento')
  }
  finally {
    loadingGenerate.value = false
  }
}

// ─── Generar con IA ───────────────────────────────────────────────────────────
const generateAI = async () => {
  loadingAI.value = true
  aiResult.value  = ''
  try {
    const result = await $fetch<any>(`/api/templates/${params.id}/generate-ai`, {
      method: 'POST',
      body:   { caseId: selectedCaseId.value || undefined, instructions: aiInstructions.value },
    })
    aiResult.value = result.content
  }
  catch (e: any) {
    alert(e?.data?.message || 'Error al generar con IA')
  }
  finally {
    loadingAI.value = false
  }
}

const copyAIResult = () => {
  navigator.clipboard.writeText(aiResult.value)
}

// ─── Eliminar ─────────────────────────────────────────────────────────────────
const deleteTemplate = async () => {
  const confirmed = await swalConfirmation({
    title: '¿Eliminar plantilla?',
    text:  'Esta acción no se puede deshacer.',
    icon:  'warning',
  })
  if (!confirmed) return
  await $fetch(`/api/templates/${params.id}`, { method: 'DELETE' })
  await router.push('/templates')
}
</script>

<template>
  <div v-if="tpl">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap gap-3">
      <div class="d-flex align-center gap-3">
        <VBtn
          icon="tabler-arrow-left"
          variant="text"
          size="small"
          @click="router.push('/templates')"
        />
        <div>
          <h4 class="text-h4">
            {{ tpl.name }}
          </h4>
          <span class="text-body-2 text-disabled">{{ typeLabel[tpl.type] || tpl.type }}</span>
        </div>
      </div>
      <div class="d-flex gap-2">
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="tabler-edit"
          :to="`/templates/${tpl._id}/edit`"
        >
          Editar
        </VBtn>
        <VBtn
          variant="outlined"
          color="error"
          prepend-icon="tabler-trash"
          @click="deleteTemplate"
        >
          Eliminar
        </VBtn>
      </div>
    </div>

    <VRow>
      <!-- Columna principal -->
      <VCol
        cols="12"
        md="8"
      >
        <!-- Tabs -->
        <VTabs
          v-model="activeTab"
          class="mb-6"
        >
          <VTab :value="0">
            <VIcon
              icon="tabler-file-download"
              size="18"
              class="me-2"
            />
            Generar Word
          </VTab>
          <VTab :value="1">
            <VIcon
              icon="tabler-sparkles"
              size="18"
              class="me-2"
            />
            Generar con IA
          </VTab>
          <VTab :value="2">
            <VIcon
              icon="tabler-eye"
              size="18"
              class="me-2"
            />
            Vista previa
          </VTab>
        </VTabs>

        <VWindow v-model="activeTab">
          <!-- Generar Word -->
          <VWindowItem :value="0">
            <VCard>
              <VCardTitle class="pa-6 pb-2">
                Generar documento Word
              </VCardTitle>
              <VCardText>
                <!-- Seleccionar expediente -->
                <AppSelect
                  v-model="selectedCaseId"
                  label="Expediente (opcional)"
                  :items="cases.map((c: any) => ({ title: `${c.number} — ${c.title}`, value: c._id }))"
                  clearable
                  class="mb-4"
                  hint="Si seleccionas un expediente, las variables se rellenarán automáticamente"
                  persistent-hint
                />

                <!-- Variables manuales -->
                <div v-if="tpl.variables?.length">
                  <p class="text-body-2 font-weight-medium mb-3">
                    Variables del documento:
                  </p>
                  <VRow>
                    <VCol
                      v-for="varName in tpl.variables"
                      :key="varName"
                      cols="12"
                      sm="6"
                    >
                      <AppTextField
                        v-model="manualVars[varName]"
                        :label="varName"
                        :placeholder="'Valor para {{' + varName + '}}'"
                        density="compact"
                      />
                    </VCol>
                  </VRow>
                </div>

                <VBtn
                  color="primary"
                  class="mt-4"
                  prepend-icon="tabler-file-download"
                  :loading="loadingGenerate"
                  @click="generateWord"
                >
                  Descargar Word
                </VBtn>
              </VCardText>
            </VCard>
          </VWindowItem>

          <!-- Generar con IA -->
          <VWindowItem :value="1">
            <VCard>
              <VCardTitle class="pa-6 pb-2">
                Generar con Inteligencia Artificial
              </VCardTitle>
              <VCardText>
                <AppSelect
                  v-model="selectedCaseId"
                  label="Expediente (opcional)"
                  :items="cases.map((c: any) => ({ title: `${c.number} — ${c.title}`, value: c._id }))"
                  clearable
                  class="mb-4"
                />
                <AppTextarea
                  v-model="aiInstructions"
                  label="Instrucciones adicionales para la IA"
                  placeholder="Ej: El tono debe ser formal. Incluir cláusula de confidencialidad. El plazo es de 30 días..."
                  rows="3"
                  class="mb-4"
                />
                <VBtn
                  color="primary"
                  prepend-icon="tabler-sparkles"
                  :loading="loadingAI"
                  @click="generateAI"
                >
                  Generar con IA
                </VBtn>

                <!-- Resultado IA -->
                <div
                  v-if="aiResult"
                  class="mt-6"
                >
                  <div class="d-flex align-center justify-space-between mb-3">
                    <p class="font-weight-medium mb-0">
                      Documento generado:
                    </p>
                    <VBtn
                      size="small"
                      variant="outlined"
                      prepend-icon="tabler-copy"
                      @click="copyAIResult"
                    >
                      Copiar
                    </VBtn>
                  </div>
                  <div
                    class="pa-4 rounded"
                    style="background: rgba(var(--v-theme-surface-variant), 0.5); white-space: pre-wrap; font-family: inherit; max-height: 500px; overflow-y: auto;"
                  >
                    {{ aiResult }}
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VWindowItem>

          <!-- Vista previa -->
          <VWindowItem :value="2">
            <VCard>
              <VCardTitle class="pa-6 pb-2">
                Vista previa del contenido
              </VCardTitle>
              <VCardText>
                <div
                  class="template-preview pa-4 rounded"
                  v-html="tpl.content"
                />
              </VCardText>
            </VCard>
          </VWindowItem>
        </VWindow>
      </VCol>

      <!-- Columna lateral -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Información
          </VCardTitle>
          <VCardText>
            <div class="d-flex flex-column gap-3">
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-disabled">Tipo</span>
                <span>{{ typeLabel[tpl.type] || tpl.type }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-disabled">Estado</span>
                <VChip
                  :color="tpl.active ? 'success' : 'default'"
                  size="x-small"
                >
                  {{ tpl.active ? 'Activa' : 'Inactiva' }}
                </VChip>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-disabled">Variables</span>
                <span>{{ tpl.variables?.length || 0 }}</span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-disabled">Creada</span>
                <span>{{ formatDate(tpl.createdAt) }}</span>
              </div>
            </div>
          </VCardText>
        </VCard>

        <VCard v-if="tpl.variables?.length">
          <VCardTitle class="pa-6 pb-2">
            Variables
          </VCardTitle>
          <VCardText>
            <div class="d-flex flex-wrap gap-2">
              <VChip
                v-for="v in tpl.variables"
                :key="v"
                size="small"
                color="primary"
                variant="outlined"
              >
                {{ '{{' + v + '}}' }}
              </VChip>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.template-preview :deep(h1),
.template-preview :deep(h2),
.template-preview :deep(h3) {
  margin-block: 16px 8px;
}

.template-preview :deep(p) {
  margin-block-end: 8px;
  line-height: 1.6;
}

.template-preview :deep(ul),
.template-preview :deep(ol) {
  padding-inline-start: 24px;
  margin-block-end: 8px;
}
</style>
