// SettingsLegalPanel.vue

<script setup lang="ts">
const { form, loading, errorMsg, successMsg, saveSettings } = useSettings()

const save = () => saveSettings({
  copyright: form.value.copyright,
  terms: form.value.terms,
  privacy: form.value.privacy,
})
</script>

<template>
  <VCard>
    <VCardText>
      <VForm @submit.prevent="save">
        <VRow>
          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Información legal
            </p>
          </VCol>

          <!-- Copyright -->
          <VCol cols="12">
            <AppTextField
              v-model="form.copyright"
              label="Copyright"
              placeholder="© 2025 Mi Empresa. Todos los derechos reservados."
              prepend-inner-icon="tabler-copyright"
            />
          </VCol>

          <!-- Términos y condiciones -->
          <VCol cols="12">
            <AppTextarea
              v-model="form.terms"
              label="Términos y condiciones"
              placeholder="Escribe aquí los términos y condiciones..."
              rows="6"
            />
          </VCol>

          <!-- Política de privacidad -->
          <VCol cols="12">
            <AppTextarea
              v-model="form.privacy"
              label="Política de privacidad"
              placeholder="Escribe aquí la política de privacidad..."
              rows="6"
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
