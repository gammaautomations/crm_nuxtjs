// UserSecurityPanel.vue

<script setup lang="ts">
const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const { v$, isFormValid } = useChangePasswordValidation(form)

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const isCurrentPasswordVisible = ref(false)
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const savePassword = async () => {
  const valid = await isFormValid()
  if (!valid)
    return

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await $fetch('/api/profile/change-password', {
      method: 'POST',
      body: form.value,
    })

    successMsg.value = 'Contraseña actualizada correctamente'
    form.value.currentPassword = ''
    form.value.newPassword = ''
    form.value.confirmPassword = ''
    v$.value.$reset()
  }
  catch (error: any) {
    errorMsg.value = error?.data?.message || 'Error al actualizar la contraseña'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <VCard>
    <VCardText>
      <VForm @submit.prevent="savePassword">
        <VRow>
          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Cambiar contraseña
            </p>
          </VCol>

          <!-- Contraseña actual -->
          <VCol cols="12">
            <AppTextField
              v-model="form.currentPassword"
              label="Contraseña actual"
              placeholder="············"
              :type="isCurrentPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isCurrentPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
              :error-messages="v$.currentPassword.$errors.map(e => e.$message as string)"
              @blur="v$.currentPassword.$touch"
              @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
            />
          </VCol>

          <!-- Nueva contraseña -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.newPassword"
              label="Nueva contraseña"
              placeholder="············"
              :type="isNewPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isNewPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
              :error-messages="v$.newPassword.$errors.map(e => e.$message as string)"
              @blur="v$.newPassword.$touch"
              @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
            />
          </VCol>

          <!-- Confirmar contraseña -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.confirmPassword"
              label="Confirmar contraseña"
              placeholder="············"
              :type="isConfirmPasswordVisible ? 'text' : 'password'"
              :append-inner-icon="isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
              :error-messages="v$.confirmPassword.$errors.map(e => e.$message as string)"
              @blur="v$.confirmPassword.$touch"
              @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
            />
          </VCol>

          <!-- Requisitos -->
          <VCol cols="12">
            <VAlert
              type="info"
              variant="tonal"
              density="compact"
            >
              La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
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
            >
              Actualizar contraseña
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
