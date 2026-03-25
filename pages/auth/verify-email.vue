// verify-email.vue - Página para verificar el email del usuario después del registro

<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

definePageMeta({
  layout: 'blank',
})

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()

const goToLogin = async () => {
  await authStore.logout()
}

const email = ref(route.query.email as string || '')
const code = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const resendLoading = ref(false)
const resendCooldown = ref(0)

// Enviar código al cargar la página
onMounted(async () => {
  if (email.value)
    await sendCode()
})

const sendCode = async () => {
  try {
    await $fetch('/api/auth/send-verification', {
      method: 'POST',
      body: { email: email.value },
    })
    startCooldown()
  }
  catch (error: any) {
    errorMsg.value = error?.data?.message || 'Error al enviar el código'
  }
}

const startCooldown = () => {
  resendCooldown.value = 60

  const interval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0)
      clearInterval(interval)
  }, 1000)
}

const resendCode = async () => {
  resendLoading.value = true
  errorMsg.value = ''
  await sendCode()
  resendLoading.value = false
}

const verifyEmail = async () => {
  if (code.value.length !== 6) {
    errorMsg.value = 'El código debe tener 6 dígitos'

    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { email: email.value, code: code.value },
    })

    successMsg.value = '¡Email verificado correctamente!'

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }
  catch (error: any) {
    errorMsg.value = error?.data?.message || 'Error al verificar el código'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      cols="12"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6 w-100"
      >
        <VCardText class="text-center">
          <VNodeRenderer :nodes="themeConfig.app.logo" />
          <h4 class="text-h4 mt-4 mb-1">
            Verifica tu email ✉️
          </h4>
          <p class="mb-0">
            Hemos enviado un código de 6 dígitos a
          </p>
          <p class="text-primary font-weight-semibold">
            {{ email }}
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="verifyEmail">
            <VRow>
              <VCol cols="12">
                <AppTextField
                  v-model="code"
                  label="Código de verificación"
                  placeholder="000000"
                  maxlength="6"
                  autofocus
                />
              </VCol>

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

                <VBtn
                  block
                  type="submit"
                  :loading="loading"
                >
                  Verificar email
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-center"
              >
                <span class="text-body-2">¿No recibiste el código?</span>
                <VBtn
                  variant="text"
                  :disabled="resendCooldown > 0"
                  :loading="resendLoading"
                  @click="resendCode"
                >
                  {{ resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código' }}
                </VBtn>
              </VCol>

              <VCol
                cols="12"
                class="text-center"
              >
                <VBtn
                  variant="text"
                  color="primary"
                  @click="goToLogin"
                >
                  Volver al login
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
