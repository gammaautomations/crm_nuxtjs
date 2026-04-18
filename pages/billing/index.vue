<script setup lang="ts">
// pages/billing/index.vue
definePageMeta({
  middleware: ['auth'],
})

const { swalConfirmation } = useSweetAlert()

// ─── Filtros ──────────────────────────────────────────────────────────────────
const search = ref('')
const status = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const page = ref(1)
const limit = 20

// ─── Fetch ────────────────────────────────────────────────────────────────────
const { data, refresh, pending } = await useFetch('/api/invoices', {
  query: computed(() => ({
    page: page.value,
    limit,
    search: search.value || undefined,
    status: status.value || undefined,
    from: dateFrom.value || undefined,
    to: dateTo.value || undefined,
    sortBy: 'issuedAt',
    sortOrder: 'desc',
  })),
  watch: [page, search, status, dateFrom, dateTo],
})

const { data: statsData } = await useFetch('/api/invoices/stats')

const invoices = computed(() => (data.value as any)?.data || [])
const meta = computed(() => (data.value as any)?.meta || { total: 0, totalPages: 1 })
const stats = computed(() => (statsData.value as any)?.summary || {})

// ─── Debounce búsqueda ────────────────────────────────────────────────────────
let searchTimeout: ReturnType<typeof setTimeout>

const onSearch = (val: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { search.value = val; page.value = 1 }, 400)
}

const onFilterChange = () => { page.value = 1 }

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)

const formatDate = (d: string) =>
  d ? new Intl.DateTimeFormat('es-ES').format(new Date(d)) : '—'

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'default' },
  sent: { label: 'Enviada', color: 'info' },
  paid: { label: 'Pagada', color: 'success' },
  partial: { label: 'Pago parcial', color: 'warning' },
  overdue: { label: 'Vencida', color: 'error' },
  cancelled: { label: 'Cancelada', color: 'default' },
  void: { label: 'Anulada', color: 'default' },
}

const statusItems = [
  { title: 'Todos los estados', value: '' },
  ...Object.entries(statusConfig).map(([value, { label }]) => ({ title: label, value })),
]

// ─── Acciones ─────────────────────────────────────────────────────────────────
const loadingAction = ref<string | null>(null)

const downloadPdf = async (invoice: any) => {
  loadingAction.value = `pdf-${invoice._id}`
  try {
    const blob = await $fetch<Blob>(`/api/invoices/${invoice._id}/pdf`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')

    a.href = url
    a.download = `${invoice.number}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }
  catch (e: any) {
    console.error('Error descargando PDF:', e)
  }
  finally {
    loadingAction.value = null
  }
}

const sendInvoice = async (invoice: any) => {
  if (!invoice.client?.email) {
    alert('El cliente no tiene email registrado')

    return
  }

  const confirmed = await swalConfirmation({
    title: '¿Enviar factura?',
    text: `Se enviará la factura ${invoice.number} a ${invoice.client.email}`,
    icon: 'question',
  })

  if (!confirmed)
    return

  loadingAction.value = `send-${invoice._id}`
  try {
    await $fetch(`/api/invoices/${invoice._id}/send`, { method: 'POST' })
    await refresh()
  }
  catch (e: any) {
    console.error('Error enviando factura:', e)
  }
  finally {
    loadingAction.value = null
  }
}

const cancelInvoice = async (invoice: any) => {
  const confirmed = await swalConfirmation({
    title: '¿Cancelar factura?',
    text: `¿Estás seguro de cancelar la factura ${invoice.number}? Esta acción no se puede deshacer.`,
    icon: 'warning',
  })

  if (!confirmed)
    return

  loadingAction.value = `cancel-${invoice._id}`
  try {
    await $fetch(`/api/invoices/${invoice._id}`, { method: 'DELETE' })
    await refresh()
  }
  catch (e: any) {
    console.error('Error cancelando factura:', e)
  }
  finally {
    loadingAction.value = null
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Facturación
      </h4>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        to="/billing/new"
      >
        Nueva factura
      </VBtn>
    </div>

    <!-- KPIs -->
    <VRow class="mb-6">
      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              color="primary"
              variant="tonal"
              size="48"
            >
              <VIcon icon="tabler-file-invoice" />
            </VAvatar>
            <div>
              <p class="text-body-2 text-disabled mb-0">
                Total facturado
              </p>
              <h5 class="text-h5">
                {{ eur(stats.totalIssued) }}
              </h5>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              color="success"
              variant="tonal"
              size="48"
            >
              <VIcon icon="tabler-circle-check" />
            </VAvatar>
            <div>
              <p class="text-body-2 text-disabled mb-0">
                Cobrado
              </p>
              <h5 class="text-h5">
                {{ eur(stats.totalPaid) }}
              </h5>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              color="warning"
              variant="tonal"
              size="48"
            >
              <VIcon icon="tabler-clock" />
            </VAvatar>
            <div>
              <p class="text-body-2 text-disabled mb-0">
                Pendiente
              </p>
              <h5 class="text-h5">
                {{ eur(stats.totalPending) }}
              </h5>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center gap-4">
            <VAvatar
              color="error"
              variant="tonal"
              size="48"
            >
              <VIcon icon="tabler-alert-circle" />
            </VAvatar>
            <div>
              <p class="text-body-2 text-disabled mb-0">
                Vencido
              </p>
              <h5 class="text-h5">
                {{ eur(stats.totalOverdue) }}
              </h5>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Filtros -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            sm="4"
          >
            <AppTextField
              :model-value="search"
              label="Buscar"
              placeholder="Número, cliente, NIF..."
              prepend-inner-icon="tabler-search"
              clearable
              @update:model-value="onSearch"
            />
          </VCol>
          <VCol
            cols="12"
            sm="3"
          >
            <AppSelect
              v-model="status"
              label="Estado"
              :items="statusItems"
              @update:model-value="onFilterChange"
            />
          </VCol>
          <VCol
            cols="12"
            sm="2"
          >
            <AppTextField
              v-model="dateFrom"
              label="Desde"
              type="date"
              @update:model-value="onFilterChange"
            />
          </VCol>
          <VCol
            cols="12"
            sm="2"
          >
            <AppTextField
              v-model="dateTo"
              label="Hasta"
              type="date"
              @update:model-value="onFilterChange"
            />
          </VCol>
          <VCol
            cols="12"
            sm="1"
            class="d-flex align-end"
          >
            <VBtn
              variant="outlined"
              color="secondary"
              icon="tabler-refresh"
              @click="() => { search = ''; status = ''; dateFrom = ''; dateTo = ''; page = 1 }"
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Tabla -->
    <VCard>
      <VCardText class="pa-0">
        <!-- Loading -->
        <div
          v-if="pending"
          class="d-flex justify-center pa-10"
        >
          <VProgressCircular
            indeterminate
            color="primary"
          />
        </div>

        <!-- Sin resultados -->
        <div
          v-else-if="!invoices.length"
          class="text-center text-disabled pa-10"
        >
          <VIcon
            icon="tabler-file-off"
            size="48"
            class="mb-3"
          />
          <p class="mb-0">
            No hay facturas
          </p>
        </div>

        <!-- Lista -->
        <VTable v-else>
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Vencimiento</th>
              <th class="text-end">
                Importe
              </th>
              <th class="text-end">
                Pendiente
              </th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="invoice in invoices"
              :key="invoice._id"
              style="cursor: pointer;"
              @click="$router.push(`/billing/${invoice._id}`)"
            >
              <td>
                <span class="font-weight-semibold">{{ invoice.number }}</span>
              </td>
              <td>
                <div>
                  <p class="mb-0 font-weight-medium">
                    {{ invoice.client?.name }}
                  </p>
                  <p class="text-body-2 text-disabled mb-0">
                    {{ invoice.client?.nif }}
                  </p>
                </div>
              </td>
              <td>{{ formatDate(invoice.issuedAt) }}</td>
              <td>
                <span :class="invoice.status === 'overdue' ? 'text-error font-weight-semibold' : ''">
                  {{ invoice.dueDate ? formatDate(invoice.dueDate) : '—' }}
                </span>
              </td>
              <td class="text-end font-weight-semibold">
                {{ eur(invoice.total) }}
              </td>
              <td class="text-end">
                <span
                  v-if="invoice.amountDue > 0"
                  class="text-error font-weight-semibold"
                >
                  {{ eur(invoice.amountDue) }}
                </span>
                <span
                  v-else
                  class="text-success"
                >
                  Pagada
                </span>
              </td>
              <td>
                <VChip
                  :color="statusConfig[invoice.status]?.color"
                  size="small"
                  label
                >
                  {{ statusConfig[invoice.status]?.label || invoice.status }}
                </VChip>
              </td>
              <td @click.stop>
                <VBtn
                  icon
                  variant="text"
                  size="small"
                >
                  <VIcon icon="tabler-dots-vertical" />
                  <VMenu activator="parent">
                    <VList density="compact">
                      <VListItem
                        prepend-icon="tabler-eye"
                        title="Ver detalle"
                        :to="`/billing/${invoice._id}`"
                      />
                      <VListItem
                        v-if="invoice.status === 'draft'"
                        prepend-icon="tabler-edit"
                        title="Editar"
                        :to="`/billing/${invoice._id}/edit`"
                      />
                      <VListItem
                        prepend-icon="tabler-download"
                        title="Descargar PDF"
                        :disabled="loadingAction === `pdf-${invoice._id}`"
                        @click="downloadPdf(invoice)"
                      />
                      <VListItem
                        v-if="['draft', 'sent', 'overdue', 'partial'].includes(invoice.status)"
                        prepend-icon="tabler-send"
                        title="Enviar por email"
                        :disabled="loadingAction === `send-${invoice._id}`"
                        @click="sendInvoice(invoice)"
                      />
                      <VDivider class="my-1" />
                      <VListItem
                        v-if="['draft', 'sent', 'partial'].includes(invoice.status)"
                        prepend-icon="tabler-ban"
                        title="Cancelar factura"
                        class="text-error"
                        @click="cancelInvoice(invoice)"
                      />
                    </VList>
                  </VMenu>
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- Paginación -->
        <div
          v-if="meta.totalPages > 1"
          class="d-flex justify-center pa-4"
        >
          <VPagination
            v-model="page"
            :length="meta.totalPages"
            :total-visible="5"
          />
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
