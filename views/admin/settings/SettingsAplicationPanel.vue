// SettingsAplicationPanel.vue

<script setup lang="ts">
const { form, loading, errorMsg, successMsg, saveSettings } = useSettings()

const languages = [
  { title: 'Español', value: 'es' },
  { title: 'English', value: 'en' },
  { title: 'Français', value: 'fr' },
  { title: 'Deutsch', value: 'de' },
]

const dateFormats = [
  { title: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { title: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { title: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
]

const save = () => saveSettings({
  appName: form.value.appName,
  siteDescription: form.value.siteDescription,
  keywords: form.value.keywords,
  appVersion: form.value.appVersion,
  appUrl: form.value.appUrl,
  language: form.value.language,
  timezone: form.value.timezone,
  dateFormat: form.value.dateFormat,
})
</script>

<template>
  <VCard>
    <VCardText>
      <VForm @submit.prevent="save">
        <VRow>
          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Información de la aplicación
            </p>
          </VCol>

          <!-- Nombre de la app -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.appName"
              label="Nombre de la aplicación"
              placeholder="Mi CRM"
              prepend-inner-icon="tabler-app-window"
            />
          </VCol>

          <!-- Versión -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.appVersion"
              label="Versión"
              placeholder="1.0.0"
              prepend-inner-icon="tabler-tag"
            />
          </VCol>

          <!-- URL -->
          <VCol cols="12">
            <AppTextField
              v-model="form.appUrl"
              label="URL de la aplicación"
              placeholder="https://micrm.com"
              prepend-inner-icon="tabler-world"
            />
          </VCol>

          <!-- Descripción -->
          <VCol cols="12">
            <AppTextarea
              v-model="form.siteDescription"
              label="Descripción del sitio"
              placeholder="Describe tu aplicación..."
              rows="3"
            />
          </VCol>

          <!-- Keywords -->
          <VCol cols="12">
            <AppTextField
              v-model="form.keywords"
              label="Keywords SEO"
              placeholder="crm, gestión, clientes..."
              prepend-inner-icon="tabler-tags"
            />
          </VCol>

          <VDivider class="my-4" />

          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Localización
            </p>
          </VCol>

          <!-- Idioma -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="form.language"
              label="Idioma"
              :items="languages"
              prepend-inner-icon="tabler-language"
            />
          </VCol>

          <!-- Zona horaria -->
          <VCol
            cols="12"
            md="4"
          >
            <AppTextField
              v-model="form.timezone"
              label="Zona horaria"
              placeholder="Atlantic/Canary"
              prepend-inner-icon="tabler-clock"
            />
          </VCol>

          <!-- Formato de fecha -->
          <VCol
            cols="12"
            md="4"
          >
            <AppSelect
              v-model="form.dateFormat"
              label="Formato de fecha"
              :items="dateFormats"
              prepend-inner-icon="tabler-calendar"
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
