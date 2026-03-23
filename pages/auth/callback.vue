<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const authStore = useAuthStore()

onMounted(async () => {
  await authStore.fetchMe()

  if (authStore.isLoggedIn)
    await navigateTo('/')

  else
    await navigateTo('/login?error=oauth_failed')
})
</script>

<template>
  <div
    class="d-flex align-center justify-center"
    style="block-size: 100vh;"
  >
    <VProgressCircular
      indeterminate
      color="primary"
      size="48"
    />
  </div>
</template>
