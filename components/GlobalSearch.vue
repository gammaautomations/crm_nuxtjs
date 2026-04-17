<script setup lang="ts">
const isDialogVisible = ref(false)
const searchResults = ref<any[]>([])
const isLoading = ref(false)

const search = async (query: string) => {
  if (!query || query.length < 2) {
    searchResults.value = []

    return
  }

  isLoading.value = true
  try {
    const [leads, contacts] = await Promise.all([
      $fetch('/api/leads', { query: { search: query, limit: 5 } }) as any,
      $fetch('/api/contacts', { query: { search: query, limit: 5 } }) as any,
    ])

    const leadResults = (leads?.data || []).map((l: any) => ({
      type: 'lead',
      id: l._id,
      title: l.nombre,
      subtitle: l.area,
      icon: 'tabler-users',
      to: `/leads/${l._id}`,
    }))

    const contactResults = (contacts?.data || contacts || []).map((c: any) => ({
      type: 'contact',
      id: c._id,
      title: `${c.firstName} ${c.lastName}`,
      subtitle: c.email,
      icon: 'tabler-address-book',
      to: `/contacts/${c._id}`,
    }))

    searchResults.value = [...leadResults, ...contactResults]
  }
  catch {
    searchResults.value = []
  }
  finally {
    isLoading.value = false
  }
}

const router = useRouter()

const goTo = (item: any) => {
  router.push(item.to)
  isDialogVisible.value = false
  searchResults.value = []
}
</script>

<template>
  <div>
    <!-- Botón para abrir -->
    <IconBtn @click="isDialogVisible = true">
      <VIcon icon="tabler-search" />
    </IconBtn>

    <AppBarSearch
      v-model:is-dialog-visible="isDialogVisible"
      :search-results="searchResults"
      :is-loading="isLoading"
      @search="search"
    >
      <!-- Resultado -->
      <template #searchResult="{ item }">
        <VListItem
          :prepend-icon="(item as any).icon"
          :title="(item as any).title"
          :subtitle="(item as any).subtitle"
          class="cursor-pointer"
          @click="goTo(item)"
        />
      </template>

      <!-- Sin resultados -->
      <template #noData>
        <VCardText class="text-center pa-10 text-disabled">
          Sin resultados
        </VCardText>
      </template>
    </AppBarSearch>
  </div>
</template>
