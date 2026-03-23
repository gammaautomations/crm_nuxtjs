<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
</script>

<template>
  <div v-if="!authStore.isLoading">
    <VCard title="Dashboard">
      <VCardText>Bienvenido {{ authStore.user?.username }}</VCardText>
    </VCard>
  </div>
</template>
