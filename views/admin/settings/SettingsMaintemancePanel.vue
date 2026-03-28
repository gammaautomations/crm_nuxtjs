// SettingsMaintenamentPanel.vue

<script setup lang="ts">
const { form, loading, errorMsg, successMsg, saveSettings } = useSettings()

const save = () => saveSettings({
  maintenanceMode: form.value.maintenanceMode,
  maintenanceTitle: form.value.maintenanceTitle,
  maintenanceMessage: form.value.maintenanceMessage,
})
</script>

<template>
  <VCard>
    <VCardText>
      <VForm @submit.prevent="save">
        <VRow>
          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Modo mantenimiento
            </p>
          </VCol>

          <!-- Switch mantenimiento -->
          <VCol cols="12">
            <VSwitch
              v-model="form.maintenanceMode"
              label="Activar modo mantenimiento"
              color="warning"
              :hint="form.maintenanceMode ? '⚠️ El sitio está en mantenimiento' : 'El sitio está disponible'"
              persistent-hint
            />
          </VCol>

          <!-- Título -->
          <VCol cols="12">
            <AppTextField
              v-model="form.maintenanceTitle"
              label="Título del mantenimiento"
              placeholder="Sitio en mantenimiento"
              prepend-inner-icon="tabler-tools"
              :disabled="!form.maintenanceMode"
            />
          </VCol>

          <!-- Mensaje -->
          <VCol cols="12">
            <AppTextarea
              v-model="form.maintenanceMessage"
              label="Mensaje de mantenimiento"
              placeholder="Volveremos pronto..."
              rows="4"
              :disabled="!form.maintenanceMode"
            />
          </VCol>

          <!-- Preview -->
          <VCol
            v-if="form.maintenanceMode"
            cols="12"
          >
            <VAlert
              type="warning"
              variant="tonal"
              density="compact"
            >
              <strong>{{ form.maintenanceTitle }}</strong>
              <br>
              {{ form.maintenanceMessage }}
            </VAlert>
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
              :color="form.maintenanceMode ? 'warning' : 'primary'"
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
