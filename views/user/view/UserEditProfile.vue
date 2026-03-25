// UserEditProfile.vue

<script setup lang="ts">
const { data, refresh } = await useFetch('/api/profile')

const form = ref({
  fullname: data.value?.profile?.fullname || '',
  phone: data.value?.profile?.phone || '',
  phone1: data.value?.profile?.phone1 || '',
  whatsapp: data.value?.profile?.whatsapp || '',
})

const { v$, isFormValid } = useProfileValidation(form)

const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const saveProfile = async () => {
  const valid = await isFormValid()
  if (!valid)
    return

  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await $fetch('/api/profile', {
      method: 'PATCH',
      body: form.value,
    })

    successMsg.value = 'Perfil actualizado correctamente'
    await refresh()
  }
  catch (error: any) {
    errorMsg.value = error?.data?.message || 'Error al actualizar el perfil'
  }
  finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value.fullname = data.value?.profile?.fullname || ''
  form.value.phone = data.value?.profile?.phone || ''
  form.value.phone1 = data.value?.profile?.phone1 || ''
  form.value.whatsapp = data.value?.profile?.whatsapp || ''
  v$.value.$reset()
}
</script>

<template>
  <VCard>
    <VCardText>
      <VForm @submit.prevent="saveProfile">
        <VRow>
          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Información personal
            </p>
          </VCol>

          <!-- Nombre completo -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.fullname"
              label="Nombre completo o empresa"
              placeholder="John Doe"
              prepend-inner-icon="tabler-user"
              :error-messages="v$.fullname.$errors.map(e => e.$message as string)"
              @blur="v$.fullname.$touch"
            />
          </VCol>

          <!-- Teléfono -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.phone"
              label="Teléfono"
              placeholder="+34 600 000 000"
              prepend-inner-icon="tabler-phone"
              :error-messages="v$.phone.$errors.map(e => e.$message as string)"
              @blur="v$.phone.$touch"
            />
          </VCol>

          <!-- Teléfono alternativo -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.phone1"
              label="Teléfono alternativo"
              placeholder="+34 600 000 000"
              prepend-inner-icon="tabler-phone-plus"
              :error-messages="v$.phone1.$errors.map(e => e.$message as string)"
              @blur="v$.phone1.$touch"
            />
          </VCol>

          <!-- WhatsApp -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.whatsapp"
              label="WhatsApp"
              placeholder="+34 600 000 000"
              prepend-inner-icon="tabler-brand-whatsapp"
              :error-messages="v$.whatsapp.$errors.map(e => e.$message as string)"
              @blur="v$.whatsapp.$touch"
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

          <!-- Botones -->
          <VCol
            cols="12"
            class="d-flex gap-4"
          >
            <VBtn
              type="submit"
              :loading="loading"
            >
              Guardar cambios
            </VBtn>
            <VBtn
              variant="outlined"
              color="secondary"
              @click="resetForm"
            >
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
