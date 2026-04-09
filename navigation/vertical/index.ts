export default [
  {
    title: 'Dashboard',
    to: { name: 'index' },
    icon: { icon: 'tabler-smart-home' },
  },
  {
    title: 'Leads',
    icon: { icon: 'tabler-users' },
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


// Fix active nav link visibility
.layout-nav-type-vertical {
  .nav-link.active {
    .nav-item-title {
      color: white !important;
    }
  }
}
