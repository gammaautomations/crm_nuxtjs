<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { data: users, refresh } = await useFetch('/api/users')
const { swalConfirmation } = useSweetAlert()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.role === 'Admin')
const search = ref('')

const viewMode = ref<'card' | 'table'>('card')

const filteredUsers = computed(() => {
  const list = (users.value as any[]) || []

  const filtered = search.value
    ? list.filter((u: any) =>
      u.username.toLowerCase().includes(search.value.toLowerCase())
        || u.email.toLowerCase().includes(search.value.toLowerCase()),
    )
    : list

  return [...filtered].sort((a, b) => a.username.localeCompare(b.username))
})

const dialog = ref(false)
const createDialog = ref(false)
const loading = ref(false)
const createLoading = ref(false)
const errorMsg = ref('')
const createErrorMsg = ref('')
const selectedUser = ref<any>(null)

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

const form = ref({ role: '', status: true })

const createForm = ref({
  username: '',
  email: '',
  password: '',
  role: 'Recepcionista',
})

const openDialog = (user: any) => {
  selectedUser.value = user
  form.value = { role: user.role, status: user.status }
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

const createUser = async () => {
  createLoading.value = true
  createErrorMsg.value = ''
  try {
    await $fetch('/api/users', {
      method: 'POST',
      body: createForm.value,
    })
    createDialog.value = false
    createForm.value = { username: '', email: '', password: '', role: 'Recepcionista' }
    await refresh()
  }
  catch (error: any) {
    createErrorMsg.value = error?.data?.message || 'Error al crear usuario'
  }
  finally {
    createLoading.value = false
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
  if (!date)
    return '—'

  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Usuarios
      </h4>
      <div class="d-flex gap-2">
        <VBtnToggle
          v-model="viewMode"
          mandatory
          variant="outlined"
          density="compact"
        >
          <VBtn
            value="card"
            icon
          >
            <VIcon icon="tabler-layout-grid" />
          </VBtn>
          <VBtn
            value="table"
            icon
          >
            <VIcon icon="tabler-list" />
          </VBtn>
        </VBtnToggle>
        <VBtn
          v-if="isAdmin"
          color="primary"
          prepend-icon="tabler-plus"
          @click="createDialog = true"
        >
          Nuevo usuario
        </VBtn>
      </div>
    </div>

    <!-- Búsqueda -->
    <VCard class="mb-6">
      <VCardText>
        <AppTextField
          v-model="search"
          label="Buscar usuario"
          placeholder="Nombre o email..."
          prepend-inner-icon="tabler-search"
          clearable
        />
      </VCardText>
    </VCard>

    <!-- Cards -->
    <VRow v-if="viewMode === 'card'">
      <VCol
        v-for="user in filteredUsers"
        :key="user._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <VCard height="100%">
          <VCardText class="d-flex flex-column align-center text-center pa-6">
            <VAvatar
              color="primary"
              variant="tonal"
              size="72"
              class="mb-4"
            >
              <span class="text-h4">{{ user.username.charAt(0).toUpperCase() }}</span>
            </VAvatar>

            <p class="font-weight-semibold text-h6 mb-1">
              {{ user.username }}
            </p>
            <p class="text-body-2 text-disabled mb-3">
              {{ user.email }}
            </p>

            <div class="d-flex gap-2 mb-4">
              <VChip
                :color="roleColor[user.role]"
                size="small"
              >
                {{ user.role }}
              </VChip>
              <VChip
                :color="user.status ? 'success' : 'error'"
                size="small"
              >
                {{ user.status ? 'Activo' : 'Inactivo' }}
              </VChip>
            </div>

            <p class="text-caption text-disabled mb-0">
              Último acceso: {{ formatDate(user.lastLogin) }}
            </p>
          </VCardText>

          <VDivider />

          <VCardActions class="justify-center">
            <VBtn
              size="small"
              variant="text"
              prepend-icon="tabler-edit"
              @click="openDialog(user)"
            >
              Editar
            </VBtn>
            <VBtn
              size="small"
              variant="text"
              color="error"
              prepend-icon="tabler-trash"
              @click="deleteUser(user)"
            >
              Eliminar
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>

      <VCol
        v-if="!filteredUsers.length"
        cols="12"
      >
        <VCard>
          <VCardText class="text-center text-disabled pa-10">
            No se encontraron usuarios
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Tabla -->
    <VCard v-if="viewMode === 'table'">
      <VDataTable
        :headers="[
          { title: 'Usuario', key: 'username' },
          { title: 'Email', key: 'email' },
          { title: 'Rol', key: 'role' },
          { title: 'Estado', key: 'status' },
          { title: 'Último acceso', key: 'lastLogin' },
          { title: 'Acciones', key: 'actions', sortable: false },
        ]"
        :items="filteredUsers"
        item-value="_id"
      >
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
        <template #item.role="{ item }">
          <VChip
            :color="roleColor[item.role]"
            size="small"
          >
            {{ item.role }}
          </VChip>
        </template>
        <template #item.status="{ item }">
          <VChip
            :color="item.status ? 'success' : 'error'"
            size="small"
          >
            {{ item.status ? 'Activo' : 'Inactivo' }}
          </VChip>
        </template>
        <template #item.lastLogin="{ item }">
          <span class="text-body-2">{{ formatDate(item.lastLogin) }}</span>
        </template>
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

    <!-- Dialog editar -->
    <VDialog
      v-model="dialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="pa-6">
          Editar — {{ selectedUser?.username }}
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

    <!-- Dialog crear -->
    <VDialog
      v-model="createDialog"
      max-width="500"
    >
      <VCard>
        <VCardTitle class="pa-6">
          Nuevo usuario
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="createForm.username"
                label="Username"
                placeholder="juangarcia"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="createForm.email"
                label="Email"
                type="email"
                placeholder="juan@despacho.com"
              />
            </VCol>
            <VCol cols="12">
              <AppTextField
                v-model="createForm.password"
                label="Contraseña"
                type="password"
                placeholder="Min. 8 caracteres"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="createForm.role"
                label="Rol"
                :items="roles"
              />
            </VCol>
            <VCol
              v-if="createErrorMsg"
              cols="12"
            >
              <VAlert
                type="error"
                density="compact"
              >
                {{ createErrorMsg }}
              </VAlert>
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="createDialog = false"
          >
            Cancelar
          </VBtn>
          <VBtn
            color="primary"
            :loading="createLoading"
            @click="createUser"
          >
            Crear
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
