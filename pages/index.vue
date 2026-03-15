<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>

<template>
  <div>
    <VCard title="Dashboard">
      <VCardText>Bienvenido a tu SaaS</VCardText>
    </VCard>
  </div>
</template>
