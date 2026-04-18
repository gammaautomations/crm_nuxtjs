<script setup lang="ts">
const { form, loading, errorMsg, successMsg, saveSettings } = useSettings()

const save = () => saveSettings({
  companyName: form.value.companyName,
  companyNif: form.value.companyNif,
  companyEmail: form.value.companyEmail,
  companyPhone: form.value.companyPhone,
  companyAddress: form.value.companyAddress,
  companyCity: form.value.companyCity,
  companyZip: form.value.companyZip,
  companyIsland: form.value.companyIsland,
  companyProvince: form.value.companyProvince,
  cabildoReg: form.value.cabildoReg,
})
</script>

<template>
  <VCard>
    <VCardText>
      <VForm @submit.prevent="save">
        <VRow>
          <VCol cols="12">
            <p class="text-overline text-uppercase mb-0">
              Datos del emisor (aparecen en todas las facturas)
            </p>
          </VCol>

          <!-- Nombre -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.companyName"
              label="Nombre / Razón social"
              placeholder="Despacho Jurídico S.L."
              prepend-inner-icon="tabler-building"
            />
          </VCol>

          <!-- NIF -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.companyNif"
              label="NIF / CIF"
              placeholder="B12345678"
              prepend-inner-icon="tabler-id"
            />
          </VCol>

          <!-- Email -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.companyEmail"
              label="Email de facturación"
              placeholder="facturacion@despacho.com"
              type="email"
              prepend-inner-icon="tabler-mail"
            />
          </VCol>

          <!-- Teléfono -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.companyPhone"
              label="Teléfono"
              placeholder="+34 928 000 000"
              prepend-inner-icon="tabler-phone"
            />
          </VCol>

          <VCol cols="12">
            <VDivider />
            <p class="text-overline text-uppercase mb-0 mt-4">
              Dirección fiscal
            </p>
          </VCol>

          <!-- Dirección -->
          <VCol cols="12">
            <AppTextField
              v-model="form.companyAddress"
              label="Dirección"
              placeholder="Calle Mayor, 1"
              prepend-inner-icon="tabler-map-pin"
            />
          </VCol>

          <!-- CP -->
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="form.companyZip"
              label="Código postal"
              placeholder="35001"
            />
          </VCol>

          <!-- Ciudad -->
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="form.companyCity"
              label="Localidad"
              placeholder="Las Palmas de G.C."
            />
          </VCol>

          <!-- Isla -->
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="form.companyIsland"
              label="Isla"
              placeholder="Gran Canaria"
            />
          </VCol>

          <!-- Provincia -->
          <VCol
            cols="12"
            md="3"
          >
            <AppTextField
              v-model="form.companyProvince"
              label="Provincia"
              placeholder="Las Palmas"
            />
          </VCol>

          <VCol cols="12">
            <VDivider />
            <p class="text-overline text-uppercase mb-0 mt-4">
              Registro
            </p>
          </VCol>

          <!-- Registro Cabildo -->
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.cabildoReg"
              label="Nº registro Cabildo (opcional)"
              placeholder="RC-12345"
              prepend-inner-icon="tabler-certificate"
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
