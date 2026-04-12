import { useLeadStore } from '~/stores/useLeadStore'

export default () => {
  const leadStore = useLeadStore()

  return [
    {
      title: 'Dashboard',
      to: { name: 'index' },
      icon: { icon: 'tabler-smart-home' },
    },
    {
      title: 'Leads',
      icon: { icon: 'tabler-users' },
      badgeContent: leadStore.unassignedCount > 0 ? String(leadStore.unassignedCount) : undefined,
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
}
