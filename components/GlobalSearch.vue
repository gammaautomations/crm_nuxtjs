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
    const [leads, contacts, cases, invoices] = await Promise.all([
      $fetch('/api/leads', { query: { search: query, limit: 5 } }) as any,
      $fetch('/api/contacts', { query: { search: query, limit: 5 } }) as any,
      $fetch('/api/cases', { query: { search: query, limit: 5 } }) as any,
      $fetch('/api/invoices', { query: { search: query, limit: 5 } }) as any,
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

    const caseResults = (cases?.data || []).map((c: any) => ({
      type: 'case',
      id: c._id,
      title: c.number,
      subtitle: c.title,
      icon: 'tabler-folder',
      to: `/cases/${c._id}`,
    }))

    const invoiceResults = (invoices?.data || []).map((i: any) => ({
      type: 'invoice',
      id: i._id,
      title: i.number,
      subtitle: i.client?.name,
      icon: 'tabler-file-invoice',
      to: `/billing/${i._id}`,
    }))

    searchResults.value = [...leadResults, ...contactResults, ...caseResults, ...invoiceResults]
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
</script>s

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
