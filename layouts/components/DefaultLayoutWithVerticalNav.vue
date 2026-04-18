<script lang="ts" setup>
import GlobalSearch from '@/components/GlobalSearch.vue'
import NotificationBell from '@/components/NotificationBell.vue'
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import { useLeadStore } from '@/stores/useLeadStore'
import NavBarI18n from '@core/components/I18n.vue'
import { VerticalNavLayout } from '@layouts'
import { themeConfig } from '@themeConfig'

const leadStore = useLeadStore()
const authStore = useAuthStore()
const role = computed(() => authStore.user?.role)

const getNavItems = () => {
  const items: any[] = [
    {
      title: 'Dashboard',
      to: { name: 'index' },
      icon: { icon: 'tabler-smart-home' },
    },
  ]

  if (['Admin', 'Abogado', 'Recepcionista'].includes(role.value || '')) {
    items.push({
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
    })
  }

  if (['Admin', 'Abogado', 'Recepcionista'].includes(role.value || '')) {
    items.push({
      title: 'Contactos',
      to: { name: 'contacts' },
      icon: { icon: 'tabler-address-book' },
    })
  }

  if (['Admin', 'Abogado', 'Recepcionista'].includes(role.value || '')) {
    items.push({
      title: 'Facturación',
      to: { name: 'billing' },
      icon: { icon: 'tabler-file-invoice' },
    })
  }

  if (['Admin', 'Superuser'].includes(role.value || '')) {
    const adminChildren: any[] = []

    if (role.value === 'Admin') {
      adminChildren.push(
        {
          title: 'Usuarios',
          to: { name: 'admin-users' },
          icon: { icon: 'tabler-user-cog' },
        },
        {
          title: 'Abogados',
          to: { name: 'admin-lawyers' },
          icon: { icon: 'tabler-briefcase' },
        },
        {
          title: 'Estadísticas abogados',
          to: { name: 'admin-lawyers-stats' },
          icon: { icon: 'tabler-chart-bar' },
        },
        {
          title: 'Especialidades',
          to: { name: 'admin-specialties' },
          icon: { icon: 'tabler-certificate' },
        },
      )
    }

    adminChildren.push({
      title: 'Configuración',
      to: { name: 'admin' },
      icon: { icon: 'tabler-adjustments' },
    })

    items.push({
      title: 'Administración',
      icon: { icon: 'tabler-settings' },
      children: adminChildren,
    })
  }

  items.push({
    title: 'Mi Perfil',
    to: { name: 'user-profile' },
    icon: { icon: 'tabler-user-circle' },
  })

  return items
}

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

        <GlobalSearch class="me-2" />

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
  </VerticalNavLayout>
</template>
