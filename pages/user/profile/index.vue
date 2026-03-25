<script setup lang="ts">
import UserBioPanel from '@/views/user/view/UserBioPanel.vue'
import UserEditProfile from '@/views/user/view/UserEditProfile.vue'

const tabs = [
  {
    icon: 'tabler-user',
    title: 'Editar perfil',
    value: 0,
  },
  {
    icon: 'tabler-lock',
    title: 'Seguridad',
    value: 1,
  },
  {
    icon: 'tabler-shield-check',
    title: 'Autenticación 2FA',
    value: 2,
  },
]

const userTab = ref(0)
</script>>

<template>
  <VRow>
    <VCol
      cols="12"
      md="5"
      lg="4"
    >
      <UserBioPanel />
    </VCol>

    <VCol
      cols="12"
      md="7"
      lg="8"
    >
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
          <UserEditProfile />
        </VWindowItem>

        <VWindowItem :value="1" />

        <VWindowItem :value="2">
          <VCard>
            <VCardText class="text-center pa-10">
              <VIcon
                icon="tabler-shield-check"
                size="48"
                color="primary"
                class="mb-4"
              />
              <h5 class="text-h5 mb-2">
                Autenticación en dos pasos
              </h5>
              <p class="text-body-2 text-disabled">
                Próximamente disponible
              </p>
            </VCardText>
          </VCard>
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>
