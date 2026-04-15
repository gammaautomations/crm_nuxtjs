// index.vue

<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { data: stats, pending } = await useFetch('/api/dashboard/stats')

const totals = computed(() => (stats.value as any)?.totals || {})
const leadsByStatus = computed(() => (stats.value as any)?.leadsByStatus || [])
const leadsByArea = computed(() => (stats.value as any)?.leadsByArea || [])
const recentLeads = computed(() => (stats.value as any)?.recentLeads || [])
const lawyersByLeads = computed(() => (stats.value as any)?.lawyersByLeads || [])
const leadsByScore = computed(() => (stats.value as any)?.leadsByScore || [])

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

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Opciones gráfico área
const areaChartOptions = computed(() => ({
  chart: { type: 'donut' },
  labels: leadsByArea.value.map((a: any) => a._id || 'Sin área'),
  colors: ['#7367F0', '#16B1FF', '#56CA00', '#FFB400'],
  legend: { position: 'bottom' },
  dataLabels: { enabled: true },
}))

const areaChartSeries = computed(() =>
  leadsByArea.value.map((a: any) => a.count),
)

// Opciones gráfico estado
const statusChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  xaxis: {
    categories: leadsByStatus.value.map((s: any) => s._id),
  },
  colors: leadsByStatus.value.map((s: any) => statusColor[s._id] || '#9E9E9E'),
  plotOptions: {
    bar: { borderRadius: 4, horizontal: false },
  },
  dataLabels: { enabled: false },
}))

const statusChartSeries = computed(() => [{
  name: 'Leads',
  data: leadsByStatus.value.map((s: any) => s.count),
}])

// Opciones gráfico score
const scoreChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  xaxis: {
    categories: leadsByScore.value.map((s: any) => scoreLabel(s._id)),
  },
  colors: leadsByScore.value.map((s: any) => scoreColor(s._id)),
  plotOptions: {
    bar: { borderRadius: 4, horizontal: true },
  },
  dataLabels: { enabled: false },
}))

const scoreChartSeries = computed(() => [{
  name: 'Leads',
  data: leadsByScore.value.map((s: any) => s.count),
}])

onMounted(() => {
  const interval = setInterval(async () => {
    await refreshNuxtData()
  }, 30000)

  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <div v-if="!pending">
    <h4 class="text-h4 mb-6">
      Dashboard
    </h4>

    <!-- Cards totales -->
    <VRow class="mb-6">
      <VCol
        cols="12"
        sm="4"
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
      <VCol
        cols="12"
        sm="4"
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
      <VCol
        cols="12"
        sm="4"
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

    <VRow class="mb-6">
      <!-- Gráfico por área -->
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
              height="300"
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

      <!-- Gráfico por estado -->
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
              height="300"
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

      <!-- Gráfico por score -->
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
              height="300"
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

    <VRow>
      <!-- Leads recientes -->
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

      <!-- Ranking abogados -->
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
