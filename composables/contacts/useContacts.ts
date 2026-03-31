export const useContacts = () => {
  const search = ref('')
  const statusFilter = ref('')
  const sourceFilter = ref('')
  const tagFilter = ref('')
  const page = ref(1)
  const limit = ref(20)
  const viewMode = ref<'table' | 'grid'>('table')

  const { data, refresh, pending } = useFetch('/api/contacts', {
    query: computed(() => ({
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      source: sourceFilter.value || undefined,
      tag: tagFilter.value || undefined,
      page: page.value,
      limit: limit.value,
    })),
    watch: [search, statusFilter, sourceFilter, tagFilter, page],
  })

  const contacts = computed(() => (data.value as any)?.data || [])
  const pagination = computed(() => (data.value as any)?.pagination || {})

  const resetFilters = () => {
    search.value = ''
    statusFilter.value = ''
    sourceFilter.value = ''
    tagFilter.value = ''
    page.value = 1
  }

  return {
    contacts,
    pagination,
    search,
    statusFilter,
    sourceFilter,
    tagFilter,
    page,
    limit,
    viewMode,
    pending,
    refresh,
    resetFilters,
  }
}
