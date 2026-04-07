// pages/admin/lawyers/index.vue

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { data: lawyers, refresh } = await useFetch('/api/lawyers')
const { data: specialties } = await useFetch('/api/specialties')
const { swalConfirmation } = useSweetAlert()

const dialog = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const editingId = ref<string | null>(null)

const form = ref({
  name: '',
  email: '',
  phone: '',
  specialties: [] as string[],
})

const openDialog = (lawyer?: any) => {
  errorMsg.value = ''
  if (lawyer) {
    editingId.value = lawyer._id
    form.value = {
      name: lawyer.name,
      email: lawyer.email,
      phone: lawyer.phone || '',
      specialties: lawyer.specialties.map((s: any) => s._id),
    }
  }
  else {
    editingId.value = null
    form.value = { name: '', email: '', phone: '', specialties: [] }
  }
  dialog.value = true
}

const saveLawyer = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    if (editingId.value) {
      await $fetch(`/api/lawyers/${editingId.value}`, {
        method: 'PATCH',
        body: form.value,
      })
    }
    else {
      await $fetch('/api/lawyers', {
        method: 'POST',
        body: form.value,
      })
    }
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

const deleteLawyer = async (lawyer: any) => {
  const confirmed = await swalConfirmation({
    title: '¿Eliminar abogado?',
    text: `¿Estás seguro de eliminar a "${lawyer.name}"?`,
    icon: 'warning',
  })

  if (!confirmed)
    return

  await $fetch(`/api/lawyers/${lawyer._id}`, { method: 'DELETE' })
  await refresh()
}

const specialtyColor = (id: string) => {
  const s = (specialties.value as any[])?.find((s: any) => s._id === id)

  return s?.color || '#7367F0'
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Abogados
      </h4>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="openDialog"
      >
        Nuevo abogado
      </VBtn>
    </div>

    <!-- Lista -->
    <VRow>
      <VCol
        v-for="lawyer in (lawyers as any[])"
        :key="lawyer._id"
        cols="12"
        sm="6"
        md="4"
      >
        <VCard>
          <VCardText>
            <div class="d-flex align-center gap-4 mb-4">
              <VAvatar
                color="primary"
                variant="tonal"
                size="48"
              >
                <span class="text-h6">{{ lawyer.name.charAt(0) }}</span>
              </VAvatar>
              <div>
                <p class="font-weight-semibold mb-0">
                  {{ lawyer.name }}
                </p>
                <p class="text-body-2 text-disabled mb-0">
                  {{ lawyer.email }}
                </p>
              </div>
            </div>

            <!-- Teléfono -->
            <div
              v-if="lawyer.phone"
              class="d-flex align-center gap-2 mb-2"
            >
              <VIcon
                icon="tabler-phone"
                size="16"
              />
              <span class="text-body-2">{{ lawyer.phone }}</span>
            </div>

            <!-- Especialidades -->
            <div class="d-flex flex-wrap gap-2 mb-4">
              <VChip
                v-for="specialty in lawyer.specialties"
                :key="specialty._id"
                size="small"
                :style="`background: ${specialty.color}20; color: ${specialty.color};`"
              >
                {{ specialty.name }}
              </VChip>
              <span
                v-if="!lawyer.specialties?.length"
                class="text-body-2 text-disabled"
              >
                Sin especialidades
              </span>
            </div>

            <!-- Tareas asignadas -->
            <div class="d-flex align-center gap-2">
              <VIcon
                icon="tabler-briefcase"
                size="16"
              />
              <span class="text-body-2">{{ lawyer.assignedLeads?.length || 0 }} leads asignados</span>
            </div>
          </VCardText>

          <VDivider />

          <VCardActions>
            <VBtn
              size="small"
              variant="text"
              prepend-icon="tabler-edit"
              @click="openDialog(lawyer)"
            >
              Editar
            </VBtn>
            <VSpacer />
            <VBtn
              size="small"
              variant="text"
              color="error"
              prepend-icon="tabler-trash"
              @click="deleteLawyer(lawyer)"
            >
              Eliminar
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>

      <VCol
        v-if="!(lawyers as any[])?.length"
        cols="12"
      >
        <VCard>
          <VCardText class="text-center text-disabled pa-10">
            No hay abogados registrados
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Dialog -->
    <VDialog
      v-model="dialog"
      max-width="600"
    >
      <VCard>
        <VCardTitle class="pa-6">
          {{ editingId ? 'Editar abogado' : 'Nuevo abogado' }}
        </VCardTitle>
        <VCardText>
          <VForm @submit.prevent="saveLawyer">
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.name"
                  label="Nombre completo"
                  placeholder="Juan García"
                  autofocus
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.email"
                  label="Email"
                  type="email"
                  placeholder="juan@despacho.com"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="form.phone"
                  label="Teléfono"
                  placeholder="+34 600 000 000"
                />
              </VCol>
              <VCol cols="12">
                <AppSelect
                  v-model="form.specialties"
                  label="Especialidades"
                  :items="((specialties as any[]) || [])?.map((s: any) => ({ title: s.name, value: s._id }))"
                  multiple
                  chips
                />
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
            @click="saveLawyer"
          >
            {{ editingId ? 'Actualizar' : 'Guardar' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
