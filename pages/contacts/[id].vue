<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()

const { data: contact, pending } = await useFetch(`/api/contacts/${route.params.id}`)

const statusColor: Record<string, string> = {
  lead: 'info',
  prospect: 'warning',
  client: 'success',
  inactive: 'error',
}

const sourceIcon: Record<string, string> = {
  manual: 'tabler-user',
  gmail: 'tabler-brand-google',
  csv: 'tabler-file-spreadsheet',
  webhook: 'tabler-webhook',
  other: 'tabler-dots',
}
</script>

<template>
  <div v-if="!pending && contact">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center gap-2">
        <VBtn
          icon
          variant="text"
          color="secondary"
          @click="router.back()"
        >
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
        <h4 class="text-h4">
          {{ (contact as any).fullName || 'Sin nombre' }}
        </h4>
      </div>
      <VBtn
        color="primary"
        prepend-icon="tabler-edit"
        :to="`/contacts/${route.params.id}/edit`"
      >
        Editar
      </VBtn>
    </div>

    <VRow>
      <!-- Panel izquierdo -->
      <VCol
        cols="12"
        md="4"
      >
        <VCard class="mb-6">
          <VCardText class="text-center pt-8">
            <VAvatar
              size="100"
              color="primary"
              variant="tonal"
              class="mb-4"
            >
              <VImg
                v-if="(contact as any).avatar"
                :src="(contact as any).avatar"
              />
              <span
                v-else
                class="text-h4"
              >
                {{ (contact as any).fullName?.charAt(0) || '?' }}
              </span>
            </VAvatar>

            <h5 class="text-h5 mb-1">
              {{ (contact as any).fullName || 'Sin nombre' }}
            </h5>
            <p class="text-body-2 text-disabled mb-3">
              {{ (contact as any).jobTitle || '' }} {{ (contact as any).company ? `· ${(contact as any).company}` : '' }}
            </p>

            <div class="d-flex justify-center gap-2">
              <VChip
                :color="statusColor[(contact as any).status]"
                size="small"
              >
                {{ (contact as any).status }}
              </VChip>
              <VChip
                size="small"
                variant="outlined"
              >
                <VIcon
                  :icon="sourceIcon[(contact as any).source]"
                  size="14"
                  class="me-1"
                />
                {{ (contact as any).source }}
              </VChip>
            </div>
          </VCardText>

          <VDivider />

          <!-- Acciones rápidas -->
          <VCardText>
            <div class="d-flex justify-center gap-2">
              <VBtn
                v-if="(contact as any).email"
                icon
                variant="outlined"
                size="small"
                color="primary"
                :href="`mailto:${(contact as any).email}`"
              >
                <VIcon
                  icon="tabler-mail"
                  size="18"
                />
              </VBtn>
              <VBtn
                v-if="(contact as any).phone"
                icon
                variant="outlined"
                size="small"
                color="success"
                :href="`tel:${(contact as any).phone}`"
              >
                <VIcon
                  icon="tabler-phone"
                  size="18"
                />
              </VBtn>
              <VBtn
                v-if="(contact as any).whatsapp"
                icon
                variant="outlined"
                size="small"
                color="success"
                :href="`https://wa.me/${(contact as any).whatsapp}`"
                target="_blank"
              >
                <VIcon
                  icon="tabler-brand-whatsapp"
                  size="18"
                />
              </VBtn>
              <VBtn
                v-if="(contact as any).linkedin"
                icon
                variant="outlined"
                size="small"
                color="info"
                :href="(contact as any).linkedin"
                target="_blank"
              >
                <VIcon
                  icon="tabler-brand-linkedin"
                  size="18"
                />
              </VBtn>
            </div>
          </VCardText>
        </VCard>

        <!-- Tags -->
        <VCard
          v-if="(contact as any).tags?.length"
          class="mb-6"
        >
          <VCardText>
            <p class="text-overline text-uppercase mb-3">
              Tags
            </p>
            <div class="d-flex flex-wrap gap-2">
              <VChip
                v-for="tag in (contact as any).tags"
                :key="tag"
                size="small"
                color="primary"
                variant="tonal"
              >
                {{ tag }}
              </VChip>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Panel derecho -->
      <VCol
        cols="12"
        md="8"
      >
        <VCard class="mb-6">
          <VCardText>
            <p class="text-overline text-uppercase mb-4">
              Información de contacto
            </p>

            <VList>
              <VListItem v-if="(contact as any).email">
                <template #prepend>
                  <VIcon
                    icon="tabler-mail"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ (contact as any).email }}</VListItemTitle>
                <VListItemSubtitle>Email principal</VListItemSubtitle>
              </VListItem>

              <VListItem v-if="(contact as any).email2">
                <template #prepend>
                  <VIcon
                    icon="tabler-mail"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ (contact as any).email2 }}</VListItemTitle>
                <VListItemSubtitle>Email secundario</VListItemSubtitle>
              </VListItem>

              <VListItem v-if="(contact as any).phone">
                <template #prepend>
                  <VIcon
                    icon="tabler-phone"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ (contact as any).phone }}</VListItemTitle>
                <VListItemSubtitle>Teléfono</VListItemSubtitle>
              </VListItem>

              <VListItem v-if="(contact as any).phone2">
                <template #prepend>
                  <VIcon
                    icon="tabler-phone"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ (contact as any).phone2 }}</VListItemTitle>
                <VListItemSubtitle>Teléfono alternativo</VListItemSubtitle>
              </VListItem>

              <VListItem v-if="(contact as any).whatsapp">
                <template #prepend>
                  <VIcon
                    icon="tabler-brand-whatsapp"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ (contact as any).whatsapp }}</VListItemTitle>
                <VListItemSubtitle>WhatsApp</VListItemSubtitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>

        <!-- Empresa -->
        <VCard
          v-if="(contact as any).company || (contact as any).website"
          class="mb-6"
        >
          <VCardText>
            <p class="text-overline text-uppercase mb-4">
              Empresa
            </p>
            <VList>
              <VListItem v-if="(contact as any).company">
                <template #prepend>
                  <VIcon
                    icon="tabler-building"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>{{ (contact as any).company }}</VListItemTitle>
                <VListItemSubtitle>{{ (contact as any).jobTitle }}</VListItemSubtitle>
              </VListItem>

              <VListItem v-if="(contact as any).website">
                <template #prepend>
                  <VIcon
                    icon="tabler-world"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  <a
                    :href="(contact as any).website"
                    target="_blank"
                  >
                    {{ (contact as any).website }}
                  </a>
                </VListItemTitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>

        <!-- Dirección -->
        <VCard
          v-if="(contact as any).address || (contact as any).city"
          class="mb-6"
        >
          <VCardText>
            <p class="text-overline text-uppercase mb-4">
              Dirección
            </p>
            <VList>
              <VListItem>
                <template #prepend>
                  <VIcon
                    icon="tabler-map-pin"
                    class="me-3"
                  />
                </template>
                <VListItemTitle>
                  {{ [(contact as any).address, (contact as any).city, (contact as any).state, (contact as any).country].filter(Boolean).join(', ') }}
                </VListItemTitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>

        <!-- Notas -->
        <VCard v-if="(contact as any).notes">
          <VCardText>
            <p class="text-overline text-uppercase mb-3">
              Notas
            </p>
            <p class="text-body-2">
              {{ (contact as any).notes }}
            </p>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>

  <!-- Loading -->
  <div
    v-else
    class="d-flex justify-center pa-10"
  >
    <VProgressCircular
      indeterminate
      color="primary"
    />
  </div>
</template>
