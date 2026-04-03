<script setup lang="ts">
import { useSweetAlert } from '~/composables/utils/useSweetAlert'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()

const { swalConfirmation } = useSweetAlert()

const {
  contacts,
  pagination,
  search,
  statusFilter,
  sourceFilter,
  page,
  viewMode,
  pending,
  refresh,
  resetFilters,
} = useContacts()

const statusOptions = [
  { title: 'Todos', value: '' },
  { title: 'Lead', value: 'lead' },
  { title: 'Prospecto', value: 'prospect' },
  { title: 'Cliente', value: 'client' },
  { title: 'Inactivo', value: 'inactive' },
]

const sourceOptions = [
  { title: 'Todos', value: '' },
  { title: 'Manual', value: 'manual' },
  { title: 'Gmail', value: 'gmail' },
  { title: 'CSV', value: 'csv' },
  { title: 'Webhook', value: 'webhook' },
]

const statusColor: Record<string, string> = {
  lead: 'info',
  prospect: 'warning',
  client: 'success',
  inactive: 'error',
}

const sourceIcon: Record<string, string> = {
  manual: 'tabler-user',
  gmail: 'tabler-brand-google',
  csv: 'tabler-file-spreadsheet',
  webhook: 'tabler-webhook',
  other: 'tabler-dots',
}

// Columnas para la tabla
const headers = [
  { title: 'Contacto', key: 'fullName', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Teléfono', key: 'phone', sortable: false },
  { title: 'Empresa', key: 'company', sortable: true },
  { title: 'Estado', key: 'status', sortable: true },
  { title: 'Origen', key: 'source', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const deleteContact = async (contact: any) => {
  const confirmed = await swalConfirmation({
    title: '¿Eliminar contacto?',
    text: `¿Estás seguro de que quieres eliminar a ${contact.fullName || 'este contacto'}? Esta acción no se puede deshacer.`,
    icon: 'warning',
  })

  if (!confirmed)
    return

  try {
    await $fetch(`/api/contacts/${contact._id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (error: any) {
    console.error('Error eliminando contacto:', error)
  }
}

// 👇 Fuera de deleteContact
const importLoading = ref(false)

const importFromGmail = async () => {
  const authStore = useAuthStore()

  const confirmed = await swalConfirmation({
    title: '¿Importar contactos de Gmail?',
    text: 'Se importarán todos tus contactos de Gmail. Los existentes se actualizarán.',
    icon: 'info',
  })

  if (!confirmed)
    return

  importLoading.value = true

  try {
    await $fetch(useRuntimeConfig().public.n8nWebhookUrl, {
      method: 'POST',
      body: { userId: authStore.user?.id },
    })

    await refresh()
  }
  catch (error: any) {
    console.error('Error importando contactos:', error)
  }
  finally {
    importLoading.value = false
  }
}

const exportContacts = () => {
  window.open('/api/contacts/export', '_blank')
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Contactos
      </h4>
      <div class="d-flex gap-2">
        <!-- Toggle vista -->
        <VBtnToggle
          v-model="viewMode"
          density="compact"
          variant="outlined"
        >
          <VBtn
            value="table"
            icon="tabler-table"
            size="small"
          />
          <VBtn
            value="grid"
            icon="tabler-layout-grid"
            size="small"
          />
        </VBtnToggle>

        <!-- Importar Gmail -->
        <VBtn
          color="secondary"
          variant="outlined"
          prepend-icon="tabler-brand-google"
          :loading="importLoading"
          @click="importFromGmail"
        >
          Importar Gmail
        </VBtn>

        <!-- Importar Gmail -->
        <VBtn
          color="secondary"
          variant="outlined"
          prepend-icon="tabler-file-spreadsheet"
          @click="exportContacts"
        >
          Exportar CSV
        </VBtn>

        <!-- Nuevo contacto -->
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="router.push('/contacts/create')"
        >
          Nuevo contacto
        </VBtn>
      </div>
    </div>

    <!-- Filtros -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="search"
              label="Buscar"
              placeholder="Nombre o email..."
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="statusFilter"
              label="Estado"
              :items="statusOptions"
            />
          </VCol>
          <VCol
            cols="12"
            md="3"
          >
            <AppSelect
              v-model="sourceFilter"
              label="Origen"
              :items="sourceOptions"
            />
          </VCol>
          <VCol
            cols="12"
            md="2"
            class="d-flex align-center"
          >
            <VBtn
              variant="outlined"
              color="secondary"
              block
              @click="resetFilters"
            >
              Limpiar
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Vista tabla -->
    <VCard v-if="viewMode === 'table'">
      <VDataTable
        :headers="headers"
        :items="contacts"
        :loading="pending"
        item-value="_id"
        hide-default-footer
      >
        <!-- Contacto -->
        <template #item.fullName="{ item }">
          <div class="d-flex align-center gap-3">
            <VAvatar
              size="36"
              color="primary"
              variant="tonal"
            >
              <VImg
                v-if="item.avatar"
                :src="item.avatar"
              />
              <span
                v-else
                class="text-sm"
              >
                {{ item.fullName?.charAt(0) || '?' }}
              </span>
            </VAvatar>
            <div>
              <p class="font-weight-medium mb-0">
                {{ item.fullName || 'Sin nombre' }}
              </p>
            </div>
          </div>
        </template>

        <!-- Email -->
        <template #item.email="{ item }">
          <span class="text-body-2">{{ item.email || '—' }}</span>
        </template>

        <!-- Teléfono -->
        <template #item.phone="{ item }">
          <span class="text-body-2">{{ item.phone || '—' }}</span>
        </template>

        <!-- Empresa -->
        <template #item.company="{ item }">
          <span class="text-body-2">{{ item.company || '—' }}</span>
        </template>

        <!-- Estado -->
        <template #item.status="{ item }">
          <VChip
            :color="statusColor[item.status]"
            size="small"
          >
            {{ item.status }}
          </VChip>
        </template>

        <!-- Origen -->
        <template #item.source="{ item }">
          <VIcon
            :icon="sourceIcon[item.source] || 'tabler-dots'"
            size="20"
          />
        </template>

        <!-- Acciones -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1">
            <VBtn
              icon
              size="x-small"
              variant="text"
              color="primary"
              :to="`/contacts/${item._id}`"
            >
              <VIcon
                icon="tabler-eye"
                size="18"
              />
            </VBtn>
            <VBtn
              icon
              size="x-small"
              variant="text"
              color="secondary"
              :to="`/contacts/${item._id}/edit`"
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
              @click="deleteContact(item)"
            >
              <VIcon
                icon="tabler-trash"
                size="18"
              />
            </VBtn>
          </div>
        </template>
      </VDataTable>

      <!-- Paginación -->
      <VCardText class="d-flex align-center justify-space-between">
        <span class="text-body-2 text-disabled">
          Total: {{ pagination.total }} contactos
        </span>
        <VPagination
          v-model="page"
          :length="pagination.pages"
          :total-visible="5"
        />
      </VCardText>
    </VCard>

    <!-- Vista grid -->
    <VRow v-else>
      <VCol
        v-for="contact in contacts"
        :key="contact._id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <VCard>
          <VCardText class="text-center pt-6">
            <VAvatar
              size="64"
              color="primary"
              variant="tonal"
              class="mb-3"
            >
              <VImg
                v-if="contact.avatar"
                :src="contact.avatar"
              />
              <span
                v-else
                class="text-h6"
              >
                {{ contact.fullName?.charAt(0) || '?' }}
              </span>
            </VAvatar>
            <h6 class="text-h6 mb-1">
              {{ contact.fullName || 'Sin nombre' }}
            </h6>
            <p class="text-body-2 text-disabled mb-2">
              {{ contact.company || '—' }}
            </p>
            <VChip
              :color="statusColor[contact.status]"
              size="small"
            >
              {{ contact.status }}
            </VChip>
          </VCardText>

          <VDivider />

          <VCardText>
            <div class="d-flex align-center gap-2 mb-2">
              <VIcon
                icon="tabler-mail"
                size="16"
              />
              <span class="text-body-2">{{ contact.email || '—' }}</span>
            </div>
            <div class="d-flex align-center gap-2">
              <VIcon
                icon="tabler-phone"
                size="16"
              />
              <span class="text-body-2">{{ contact.phone || '—' }}</span>
            </div>
          </VCardText>

          <VCardActions>
            <VBtn
              variant="text"
              size="small"
              :to="`/contacts/${contact._id}`"
            >
              Ver detalle
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>

      <!-- Paginación grid -->
      <VCol
        cols="12"
        class="d-flex justify-center mt-4"
      >
        <VPagination
          v-model="page"
          :length="pagination.pages"
          :total-visible="5"
        />
      </VCol>
    </VRow>
  </div>
</template>
