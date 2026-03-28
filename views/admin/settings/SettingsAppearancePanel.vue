//

<script setup lang="ts">
const { form, loading, errorMsg, successMsg, saveSettings } = useSettings()

const logoPreview = ref<string | null>(null)
const faviconPreview = ref<string | null>(null)
const logoInput = ref<HTMLInputElement>()
const faviconInput = ref<HTMLInputElement>()
const uploadingLogo = ref(false)
const uploadingFavicon = ref(false)

const handleFileUpload = async (
  file: File,
  type: 'logo' | 'favicon',
) => {
  const isUploading = type === 'logo' ? uploadingLogo : uploadingFavicon

  if (!file.type.startsWith('image/')) {
    alert('Solo se permiten imágenes')

    return
  }

  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen no puede superar los 2MB')

    return
  }

  isUploading.value = true

  // Preview local
  const reader = new FileReader()

  reader.onload = e => {
    if (type === 'logo')
      logoPreview.value = e.target?.result as string
    else faviconPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  const formData = new FormData()

  formData.append(type, file)

  try {
    const data = await $fetch<{ logo?: string; favicon?: string }>(`/api/settings/${type}`, {
      method: 'POST',
      body: formData,
    })

    if (type === 'logo' && data.logo)
      form.value.logo = data.logo
    if (type === 'favicon' && data.favicon)
      form.value.favicon = data.favicon
  }
  catch (error: any) {
    alert(error?.data?.message || `Error al subir el ${type}`)
  }
  finally {
    isUploading.value = false
  }
}

const save = () => saveSettings({
  googleAnalyticsId: form.value.googleAnalyticsId,
  metaPixelId: form.value.metaPixelId,
})

onMounted(() => {
  if (form.value.logo)
    logoPreview.value = `/uploads/settings/${form.value.logo}`

  if (form.value.favicon)
    faviconPreview.value = `/uploads/settings/${form.value.favicon}`
})
</script>

<template>
  <VCard>
    <VCardText>
      <VForm @submit.prevent="save">
        <VRow>
          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Logo y Favicon
            </p>
          </VCol>

          <!-- Logo -->
          <VCol
            cols="12"
            md="6"
          >
            <div class="d-flex align-center gap-4">
              <VAvatar
                size="80"
                rounded
                color="primary"
                variant="tonal"
                class="cursor-pointer"
                data-allow-mismatch
                @click="logoInput?.click()"
              >
                <VImg
                  v-if="logoPreview || form.logo"
                  :src="logoPreview || `/uploads/settings/${form.logo}`"
                  data-allow-mismatch
                />
                <VIcon
                  v-else
                  icon="tabler-photo"
                  size="32"
                />
              </VAvatar>

              <div>
                <p class="font-weight-medium mb-1">
                  Logo
                </p>
                <p class="text-body-2 text-disabled mb-2">
                  PNG, JPG. Máx 2MB
                </p>
                <VBtn
                  size="small"
                  variant="outlined"
                  :loading="uploadingLogo"
                  @click="logoInput?.click()"
                >
                  Cambiar logo
                </VBtn>
              </div>
            </div>
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              class="d-none"
              @change="e => handleFileUpload((e.target as HTMLInputElement).files![0], 'logo')"
            >
          </VCol>

          <!-- Favicon -->
          <VCol
            cols="12"
            md="6"
          >
            <div class="d-flex align-center gap-4">
              <VAvatar
                size="80"
                rounded
                color="secondary"
                variant="tonal"
                class="cursor-pointer"
                data-allow-mismatch
                @click="faviconInput?.click()"
              >
                <VImg
                  v-if="faviconPreview || form.favicon"
                  :src="faviconPreview || `/uploads/settings/${form.favicon}`"
                  data-allow-mismatch
                />
                <VIcon
                  v-else
                  icon="tabler-star"
                  size="32"
                />
              </VAvatar>

              <div>
                <p class="font-weight-medium mb-1">
                  Favicon
                </p>
                <p class="text-body-2 text-disabled mb-2">
                  ICO, PNG. Máx 2MB
                </p>
                <VBtn
                  size="small"
                  variant="outlined"
                  :loading="uploadingFavicon"
                  @click="faviconInput?.click()"
                >
                  Cambiar favicon
                </VBtn>
              </div>
            </div>
            <input
              ref="faviconInput"
              type="file"
              accept="image/*,.ico"
              class="d-none"
              @change="e => handleFileUpload((e.target as HTMLInputElement).files![0], 'favicon')"
            >
          </VCol>

          <VDivider class="my-4" />

          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              SEO y Analytics
            </p>
          </VCol>

          <!-- Google Analytics -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.googleAnalyticsId"
              label="Google Analytics ID"
              placeholder="G-XXXXXXXXXX"
              prepend-inner-icon="tabler-brand-google-analytics"
            />
          </VCol>

          <!-- Meta Pixel -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.metaPixelId"
              label="Meta Pixel ID"
              placeholder="XXXXXXXXXXXXXXXXXX"
              prepend-inner-icon="tabler-brand-facebook"
            />
          </VCol>

          <!-- Alerts -->
          <VCol cols="12">
            <VAlert
              v-if="errorMsg"
              type="error"
              density="compact"
              class="mb-2"
            >
              {{ errorMsg }}
            </VAlert>

            <VAlert
              v-if="successMsg"
              type="success"
              density="compact"
              class="mb-2"
            >
              {{ successMsg }}
            </VAlert>
          </VCol>

          <!-- Botón -->
          <VCol cols="12">
            <VBtn
              type="submit"
              :loading="loading"
              prepend-icon="tabler-device-floppy"
            >
              Guardar cambios
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
