// pages/admin/users/index.vue

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { data: users, refresh } = await useFetch('/api/users')
const { swalConfirmation } = useSweetAlert()

const dialog = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const selectedUser = ref<any>(null)

const form = ref({
  role: '',
  status: true,
})

const roles = [
  { title: 'Admin', value: 'Admin' },
  { title: 'Superuser', value: 'Superuser' },
  { title: 'Abogado', value: 'Abogado' },
  { title: 'Recepcionista', value: 'Recepcionista' },
]

const roleColor: Record<string, string> = {
  Admin: 'error',
  Superuser: 'warning',
  Abogado: 'primary',
  Recepcionista: 'info',
}

const openDialog = (user: any) => {
  selectedUser.value = user
  form.value = {
    role: user.role,
    status: user.status,
  }
  errorMsg.value = ''
  dialog.value = true
}

const saveUser = async () => {
  loading.value = true
  errorMsg.value = ''

  try {
    await $fetch(`/api/users/${selectedUser.value._id}`, {
      method: 'PATCH',
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

const deleteUser = async (user: any) => {
  const confirmed = await swalConfirmation({
    title: '¿Eliminar usuario?',
    text: `¿Estás seguro de eliminar a "${user.username}"?`,
    icon: 'warning',
  })

  if (!confirmed)
    return

  await $fetch(`/api/users/${user._id}`, { method: 'DELETE' })
  await refresh()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Usuarios
      </h4>
    </div>

    <VCard>
      <VDataTable
        :headers="[
          { title: 'Usuario', key: 'username' },
          { title: 'Email', key: 'email' },
          { title: 'Rol', key: 'role' },
          { title: 'Estado', key: 'status' },
          { title: 'Último acceso', key: 'lastLogin' },
          { title: 'Acciones', key: 'actions', sortable: false },
        ]"
        :items="(users as any[]) || []"
        item-value="_id"
      >
        <!-- Usuario -->
        <template #item.username="{ item }">
          <div class="d-flex align-center gap-3">
            <VAvatar
              color="primary"
              variant="tonal"
              size="36"
            >
              <span>{{ item.username.charAt(0).toUpperCase() }}</span>
            </VAvatar>
            <span class="font-weight-medium">{{ item.username }}</span>
          </div>
        </template>

        <!-- Rol -->
        <template #item.role="{ item }">
          <VChip
            :color="roleColor[item.role]"
            size="small"
          >
            {{ item.role }}
          </VChip>
        </template>

        <!-- Estado -->
        <template #item.status="{ item }">
          <VChip
            :color="item.status ? 'success' : 'error'"
            size="small"
          >
            {{ item.status ? 'Activo' : 'Inactivo' }}
          </VChip>
        </template>

        <!-- Último acceso -->
        <template #item.lastLogin="{ item }">
          <span class="text-body-2">
            {{ item.lastLogin ? formatDate(item.lastLogin) : '—' }}
          </span>
        </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn
              icon
              size="x-small"
              variant="text"
              color="primary"
              @click="openDialog(item)"
            >
              <VIcon
                icon="tabler-edit"
                size="18"
              />
            </VBtn>
            <VBtn
              icon
              size="x-small"
              variant="text"
              color="error"
              @click="deleteUser(item)"
            >
              <VIcon
                icon="tabler-trash"
                size="18"
              />
            </VBtn>
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog editar usuario -->
    <VDialog
      v-model="dialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="pa-6">
          Editar usuario — {{ selectedUser?.username }}
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppSelect
                v-model="form.role"
                label="Rol"
                :items="roles"
              />
            </VCol>
            <VCol cols="12">
              <div class="d-flex align-center gap-3">
                <span class="text-body-2">Estado:</span>
                <VSwitch
                  v-model="form.status"
                  :label="form.status ? 'Activo' : 'Inactivo'"
                  color="success"
                  hide-details
                />
              </div>
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
            @click="saveUser"
          >
            Guardar
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
