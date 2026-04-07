// pages/admin/specialties/index.vue

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { data: specialties, refresh } = await useFetch('/api/specialties')
const { swalConfirmation } = useSweetAlert()

const dialog = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  name: '',
  description: '',
  color: '#7367F0',
})

const openDialog = () => {
  form.value = { name: '', description: '', color: '#7367F0' }
  errorMsg.value = ''
  dialog.value = true
}

const saveSpecialty = async () => {
  if (!form.value.name) {
    errorMsg.value = 'El nombre es requerido'

    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/specialties', {
      method: 'POST',
      body: form.value,
    })
    dialog.value = false
    await refresh()
  }
  catch (error: any) {
    errorMsg.value = error?.data?.message || 'Error al guardar'
  }
  finally {
    loading.value = false
  }
}

const deleteSpecialty = async (specialty: any) => {
  const confirmed = await swalConfirmation({
    title: '¿Eliminar especialidad?',
    text: `¿Estás seguro de eliminar "${specialty.name}"?`,
    icon: 'warning',
  })

  if (!confirmed)
    return

  await $fetch(`/api/specialties/${specialty._id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Especialidades
      </h4>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="openDialog"
      >
        Nueva especialidad
      </VBtn>
    </div>

    <!-- Lista -->
    <VRow>
      <VCol
        v-for="specialty in (specialties as any[])"
        :key="specialty._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <div
                class="rounded-circle"
                :style="`background: ${specialty.color}; width: 16px; height: 16px;`"
              />
              <div>
                <p class="font-weight-medium mb-0">
                  {{ specialty.name }}
                </p>
                <p class="text-body-2 text-disabled mb-0">
                  {{ specialty.description || '—' }}
                </p>
              </div>
            </div>
            <VBtn
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="deleteSpecialty(specialty)"
            >
              <VIcon
                icon="tabler-trash"
                size="18"
              />
            </VBtn>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        v-if="!(specialties as any[])?.length"
        cols="12"
      >
        <VCard>
          <VCardText class="text-center text-disabled pa-10">
            No hay especialidades creadas
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Dialog -->
    <VDialog
      v-model="dialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="pa-6">
          Nueva especialidad
        </VCardTitle>
        <VCardText>
          <VForm @submit.prevent="saveSpecialty">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="form.name"
                  label="Nombre"
                  placeholder="Derecho Penal"
                  autofocus
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="form.description"
                  label="Descripción"
                  placeholder="Descripción opcional..."
                />
              </VCol>
              <VCol cols="12">
                <label class="text-body-2 mb-2 d-block">Color</label>
                <input
                  v-model="form.color"
                  type="color"
                  class="w-100"
                  style=" border: 1px solid #ccc; border-radius: 8px;block-size: 40px; cursor: pointer;"
                >
              </VCol>
              <VCol
                v-if="errorMsg"
                cols="12"
              >
                <VAlert
                  type="error"
                  density="compact"
                >
                  {{ errorMsg }}
                </VAlert>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="dialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="loading"
            @click="saveSpecialty"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
