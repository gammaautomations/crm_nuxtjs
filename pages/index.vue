<script setup lang="ts">
// pages/index.vue
definePageMeta({
  middleware: ['auth'],
})

const { data: stats, pending } = await useFetch('/api/dashboard/stats')

// ── Leads (existentes) ────────────────────────────────────────────────────────
const totals = computed(() => (stats.value as any)?.totals || {})
const leadsByStatus = computed(() => (stats.value as any)?.leadsByStatus || [])
const leadsByArea = computed(() => (stats.value as any)?.leadsByArea || [])
const recentLeads = computed(() => (stats.value as any)?.recentLeads || [])
const lawyersByLeads = computed(() => (stats.value as any)?.lawyersByLeads || [])
const leadsByScore = computed(() => (stats.value as any)?.leadsByScore || [])

// ── Nuevas métricas ───────────────────────────────────────────────────────────
const billing = computed(() => (stats.value as any)?.billing || {})
const cases = computed(() => (stats.value as any)?.cases || {})
const appointments = computed(() => (stats.value as any)?.appointments || [])
const time = computed(() => (stats.value as any)?.time || {})

// ── Helpers ───────────────────────────────────────────────────────────────────
const eur = (n: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0)

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatDateTime = (date: string) =>
  new Date(date).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

const scoreLabel = (boundary: number) => {
  if (boundary === 0)
    return 'Bajo (0-3)'
  if (boundary === 4)
    return 'Medio (4-5)'
  if (boundary === 6)
    return 'Alto (6-7)'
  if (boundary === 8)
    return 'Crítico (8-10)'

  return 'Otros'
}

const scoreColor = (boundary: number) => {
  if (boundary === 8)
    return '#FF4C51'
  if (boundary === 6)
    return '#FFB400'
  if (boundary === 4)
    return '#16B1FF'

  return '#9E9E9E'
}

const statusColor: Record<string, string> = {
  nuevo: '#16B1FF',
  contactado: '#FFB400',
  en_proceso: '#7367F0',
  cerrado: '#56CA00',
  descartado: '#FF4C51',
}

const caseStatusLabel: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  on_hold: 'En espera',
  closed: 'Cerrado',
  archived: 'Archivado',
}

const appointmentTypeIcon: Record<string, string> = {
  appointment: 'tabler-calendar',
  task: 'tabler-check',
  reminder: 'tabler-bell',
  hearing: 'tabler-gavel',
  meeting: 'tabler-users',
}

// ── Gráficos existentes ───────────────────────────────────────────────────────
const areaChartOptions = computed(() => ({
  chart: { type: 'donut' },
  labels: leadsByArea.value.map((a: any) => a._id || 'Sin área'),
  colors: ['#7367F0', '#16B1FF', '#56CA00', '#FFB400'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: true },
}))

const areaChartSeries = computed(() => leadsByArea.value.map((a: any) => a.count))

const statusChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  xaxis: { categories: leadsByStatus.value.map((s: any) => s._id) },
  colors: leadsByStatus.value.map((s: any) => statusColor[s._id] || '#9E9E9E'),
  plotOptions: { bar: { borderRadius: 4, horizontal: false } },
  dataLabels: { enabled: false },
}))

const statusChartSeries = computed(() => [{ name: 'Leads', data: leadsByStatus.value.map((s: any) => s.count) }])

const scoreChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  xaxis: { categories: leadsByScore.value.map((s: any) => scoreLabel(s._id)) },
  colors: leadsByScore.value.map((s: any) => scoreColor(s._id)),
  plotOptions: { bar: { borderRadius: 4, horizontal: true } },
  dataLabels: { enabled: false },
}))

const scoreChartSeries = computed(() => [{ name: 'Leads', data: leadsByScore.value.map((s: any) => s.count) }])

// ── Gráfico facturación mensual ───────────────────────────────────────────────
const billingChartOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
  xaxis: { categories: billing.value.monthly?.map((m: any) => m.label) || [] },
  colors: ['#7367F0', '#28C76F'],
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 0.1 } },
  dataLabels: { enabled: false },
  legend: { position: 'top' },
  yaxis: { labels: { formatter: (v: number) => `${v}€` } },
}))

const billingChartSeries = computed(() => [
  { name: 'Facturado', data: billing.value.monthly?.map((m: any) => m.issued) || [] },
  { name: 'Cobrado', data: billing.value.monthly?.map((m: any) => m.paid) || [] },
])

onMounted(() => {
  const interval = setInterval(async () => { await refreshNuxtData() }, 30000)

  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <div v-if="!pending">
    <h4 class="text-h4 mb-6">
      Dashboard
    </h4>

    <!-- ── KPIs fila 1: Leads + Facturación ── -->
    <VRow class="mb-6">
      <!-- Leads -->
      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Total Leads
              </p>
              <p class="text-h4 font-weight-bold mb-0">
                {{ totals.totalLeads }}
              </p>
            </div>
            <VAvatar
              color="error"
              variant="tonal"
              size="56"
            >
              <VIcon
                icon="tabler-users"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Contactos -->
      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Total Contactos
              </p>
              <p class="text-h4 font-weight-bold mb-0">
                {{ totals.totalContacts }}
              </p>
            </div>
            <VAvatar
              color="primary"
              variant="tonal"
              size="56"
            >
              <VIcon
                icon="tabler-address-book"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Expedientes activos -->
      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Expedientes activos
              </p>
              <p class="text-h4 font-weight-bold mb-0">
                {{ cases.active || 0 }}
              </p>
              <p class="text-body-2 text-disabled mb-0">
                de {{ cases.total || 0 }} totales
              </p>
            </div>
            <VAvatar
              color="info"
              variant="tonal"
              size="56"
            >
              <VIcon
                icon="tabler-folder"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Abogados -->
      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Total Abogados
              </p>
              <p class="text-h4 font-weight-bold mb-0">
                {{ totals.totalLawyers }}
              </p>
            </div>
            <VAvatar
              color="success"
              variant="tonal"
              size="56"
            >
              <VIcon
                icon="tabler-briefcase"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ── KPIs fila 2: Facturación ── -->
    <VRow class="mb-6">
      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Facturado (año)
              </p>
              <p class="text-h5 font-weight-bold mb-0">
                {{ eur(billing.totalIssued) }}
              </p>
            </div>
            <VAvatar
              color="primary"
              variant="tonal"
              size="56"
            >
              <VIcon
                icon="tabler-file-invoice"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Cobrado (año)
              </p>
              <p class="text-h5 font-weight-bold mb-0 text-success">
                {{ eur(billing.totalPaid) }}
              </p>
            </div>
            <VAvatar
              color="success"
              variant="tonal"
              size="56"
            >
              <VIcon
                icon="tabler-circle-check"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Pendiente cobro
              </p>
              <p class="text-h5 font-weight-bold mb-0 text-warning">
                {{ eur(billing.totalPending) }}
              </p>
            </div>
            <VAvatar
              color="warning"
              variant="tonal"
              size="56"
            >
              <VIcon
                icon="tabler-clock"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        lg="3"
      >
        <VCard>
          <VCardText class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-disabled mb-1">
                Horas mes (importe)
              </p>
              <p class="text-h5 font-weight-bold mb-0">
                {{ eur(time.totalAmount) }}
              </p>
              <p class="text-body-2 text-disabled mb-0">
                {{ time.totalHours || 0 }}h registradas
              </p>
            </div>
            <VAvatar
              color="secondary"
              variant="tonal"
              size="56"
            >
              <VIcon
                icon="tabler-clock-hour-4"
                size="28"
              />
            </VAvatar>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ── Gráfico facturación mensual ── -->
    <VRow class="mb-6">
      <VCol cols="12">
        <VCard>
          <VCardTitle class="pa-6 pb-0">
            Facturación últimos 6 meses
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="billing.monthly?.length"
              type="area"
              height="250"
              :options="billingChartOptions"
              :series="billingChartSeries"
            />
            <p
              v-else
              class="text-center text-disabled pa-6"
            >
              Sin datos de facturación
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ── Gráficos leads ── -->
    <VRow class="mb-6">
      <VCol
        cols="12"
        md="4"
      >
        <VCard height="100%">
          <VCardTitle class="pa-6 pb-0">
            Leads por Área
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="areaChartSeries.length"
              type="donut"
              height="280"
              :options="areaChartOptions"
              :series="areaChartSeries"
            />
            <p
              v-else
              class="text-center text-disabled pa-6"
            >
              Sin datos
            </p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard height="100%">
          <VCardTitle class="pa-6 pb-0">
            Leads por Estado
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="statusChartSeries[0]?.data?.length"
              type="bar"
              height="280"
              :options="statusChartOptions"
              :series="statusChartSeries"
            />
            <p
              v-else
              class="text-center text-disabled pa-6"
            >
              Sin datos
            </p>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="4"
      >
        <VCard height="100%">
          <VCardTitle class="pa-6 pb-0">
            Leads por Score
          </VCardTitle>
          <VCardText>
            <VueApexCharts
              v-if="scoreChartSeries[0]?.data?.length"
              type="bar"
              height="280"
              :options="scoreChartOptions"
              :series="scoreChartSeries"
            />
            <p
              v-else
              class="text-center text-disabled pa-6"
            >
              Sin datos
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ── Próximas citas + Expedientes recientes ── -->
    <VRow class="mb-6">
      <!-- Próximas citas -->
      <VCol
        cols="12"
        md="5"
      >
        <VCard height="100%">
          <VCardTitle class="pa-6 pb-2 d-flex align-center justify-space-between">
            <span>Próximas citas (7 días)</span>
            <VBtn
              size="small"
              variant="text"
              to="/calendar"
            >
              Ver todas
            </VBtn>
          </VCardTitle>
          <VCardText class="pa-0">
            <div
              v-if="!appointments.length"
              class="text-center text-disabled pa-6"
            >
              No hay citas próximas
            </div>
            <VList v-else>
              <VListItem
                v-for="apt in appointments"
                :key="apt._id"
                :prepend-icon="appointmentTypeIcon[apt.type] || 'tabler-calendar'"
                to="/calendar"
              >
                <VListItemTitle class="font-weight-medium">
                  {{ apt.title }}
                </VListItemTitle>
                <VListItemSubtitle>
                  {{ formatDateTime(apt.startAt) }}
                  <span v-if="apt.contactId"> · {{ apt.contactId?.fullName || apt.contactId?.name }}</span>
                </VListItemSubtitle>
                <template #append>
                  <div
                    class="rounded-circle"
                    :style="`background: ${apt.color || '#7367F0'}; width: 10px; height: 10px;`"
                  />
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Expedientes recientes -->
      <VCol
        cols="12"
        md="7"
      >
        <VCard height="100%">
          <VCardTitle class="pa-6 pb-2 d-flex align-center justify-space-between">
            <span>Expedientes activos</span>
            <VBtn
              size="small"
              variant="text"
              to="/cases"
            >
              Ver todos
            </VBtn>
          </VCardTitle>
          <VCardText class="pa-0">
            <div
              v-if="!cases.recent?.length"
              class="text-center text-disabled pa-6"
            >
              No hay expedientes activos
            </div>
            <VTable
              v-else
              density="compact"
            >
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Título</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="c in cases.recent"
                  :key="c._id"
                  style="cursor: pointer;"
                  @click="navigateTo(`/cases/${c._id}`)"
                >
                  <td>
                    <span class="text-primary font-weight-semibold">{{ c.number }}</span>
                  </td>
                  <td>{{ c.title }}</td>
                  <td>{{ c.contactId?.fullName || c.contactId?.name || '—' }}</td>
                  <td>
                    <VChip
                      size="x-small"
                      label
                      :color="c.status === 'open' ? 'primary' : 'info'"
                    >
                      {{ caseStatusLabel[c.status] || c.status }}
                    </VChip>
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ── Leads recientes + Ranking abogados ── -->
    <VRow>
      <VCol
        cols="12"
        md="7"
      >
        <VCard>
          <VCardTitle class="pa-6 pb-0">
            Leads Recientes
          </VCardTitle>
          <VCardText>
            <VTable>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Área</th>
                  <th>Score</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="lead in recentLeads"
                  :key="lead._id"
                  class="cursor-pointer"
                  @click="navigateTo(`/leads/${lead._id}`)"
                >
                  <td>
                    <p class="font-weight-medium mb-0">
                      {{ lead.nombre }}
                    </p>
                    <p class="text-body-2 text-disabled mb-0">
                      {{ lead.email }}
                    </p>
                  </td>
                  <td>
                    <VChip
                      size="x-small"
                      variant="outlined"
                    >
                      {{ lead.area }}
                    </VChip>
                  </td>
                  <td>
                    <VChip
                      size="x-small"
                      :color="lead.lead_score >= 8 ? 'error' : lead.lead_score >= 6 ? 'warning' : 'info'"
                    >
                      {{ lead.lead_score }}
                    </VChip>
                  </td>
                  <td>
                    <VChip
                      size="x-small"
                      :color="statusColor[lead.status]"
                    >
                      {{ lead.status }}
                    </VChip>
                  </td>
                  <td class="text-body-2">
                    {{ formatDate(lead.createdAt) }}
                  </td>
                </tr>
              </tbody>
            </VTable>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="5"
      >
        <VCard>
          <VCardTitle class="pa-6 pb-0">
            Abogados con más Leads
          </VCardTitle>
          <VCardText>
            <div
              v-for="(lawyer, index) in lawyersByLeads"
              :key="lawyer.name"
              class="d-flex align-center gap-3 mb-4"
            >
              <VAvatar
                :color="index === 0 ? 'warning' : index === 1 ? 'secondary' : 'primary'"
                variant="tonal"
                size="40"
              >
                <span class="font-weight-bold">{{ index + 1 }}</span>
              </VAvatar>
              <div class="flex-grow-1">
                <p class="font-weight-medium mb-1">
                  {{ lawyer.name }}
                </p>
                <VProgressLinear
                  :model-value="(lawyer.count / (lawyersByLeads[0]?.count || 1)) * 100"
                  :color="index === 0 ? 'warning' : 'primary'"
                  height="6"
                  rounded
                />
              </div>
              <span class="font-weight-bold">{{ lawyer.count }}</span>
            </div>
            <p
              v-if="!lawyersByLeads.length"
              class="text-center text-disabled"
            >
              Sin datos
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>

  <div
    v-else
    class="d-flex justify-center pa-10"
  >
    <VProgressCircular
      indeterminate
      color="primary"
    />
  </div>
</template>
