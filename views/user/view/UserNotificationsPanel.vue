<script setup lang="ts">
// views/user/view/UserNotificationsPanel.vue

const { data, refresh } = await useFetch<any>('/api/user/notifications-prefs')

const prefs = ref({
  emailInvoiceDue: true,
  emailCaseDeadline: true,
  emailAppointments: true,
  crmInvoiceDue: true,
  crmCaseDeadline: true,
  crmAppointments: true,
})

watch(data, val => {
  if (val)
    prefs.value = { ...prefs.value, ...val }
}, { immediate: true })

const loading = ref(false)
const saved = ref(false)

const save = async () => {
  loading.value = true
  try {
    await $fetch('/api/user/notifications-prefs', { method: 'PUT', body: prefs.value })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  }
  finally { loading.value = false }
}
</script>

<template>
  <VCard>
    <VCardTitle class="pa-6 pb-2">
      Preferencias de notificaciones
    </VCardTitle>
    <VCardText>
      <!-- Email -->
      <p class="text-overline text-primary mb-3">
        Notificaciones por email
      </p>
      <VList class="mb-6">
        <VListItem>
          <template #prepend>
            <VSwitch
              v-model="prefs.emailInvoiceDue"
              color="primary"
              hide-details
              class="me-3"
            />
          </template>
          <VListItemTitle>Facturas vencidas</VListItemTitle>
          <VListItemSubtitle>Recibe un email cuando una factura supere su fecha de vencimiento</VListItemSubtitle>
        </VListItem>
        <VDivider />
        <VListItem>
          <template #prepend>
            <VSwitch
              v-model="prefs.emailCaseDeadline"
              color="primary"
              hide-details
              class="me-3"
            />
          </template>
          <VListItemTitle>Fechas límite de expedientes</VListItemTitle>
          <VListItemSubtitle>Recibe un email cuando se acerque la fecha límite de un expediente</VListItemSubtitle>
        </VListItem>
        <VDivider />
        <VListItem>
          <template #prepend>
            <VSwitch
              v-model="prefs.emailAppointments"
              color="primary"
              hide-details
              class="me-3"
            />
          </template>
          <VListItemTitle>Recordatorio de citas</VListItemTitle>
          <VListItemSubtitle>Recibe un email con las citas del día cada mañana</VListItemSubtitle>
        </VListItem>
      </VList>

      <!-- CRM -->
      <p class="text-overline text-primary mb-3">
        Notificaciones en el CRM
      </p>
      <VList class="mb-6">
        <VListItem>
          <template #prepend>
            <VSwitch
              v-model="prefs.crmInvoiceDue"
              color="primary"
              hide-details
              class="me-3"
            />
          </template>
          <VListItemTitle>Facturas vencidas</VListItemTitle>
          <VListItemSubtitle>Aparece en la campana cuando una factura vence</VListItemSubtitle>
        </VListItem>
        <VDivider />
        <VListItem>
          <template #prepend>
            <VSwitch
              v-model="prefs.crmCaseDeadline"
              color="primary"
              hide-details
              class="me-3"
            />
          </template>
          <VListItemTitle>Fechas límite de expedientes</VListItemTitle>
          <VListItemSubtitle>Aparece en la campana cuando se acerca la fecha límite</VListItemSubtitle>
        </VListItem>
        <VDivider />
        <VListItem>
          <template #prepend>
            <VSwitch
              v-model="prefs.crmAppointments"
              color="primary"
              hide-details
              class="me-3"
            />
          </template>
          <VListItemTitle>Recordatorio de citas</VListItemTitle>
          <VListItemSubtitle>Aparece en la campana con las citas del día</VListItemSubtitle>
        </VListItem>
      </VList>

      <div class="d-flex gap-3 align-center">
        <VBtn
          color="primary"
          :loading="loading"
          @click="save"
        >
          Guardar preferencias
        </VBtn>
        <VFadeTransition>
          <span
            v-if="saved"
            class="text-success text-body-2"
          >
            <VIcon
              icon="tabler-check"
              size="16"
            /> Guardado
          </span>
        </VFadeTransition>
      </div>
    </VCardText>
  </VCard>
</template>
