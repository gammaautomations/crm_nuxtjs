// UserBioPanel.vue

<script setup lang="ts">
const authStore = useAuthStore()

const { data, refresh } = await useFetch('/api/profile')

const isUploading = ref(false)
const fileInput = ref<HTMLInputElement>()

const openFileInput = () => {
  fileInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file)
    return

  // Validar tipo y tamaño
  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes')

    return
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen no puede superar los 2MB')

    return
  }

  isUploading.value = true

  const formData = new FormData()

  formData.append('avatar', file)

  try {
    await $fetch('/api/profile/avatar', {
      method: 'POST',
      body: formData,
    })

    await refresh()
    await authStore.fetchMe()
  }
  catch (error: any) {
    alert(error?.data?.message || 'Error al subir el avatar')
  }
  finally {
    isUploading.value = false
  }
}

const roleColor: Record<string, string> = {
  Admin: 'error',
  Superuser: 'warning',
  User: 'success',
}
</script>

<template>
  <VCard v-if="data">
    <VCardText class="text-center pt-10">
      <!-- Avatar -->
      <div class="position-relative d-inline-block mb-4">
        <VAvatar
          size="120"
          class="cursor-pointer"
          @click="openFileInput"
        >
          <VImg
            :src="data.user.avatar !== 'sin-imagen.png'
              ? `/uploads/avatars/${data.user.avatar}`
              : '/uploads/avatars/sin-imagen.png'"
            :alt="data.user.username"
          />
        </VAvatar>

        <!-- Botón de editar avatar -->
        <VBtn
          icon
          size="x-small"
          color="primary"
          class="position-absolute"
          style="inset-block-end: 0; inset-inline-end: 0;"
          :loading="isUploading"
          @click="openFileInput"
        >
          <VIcon
            icon="tabler-camera"
            size="14"
          />
        </VBtn>

        <!-- Input oculto -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="d-none"
          @change="handleAvatarChange"
        >
      </div>

      <!-- Nombre y rol -->
      <h5 class="text-h5 mb-1">
        {{ data.profile?.fullname || data.user.username }}
      </h5>

      <VChip
        :color="roleColor[data.user.role] || 'primary'"
        size="small"
        class="mb-4"
      >
        {{ data.user.role }}
      </VChip>
    </VCardText>

    <VDivider />

    <!-- Detalles -->
    <VCardText>
      <p class="text-overline text-uppercase mb-3">
        Detalles
      </p>

      <VList class="card-list">
        <VListItem>
          <template #prepend>
            <VIcon
              icon="tabler-user"
              size="20"
              class="me-2"
            />
          </template>
          <VListItemTitle>
            <span class="font-weight-medium">Username: </span>
            <span class="text-body-2">{{ data.user.username }}</span>
          </VListItemTitle>
        </VListItem>

        <VListItem>
          <template #prepend>
            <VIcon
              icon="tabler-mail"
              size="20"
              class="me-2"
            />
          </template>
          <VListItemTitle>
            <span class="font-weight-medium">Email: </span>
            <span class="text-body-2">{{ data.user.email }}</span>
          </VListItemTitle>
        </VListItem>

        <VListItem v-if="data.profile?.phone">
          <template #prepend>
            <VIcon
              icon="tabler-phone"
              size="20"
              class="me-2"
            />
          </template>
          <VListItemTitle>
            <span class="font-weight-medium">Teléfono: </span>
            <span class="text-body-2">{{ data.profile.phone }}</span>
          </VListItemTitle>
        </VListItem>

        <VListItem v-if="data.profile?.whatsapp">
          <template #prepend>
            <VIcon
              icon="tabler-brand-whatsapp"
              size="20"
              class="me-2"
            />
          </template>
          <VListItemTitle>
            <span class="font-weight-medium">WhatsApp: </span>
            <span class="text-body-2">{{ data.profile.whatsapp }}</span>
          </VListItemTitle>
        </VListItem>

        <VListItem>
          <template #prepend>
            <VIcon
              icon="tabler-check"
              size="20"
              class="me-2"
            />
          </template>
          <VListItemTitle>
            <span class="font-weight-medium">Estado: </span>
            <VChip
              :color="data.user.status ? 'success' : 'error'"
              size="x-small"
            >
              {{ data.user.status ? 'Activo' : 'Inactivo' }}
            </VChip>
          </VListItemTitle>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>
