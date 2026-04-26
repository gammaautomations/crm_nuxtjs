<script setup lang="ts">
// pages/templates/new.vue
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

definePageMeta({ middleware: ['auth'] })

const router  = useRouter()
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  name:        '',
  description: '',
  type:        'contrato',
  active:      true,
})

const typeItems = [
  { title: 'Contrato',         value: 'contrato' },
  { title: 'Escrito judicial', value: 'escrito_judicial' },
  { title: 'Carta al cliente', value: 'carta_cliente' },
  { title: 'Otro',             value: 'otro' },
]

// ─── Editor TipTap ────────────────────────────────────────────────────────────
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ placeholder: 'Escribe el contenido de la plantilla aquí...\n\nUsa {{variable}} para insertar variables dinámicas.\nEjemplo: {{cliente_nombre}}, {{expediente_numero}}, {{fecha_hoy}}' }),
  ],
  content: '',
  editorProps: {
    attributes: { class: 'tiptap-editor' },
  },
})

onBeforeUnmount(() => editor.value?.destroy())

// Variables predefinidas
const predefinedVars = [
  'cliente_nombre', 'cliente_email', 'cliente_telefono',
  'expediente_numero', 'expediente_titulo', 'expediente_tipo',
  'expediente_juzgado', 'expediente_procedimiento', 'expediente_contrario',
  'abogado_nombre', 'abogado_email', 'fecha_hoy',
]

const insertVar = (varName: string) => {
  editor.value?.chain().focus().insertContent(`{{${varName}}}`).run()
}

// ─── Guardar ──────────────────────────────────────────────────────────────────
const save = async () => {
  errorMsg.value = ''

  if (!form.value.name.trim()) {
    errorMsg.value = 'El nombre es requerido'
    return
  }

  const content = editor.value?.getHTML() || ''
  if (!content || content === '<p></p>') {
    errorMsg.value = 'El contenido es requerido'
    return
  }

  loading.value = true
  try {
    const created = await $fetch<any>('/api/templates', {
      method: 'POST',
      body:   { ...form.value, content },
    })
    await router.push(`/templates/${created._id}`)
  }
  catch (e: any) {
    errorMsg.value = e?.data?.message || 'Error al crear la plantilla'
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
          @click="router.push('/templates')"
        />
        <h4 class="text-h4">
          Nueva plantilla
        </h4>
      </div>
      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          color="secondary"
          @click="router.push('/templates')"
        >
          Cancelar
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          prepend-icon="tabler-device-floppy"
          @click="save"
        >
          Guardar plantilla
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
        <!-- Datos básicos -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Datos de la plantilla
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Nombre *"
                  placeholder="Ej: Contrato de servicios jurídicos"
                  autofocus
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.description"
                  label="Descripción"
                  placeholder="Descripción breve de la plantilla"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppSelect
                  v-model="form.type"
                  label="Tipo"
                  :items="typeItems"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
                class="d-flex align-center"
              >
                <VSwitch
                  v-model="form.active"
                  label="Plantilla activa"
                  color="primary"
                  hide-details
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Editor -->
        <VCard>
          <VCardTitle class="pa-6 pb-2">
            Contenido
          </VCardTitle>
          <VCardText>
            <!-- Barra de herramientas -->
            <div
              v-if="editor"
              class="editor-toolbar d-flex flex-wrap gap-1 mb-3 pa-2 rounded"
            >
              <VBtn
                size="x-small"
                :variant="editor.isActive('bold') ? 'flat' : 'text'"
                icon="tabler-bold"
                @click="editor.chain().focus().toggleBold().run()"
              />
              <VBtn
                size="x-small"
                :variant="editor.isActive('italic') ? 'flat' : 'text'"
                icon="tabler-italic"
                @click="editor.chain().focus().toggleItalic().run()"
              />
              <VBtn
                size="x-small"
                :variant="editor.isActive('heading', { level: 1 }) ? 'flat' : 'text'"
                icon="tabler-h-1"
                @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
              />
              <VBtn
                size="x-small"
                :variant="editor.isActive('heading', { level: 2 }) ? 'flat' : 'text'"
                icon="tabler-h-2"
                @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
              />
              <VBtn
                size="x-small"
                :variant="editor.isActive('bulletList') ? 'flat' : 'text'"
                icon="tabler-list"
                @click="editor.chain().focus().toggleBulletList().run()"
              />
              <VBtn
                size="x-small"
                :variant="editor.isActive('orderedList') ? 'flat' : 'text'"
                icon="tabler-list-numbers"
                @click="editor.chain().focus().toggleOrderedList().run()"
              />
              <VDivider
                vertical
                class="mx-1"
              />
              <VBtn
                size="x-small"
                variant="text"
                icon="tabler-arrow-back-up"
                @click="editor.chain().focus().undo().run()"
              />
              <VBtn
                size="x-small"
                variant="text"
                icon="tabler-arrow-forward-up"
                @click="editor.chain().focus().redo().run()"
              />
            </div>

            <!-- Editor content -->
            <EditorContent
              :editor="editor"
              class="editor-content"
            />
          </VCardText>
        </VCard>
      </VCol>

      <!-- Columna lateral -->
      <VCol
        cols="12"
        md="4"
      >
        <!-- Variables disponibles -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Variables disponibles
          </VCardTitle>
          <VCardText>
            <p class="text-body-2 text-disabled mb-3">
              Haz click para insertar en el documento:
            </p>
            <div class="d-flex flex-wrap gap-2">
              <VChip
                v-for="v in predefinedVars"
                :key="v"
                size="small"
                color="primary"
                variant="outlined"
                style="cursor: pointer"
                @click="insertVar(v)"
              >
                {{ v }}
              </VChip>
            </div>
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
              Guardar plantilla
            </VBtn>
            <VBtn
              block
              variant="text"
              color="secondary"
              @click="router.push('/templates')"
            >
              Cancelar
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style scoped>
.editor-toolbar {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.editor-content {
  min-block-size: 400px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 16px;
}

.editor-content :deep(.ProseMirror) {
  min-block-size: 370px;
  outline: none;
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: rgba(var(--v-theme-on-surface), 0.38);
  content: attr(data-placeholder);
  float: inline-start;
  pointer-events: none;
  block-size: 0;
}
</style>
