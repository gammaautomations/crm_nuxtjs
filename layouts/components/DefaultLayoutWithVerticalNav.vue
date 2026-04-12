<script lang="ts" setup>
import { useLeadStore } from '@/stores/useLeadStore'
import { themeConfig } from '@themeConfig'

// Components
import NotificationBell from '@/components/NotificationBell.vue'
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'

// @layouts plugin
import { VerticalNavLayout } from '@layouts'

const leadStore = useLeadStore()

const getNavItems = () => [
  {
    title: 'Dashboard',
    to: { name: 'index' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Leads',
    icon: { icon: 'tabler-users' },
    badgeContent: leadStore.unassignedCount > 0 ? String(leadStore.unassignedCount) : null,
    badgeClass: 'bg-error',
    children: [
      {
        title: 'Lista',
        to: { name: 'leads' },
        icon: { icon: 'tabler-list' },
      },
      {
        title: 'Kanban',
        to: { name: 'leads-kanban' },
        icon: { icon: 'tabler-layout-kanban' },
      },
    ],
  },
  {
    title: 'Contactos',
    to: { name: 'contacts' },
    icon: { icon: 'tabler-address-book' },
  },
  {
    title: 'Administración',
    icon: { icon: 'tabler-settings' },
    children: [
      {
        title: 'Abogados',
        to: { name: 'admin-lawyers' },
        icon: { icon: 'tabler-briefcase' },
      },
      {
        title: 'Especialidades',
        to: { name: 'admin-specialties' },
        icon: { icon: 'tabler-certificate' },
      },
      {
        title: 'Configuración',
        to: { name: 'admin' },
        icon: { icon: 'tabler-adjustments' },
      },
    ],
  },
]

const navItems = ref(getNavItems())

watchEffect(() => {
  navItems.value = getNavItems()
})
</script>

<template>
  <VerticalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <IconBtn
          id="vertical-nav-toggle-btn"
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon
            size="26"
            icon="tabler-menu-2"
          />
        </IconBtn>

        <NavbarThemeSwitcher />

        <VSpacer />

        <NavBarI18n
          v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
          :languages="themeConfig.app.i18n.langConfig"
        />
        <NotificationBell class="me-4" />
        <UserProfile />
      </div>
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </VerticalNavLayout>
</template>
