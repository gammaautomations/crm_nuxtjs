<script setup lang="ts">
import SettingsAplicationPanel from '@/views/admin/settings/SettingsAplicationPanel.vue'
import SettingsAppearancePanel from '@/views/admin/settings/SettingsAppearancePanel.vue'
import SettingsContactPanel from '@/views/admin/settings/SettingsContactPanel.vue'
import SettingsLegalPanel from '@/views/admin/settings/SettingsLegalPanel.vue'
import SettingsMaintemancePanel from '@/views/admin/settings/SettingsMaintemancePanel.vue'

definePageMeta({
  middleware: ['auth'],
})

const authStore = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await authStore.fetchMe()

  if (authStore.user?.role !== 'Admin')
    router.push('/')
})

const tabs = [
  { icon: 'tabler-layout', title: 'Aplicación', value: 0 },
  { icon: 'tabler-palette', title: 'Apariencia', value: 1 },
  { icon: 'tabler-mail', title: 'Contacto', value: 2 },
  { icon: 'tabler-alert-circle', title: 'Legal', value: 3 },
  { icon: 'tabler-tools', title: 'Mantenimiento', value: 4 },
]

const userTab = ref(0)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VTabs
        v-model="userTab"
        class="v-tabs-pill"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.icon"
          :value="tab.value"
        >
          <VIcon
            :size="18"
            :icon="tab.icon"
            class="me-1"
          />
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>

      <VWindow
        v-model="userTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem :value="0">
          <SettingsAplicationPanel />
        </VWindowItem>

        <VWindowItem :value="1">
          <SettingsAppearancePanel />
        </VWindowItem>

        <VWindowItem :value="2">
          <SettingsContactPanel />
        </VWindowItem>

        <VWindowItem :value="3">
          <SettingsLegalPanel />
        </VWindowItem>

        <VWindowItem :value="4">
          <SettingsMaintemancePanel />
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>
