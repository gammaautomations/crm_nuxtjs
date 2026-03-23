<script setup lang="ts">
import { useTheme } from 'vuetify'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'

const { global } = useTheme()

initCore()
initConfigStore()

const configStore = useConfigStore()
const { isMobile } = useDevice()
if (isMobile)
  configStore.appContentLayoutNav = 'vertical'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
