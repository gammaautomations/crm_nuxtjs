// SettingsContacPanel.vue

<script setup lang="ts">
const { form, loading, errorMsg, successMsg, saveSettings } = useSettings()

const save = () => saveSettings({
  contactAddress: form.value.contactAddress,
  contactEmail: form.value.contactEmail,
  contactPhone: form.value.contactPhone,
  contactWhatsapp: form.value.contactWhatsapp,
  businessHours: form.value.businessHours,
})
</script>

<template>
  <VCard>
    <VCardText>
      <VForm @submit.prevent="save">
        <VRow>
          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Información de contacto
            </p>
          </VCol>

          <!-- Email -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.contactEmail"
              label="Email de contacto"
              placeholder="info@miempresa.com"
              type="email"
              prepend-inner-icon="tabler-mail"
            />
          </VCol>

          <!-- Teléfono -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.contactPhone"
              label="Teléfono"
              placeholder="+34 600 000 000"
              prepend-inner-icon="tabler-phone"
            />
          </VCol>

          <!-- WhatsApp -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.contactWhatsapp"
              label="WhatsApp"
              placeholder="+34 600 000 000"
              prepend-inner-icon="tabler-brand-whatsapp"
            />
          </VCol>

          <!-- Dirección -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.contactAddress"
              label="Dirección"
              placeholder="Calle Mayor 1, Madrid"
              prepend-inner-icon="tabler-map-pin"
            />
          </VCol>

          <!-- Horario -->
          <VCol cols="12">
            <AppTextField
              v-model="form.businessHours"
              label="Horario de atención"
              placeholder="Lunes a Viernes 9:00 - 18:00"
              prepend-inner-icon="tabler-clock"
            />
          </VCol>

          <!-- Alerts -->
          <VCol cols="12">
            <VAlert
              v-if="errorMsg"
              type="error"
              density="compact"
              class="mb-2"
            >
              {{ errorMsg }}
            </VAlert>

            <VAlert
              v-if="successMsg"
              type="success"
              density="compact"
              class="mb-2"
            >
              {{ successMsg }}
            </VAlert>
          </VCol>

          <!-- Botón -->
          <VCol cols="12">
            <VBtn
              type="submit"
              :loading="loading"
              prepend-icon="tabler-device-floppy"
            >
              Guardar cambios
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
