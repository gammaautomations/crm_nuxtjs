<script setup lang="ts">
import { IGIC_RATES } from '@/utils/igic'

definePageMeta({
  middleware: ['auth'],
})

const route = useRouter()
const params = useRoute().params
const isEdit = computed(() => !!params.id)

// ─── Datos auxiliares ─────────────────────────────────────────────────────────
const { data: contactsData } = await useFetch('/api/contacts?limit=200')
const { data: lawyersData } = await useFetch('/api/lawyers')
const { data: settingsData } = await useFetch('/api/settings')

const contacts = computed(() => (contactsData.value as any)?.data || contactsData.value || [])
const lawyers = computed(() => lawyersData.value || [])

const s = settingsData.value as any

// ─── Estado UI ────────────────────────────────────────────────────────────────
const loading = ref(false)
const errorMsg = ref('')

// ─── Emisor ───────────────────────────────────────────────────────────────────
const issuer = ref({
  name: s?.companyName || '',
  nif: s?.companyNif || '',
  email: s?.companyEmail || '',
  phone: s?.companyPhone || '',
  cabildoReg: s?.cabildoReg || '',
  address: {
    street: s?.companyAddress || '',
    city: s?.companyCity || '',
    zip: s?.companyZip || '',
    island: s?.companyIsland || '',
    province: s?.companyProvince || '',
    country: 'ES',
  },
})

// ─── Formulario principal ─────────────────────────────────────────────────────
const form = ref({
  series: 'F',
  type: 'invoice',
  status: 'draft',
  contactId: '',
  lawyerId: '',
  issuedAt: new Date().toISOString().split('T')[0],
  dueDate: '',
  notes: '',
  internalNotes: '',
})

// ─── Cliente ──────────────────────────────────────────────────────────────────
const client = ref({
  name: '',
  nif: '',
  email: '',
  phone: '',
  cabildoReg: '',
  address: { street: '', city: '', zip: '', island: '', province: '', country: 'ES' },
})

const onContactChange = (contactId: string) => {
  const contact = (contacts.value as any[]).find((c: any) => c._id === contactId)
  if (!contact)
    return
  client.value = {
    name: contact.name || '',
    nif: contact.nif || '',
    email: contact.email || '',
    phone: contact.phone || '',
    cabildoReg: contact.cabildoReg || '',
    address: {
      street: contact.address?.street || '',
      city: contact.address?.city || '',
      zip: contact.address?.zip || '',
      island: contact.address?.island || '',
      province: contact.address?.province || '',
      country: contact.address?.country || 'ES',
    },
  }
}

// ─── Líneas ───────────────────────────────────────────────────────────────────
interface Line {
  description: string
  quantity: number
  unitPrice: number
  igicRate: number
  discount: number
}

const lines = ref<Line[]>([
  { description: '', quantity: 1, unitPrice: 0, igicRate: 7, discount: 0 },
])

const addLine = () => lines.value.push({ description: '', quantity: 1, unitPrice: 0, igicRate: 7, discount: 0 })

const removeLine = (i: number) => {
  if (lines.value.length > 1)
    lines.value.splice(i, 1)
}

// ─── Cálculos en tiempo real ──────────────────────────────────────────────────
const r2 = (n: number) => Math.round(n * 100) / 100

const lineCalc = (line: Line) => {
  const base = r2(line.quantity * line.unitPrice * (1 - line.discount / 100))
  const igic = r2(base * (line.igicRate / 100))

  return { base, igic, total: r2(base + igic) }
}

const subtotal = computed(() =>
  r2(lines.value.reduce((s, l) => s + lineCalc(l).base, 0)),
)

const igicBreakdown = computed(() => {
  const map = new Map<number, { base: number; amount: number }>()
  for (const line of lines.value) {
    const calc = lineCalc(line)
    const prev = map.get(line.igicRate) ?? { base: 0, amount: 0 }

    map.set(line.igicRate, { base: r2(prev.base + calc.base), amount: r2(prev.amount + calc.igic) })
  }

  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([rate, v]) => ({ rate, ...v }))
})

const totalIgic = computed(() => r2(igicBreakdown.value.reduce((s, v) => s + v.amount, 0)))
const total = computed(() => r2(subtotal.value + totalIgic.value))

// ─── Helpers UI ───────────────────────────────────────────────────────────────
const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)

const igicItems = IGIC_RATES.map(r => ({
  title: `${r}% ${r === 0 ? '(Exento)' : r === 3 ? '(Superreducido)' : r === 7 ? '(Reducido)' : r === 9.5 ? '(General)' : r === 15 ? '(Incrementado)' : '(Tabaco)'}`,
  value: r,
}))

const typeItems = [
  { title: 'Factura', value: 'invoice' },
  { title: 'Factura rectificativa', value: 'credit_note' },
  { title: 'Proforma', value: 'proforma' },
  { title: 'Recibo', value: 'receipt' },
]

const statusItems = [
  { title: 'Borrador', value: 'draft' },
  { title: 'Enviada', value: 'sent' },
]

// ─── Cargar factura existente (modo edición) ──────────────────────────────────
if (isEdit.value) {
  const existing = await $fetch<any>(`/api/invoices/${params.id}`)

  form.value = {
    series: existing.series,
    type: existing.type,
    status: existing.status,
    contactId: existing.contactId?._id || existing.contactId || '',
    lawyerId: existing.lawyerId?._id || existing.lawyerId || '',
    issuedAt: existing.issuedAt?.split('T')[0] || '',
    dueDate: existing.dueDate?.split('T')[0] || '',
    notes: existing.notes || '',
    internalNotes: existing.internalNotes || '',
  }

  issuer.value = existing.issuer
  client.value = existing.client
  lines.value = existing.lines.map((l: any) => ({
    description: l.description,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    igicRate: l.igicRate,
    discount: l.discount,
  }))
}

// ─── Guardar ──────────────────────────────────────────────────────────────────
const save = async (redirectStatus?: 'draft' | 'sent') => {
  errorMsg.value = ''

  if (!client.value.name || !client.value.nif) {
    errorMsg.value = 'El cliente es requerido'

    return
  }

  if (lines.value.some(l => !l.description)) {
    errorMsg.value = 'Todas las líneas deben tener descripción'

    return
  }

  loading.value = true

  try {
    const body = {
      ...form.value,
      status: redirectStatus || form.value.status,
      issuer: issuer.value,
      client: client.value,
      lines: lines.value,
    }

    if (isEdit.value) {
      await $fetch(`/api/invoices/${params.id}`, { method: 'PUT', body })
      await route.push('/billing')
    }
    else {
      const created = await $fetch<any>('/api/invoices', { method: 'POST', body })

      await route.push(`/billing/${created._id}`)
    }
  }
  catch (e: any) {
    errorMsg.value = e?.data?.message || 'Error al guardar la factura'
  }
  finally {
    loading.value = false
  }
}

// Forzar recarga del emisor cuando el componente monta
onMounted(async () => {
  if (isEdit.value)
    return
  const val = await $fetch<any>('/api/settings')

  issuer.value.address.street = val.companyAddress || ''
  issuer.value.address.city = val.companyCity || ''
  issuer.value.address.zip = val.companyZip || ''
  issuer.value.address.island = val.companyIsland || ''
  issuer.value.address.province = val.companyProvince || ''
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-3">
        <VBtn
          icon="tabler-arrow-left"
          variant="text"
          size="small"
          @click="$router.push('/billing')"
        />
        <h4 class="text-h4">
          {{ isEdit ? 'Editar factura' : 'Nueva factura' }}
        </h4>
      </div>

      <div class="d-flex gap-3">
        <VBtn
          variant="outlined"
          color="secondary"
          :disabled="loading"
          @click="$router.push('/billing')"
        >
          Cancelar
        </VBtn>
        <VBtn
          variant="outlined"
          color="primary"
          :loading="loading"
          @click="save('draft')"
        >
          Guardar borrador
        </VBtn>
        <VBtn
          color="primary"
          :loading="loading"
          prepend-icon="tabler-send"
          @click="save('sent')"
        >
          Guardar y enviar
        </VBtn>
      </div>
    </div>

    <!-- Error global -->
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
      <!-- ── Columna principal ── -->
      <VCol
        cols="12"
        md="8"
      >
        <!-- Datos generales -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Datos de la factura
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="form.series"
                  label="Serie"
                  placeholder="F"
                  hint="1-3 letras"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppSelect
                  v-model="form.type"
                  label="Tipo"
                  :items="typeItems"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppSelect
                  v-model="form.status"
                  label="Estado"
                  :items="statusItems"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.issuedAt"
                  label="Fecha de emisión"
                  type="date"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="form.dueDate"
                  label="Fecha de vencimiento"
                  type="date"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Emisor -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Emisor
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="issuer.name"
                  label="Nombre / Razón social"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="issuer.nif"
                  label="NIF / CIF"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="issuer.email"
                  label="Email"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="issuer.phone"
                  label="Teléfono"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="issuer.address.street"
                  label="Dirección"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="issuer.address.zip"
                  label="C.P."
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="issuer.address.city"
                  label="Localidad"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="issuer.address.island"
                  label="Isla"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Cliente -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Cliente
          </VCardTitle>
          <VCardText>
            <AppSelect
              v-model="form.contactId"
              label="Buscar contacto existente (opcional)"
              placeholder="Selecciona un contacto"
              :items="(contacts as any[]).map((c: any) => ({ title: c.name, value: c._id }))"
              clearable
              class="mb-4"
              @update:model-value="onContactChange"
            />

            <VDivider class="mb-4">
              <span class="text-body-2 text-disabled">o introduce manualmente</span>
            </VDivider>

            <VRow>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="client.name"
                  label="Nombre / Razón social *"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="client.nif"
                  label="NIF / CIF *"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="client.email"
                  label="Email"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
              >
                <AppTextField
                  v-model="client.phone"
                  label="Teléfono"
                />
              </VCol>
              <VCol cols="12">
                <AppTextField
                  v-model="client.address.street"
                  label="Dirección"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="client.address.zip"
                  label="C.P."
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="client.address.city"
                  label="Localidad"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
              >
                <AppTextField
                  v-model="client.address.island"
                  label="Isla"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>

        <!-- Líneas -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2 d-flex align-center justify-space-between">
            <span>Líneas de factura</span>
            <VBtn
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="tabler-plus"
              @click="addLine"
            >
              Añadir línea
            </VBtn>
          </VCardTitle>
          <VCardText class="pa-0">
            <div class="invoice-line-header d-none d-md-grid px-6 py-2">
              <span>Descripción</span>
              <span class="text-center">Cant.</span>
              <span class="text-center">Precio</span>
              <span class="text-center">Dto. %</span>
              <span class="text-center">IGIC</span>
              <span class="text-end">Total</span>
              <span />
            </div>

            <VDivider />

            <div
              v-for="(line, i) in lines"
              :key="i"
            >
              <div class="invoice-line-row px-6 py-4">
                <AppTextField
                  v-model="line.description"
                  placeholder="Descripción del servicio"
                  density="compact"
                  hide-details
                />
                <AppTextField
                  v-model.number="line.quantity"
                  type="number"
                  density="compact"
                  hide-details
                  min="0"
                />
                <AppTextField
                  v-model.number="line.unitPrice"
                  type="number"
                  density="compact"
                  hide-details
                  min="0"
                  step="0.01"
                  prefix="€"
                />
                <AppTextField
                  v-model.number="line.discount"
                  type="number"
                  density="compact"
                  hide-details
                  min="0"
                  max="100"
                  suffix="%"
                />
                <AppSelect
                  v-model="line.igicRate"
                  :items="igicItems"
                  density="compact"
                  hide-details
                />
                <div class="text-end d-flex align-center justify-end">
                  <span class="font-weight-semibold">{{ eur(lineCalc(line).total) }}</span>
                </div>
                <div class="d-flex align-center justify-center">
                  <VBtn
                    icon="tabler-trash"
                    variant="text"
                    color="error"
                    size="small"
                    :disabled="lines.length === 1"
                    @click="removeLine(i)"
                  />
                </div>
              </div>
              <VDivider v-if="i < lines.length - 1" />
            </div>
          </VCardText>
        </VCard>

        <!-- Notas -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Notas
          </VCardTitle>
          <VCardText>
            <VRow>
              <VCol cols="12">
                <AppTextarea
                  v-model="form.notes"
                  label="Notas visibles en la factura"
                  placeholder="Forma de pago, condiciones..."
                  rows="3"
                />
              </VCol>
              <VCol cols="12">
                <AppTextarea
                  v-model="form.internalNotes"
                  label="Notas internas"
                  rows="2"
                />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>

      <!-- ── Columna lateral ── -->
      <VCol
        cols="12"
        md="4"
      >
        <!-- Asignación -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Asignación
          </VCardTitle>
          <VCardText>
            <AppSelect
              v-model="form.lawyerId"
              label="Abogado responsable"
              placeholder="Seleccionar abogado"
              :items="(lawyers as any[]).map((l: any) => ({ title: l.name, value: l._id }))"
              clearable
            />
          </VCardText>
        </VCard>

        <!-- Resumen -->
        <VCard class="mb-6">
          <VCardTitle class="pa-6 pb-2">
            Resumen
          </VCardTitle>
          <VCardText class="pa-0">
            <div class="px-6 py-3 d-flex justify-space-between">
              <span class="text-body-2 text-disabled">Base imponible</span>
              <span class="font-weight-medium">{{ eur(subtotal) }}</span>
            </div>
            <VDivider />
            <div
              v-for="row in igicBreakdown"
              :key="row.rate"
              class="px-6 py-2 d-flex justify-space-between"
            >
              <span class="text-body-2 text-disabled">IGIC {{ row.rate }}%</span>
              <span class="text-body-2">{{ eur(row.amount) }}</span>
            </div>
            <VDivider />
            <div class="px-6 py-4 d-flex justify-space-between align-center">
              <span class="text-h6 font-weight-bold">Total</span>
              <span class="text-h6 font-weight-bold text-primary">{{ eur(total) }}</span>
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
              prepend-icon="tabler-send"
              @click="save('sent')"
            >
              Guardar y enviar
            </VBtn>
            <VBtn
              block
              variant="outlined"
              color="primary"
              :loading="loading"
              prepend-icon="tabler-device-floppy"
              @click="save('draft')"
            >
              Guardar borrador
            </VBtn>
            <VBtn
              block
              variant="text"
              color="secondary"
              @click="$router.push('/billing')"
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
.invoice-line-header {
  display: grid;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  font-size: 12px;
  font-weight: 600;
  gap: 12px;
  grid-template-columns: 1fr 80px 100px 80px 130px 90px 40px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.invoice-line-row {
  display: grid;
  align-items: center;
  gap: 12px;
  grid-template-columns: 1fr 80px 100px 80px 130px 90px 40px;
}

@media (max-width: 960px) {
  .invoice-line-row {
    gap: 12px;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
