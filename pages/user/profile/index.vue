// pages/user/profile/index.vue

<script setup lang="ts">
import UserBioPanel from '@/views/user/view/UserBioPanel.vue'
import UserEditProfile from '@/views/user/view/UserEditProfile.vue'
import UserSecurityPanel from '@/views/user/view/UserSecurityPanel.vue'

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
  { icon: 'tabler-device-laptop', title: 'Sesiones', value: 3 },
]

const userTab = ref(0)
</script>

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

        <VWindowItem :value="1">
          <UserSecurityPanel />
        </VWindowItem>

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

        <VWindowItem :value="3">
          <VCard>
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Sesiones recientes
              </p>
              <div v-if="sessions.length">
                <div
                  v-for="(session, index) in [...sessions].reverse()"
                  :key="index"
                  class="d-flex align-center gap-4 mb-4 pa-4 rounded"
                  style=" border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));background: rgba(var(--v-theme-surface-variant), 0.1);"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                    size="44"
                  >
                    <VIcon
                      :icon="session.os?.toLowerCase().includes('windows') ? 'tabler-brand-windows' : session.os?.toLowerCase().includes('mac') ? 'tabler-brand-apple' : 'tabler-device-mobile'"
                      size="22"
                    />
                  </VAvatar>
                  <div class="flex-grow-1">
                    <p class="font-weight-medium mb-0">
                      {{ session.browser || 'Navegador desconocido' }}
                    </p>
                    <p class="text-body-2 text-disabled mb-0">
                      {{ session.os || 'SO desconocido' }}
                    </p>
                    <p class="text-caption text-disabled mb-0">
                      IP: {{ session.ip }} — {{ formatDate(session.date) }}
                    </p>
                  </div>
                  <VChip
                    v-if="index === 0"
                    color="success"
                    size="small"
                  >
                    Actual
                  </VChip>
                </div>
              </div>
              <p
                v-else
                class="text-center text-disabled pa-6"
              >
                Sin sesiones registradas
              </p>
            </VCardText>
          </VCard>
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>
