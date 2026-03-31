<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()
const { form, loading, errorMsg, successMsg, v$, createContact } = useContactForm()

const statusOptions = [
  { title: 'Lead', value: 'lead' },
  { title: 'Prospecto', value: 'prospect' },
  { title: 'Cliente', value: 'client' },
  { title: 'Inactivo', value: 'inactive' },
]

const newTag = ref('')

const addTag = () => {
  if (newTag.value && !form.value.tags.includes(newTag.value)) {
    form.value.tags.push(newTag.value)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center gap-2 mb-6">
      <VBtn
        icon
        variant="text"
        color="secondary"
        @click="router.back()"
      >
        <VIcon icon="tabler-arrow-left" />
      </VBtn>
      <h4 class="text-h4">
        Nuevo contacto
      </h4>
    </div>

    <VForm @submit.prevent="createContact">
      <VRow>
        <!-- Información personal -->
        <VCol cols="12">
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Información personal
              </p>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.firstName"
                    label="Nombre"
                    placeholder="John"
                    prepend-inner-icon="tabler-user"
                    :error-messages="v$.firstName.$errors.map(e => e.$message as string)"
                    @blur="v$.firstName.$touch"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.lastName"
                    label="Apellidos"
                    placeholder="Doe"
                    prepend-inner-icon="tabler-user"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.email"
                    label="Email principal"
                    type="email"
                    placeholder="john@email.com"
                    prepend-inner-icon="tabler-mail"
                    :error-messages="v$.email.$errors.map(e => e.$message as string)"
                    @blur="v$.email.$touch"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.email2"
                    label="Email secundario"
                    type="email"
                    placeholder="john2@email.com"
                    prepend-inner-icon="tabler-mail"
                    :error-messages="v$.email2.$errors.map(e => e.$message as string)"
                    @blur="v$.email2.$touch"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppTextField
                    v-model="form.phone"
                    label="Teléfono"
                    placeholder="+34 600 000 000"
                    prepend-inner-icon="tabler-phone"
                    :error-messages="v$.phone.$errors.map(e => e.$message as string)"
                    @blur="v$.phone.$touch"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppTextField
                    v-model="form.phone2"
                    label="Teléfono alternativo"
                    placeholder="+34 600 000 000"
                    prepend-inner-icon="tabler-phone-plus"
                    :error-messages="v$.phone2.$errors.map(e => e.$message as string)"
                    @blur="v$.phone2.$touch"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppTextField
                    v-model="form.whatsapp"
                    label="WhatsApp"
                    placeholder="+34 600 000 000"
                    prepend-inner-icon="tabler-brand-whatsapp"
                    :error-messages="v$.whatsapp.$errors.map(e => e.$message as string)"
                    @blur="v$.whatsapp.$touch"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Empresa -->
        <VCol cols="12">
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Empresa
              </p>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.company"
                    label="Empresa"
                    placeholder="Mi Empresa SL"
                    prepend-inner-icon="tabler-building"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.jobTitle"
                    label="Cargo"
                    placeholder="CEO"
                    prepend-inner-icon="tabler-briefcase"
                  />
                </VCol>
                <VCol cols="12">
                  <AppTextField
                    v-model="form.website"
                    label="Sitio web"
                    placeholder="https://miempresa.com"
                    prepend-inner-icon="tabler-world"
                    :error-messages="v$.website.$errors.map(e => e.$message as string)"
                    @blur="v$.website.$touch"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Dirección -->
        <VCol cols="12">
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Dirección
              </p>
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="form.address"
                    label="Dirección"
                    placeholder="Calle Mayor 1"
                    prepend-inner-icon="tabler-map-pin"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppTextField
                    v-model="form.city"
                    label="Ciudad"
                    placeholder="Madrid"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppTextField
                    v-model="form.state"
                    label="Provincia"
                    placeholder="Madrid"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                >
                  <AppTextField
                    v-model="form.country"
                    label="País"
                    placeholder="España"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Redes sociales -->
        <VCol cols="12">
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                Redes sociales
              </p>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.linkedin"
                    label="LinkedIn"
                    placeholder="https://linkedin.com/in/..."
                    prepend-inner-icon="tabler-brand-linkedin"
                    :error-messages="v$.linkedin.$errors.map(e => e.$message as string)"
                    @blur="v$.linkedin.$touch"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.twitter"
                    label="Twitter"
                    placeholder="@usuario"
                    prepend-inner-icon="tabler-brand-twitter"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.facebook"
                    label="Facebook"
                    placeholder="https://facebook.com/..."
                    prepend-inner-icon="tabler-brand-facebook"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppTextField
                    v-model="form.instagram"
                    label="Instagram"
                    placeholder="@usuario"
                    prepend-inner-icon="tabler-brand-instagram"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <!-- CRM -->
        <VCol cols="12">
          <VCard class="mb-6">
            <VCardText>
              <p class="text-overline text-uppercase mb-4">
                CRM
              </p>
              <VRow>
                <VCol
                  cols="12"
                  md="6"
                >
                  <AppSelect
                    v-model="form.status"
                    label="Estado"
                    :items="statusOptions"
                    prepend-inner-icon="tabler-flag"
                  />
                </VCol>

                <!-- Tags -->
                <VCol cols="12">
                  <div class="d-flex gap-2 mb-2">
                    <AppTextField
                      v-model="newTag"
                      label="Añadir tag"
                      placeholder="Escribe un tag..."
                      prepend-inner-icon="tabler-tag"
                      @keydown.enter.prevent="addTag"
                    />
                    <VBtn
                      color="primary"
                      variant="outlined"
                      @click="addTag"
                    >
                      Añadir
                    </VBtn>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <VChip
                      v-for="tag in form.tags"
                      :key="tag"
                      size="small"
                      color="primary"
                      variant="tonal"
                      closable
                      @click:close="removeTag(tag)"
                    >
                      {{ tag }}
                    </VChip>
                  </div>
                </VCol>

                <!-- Notas -->
                <VCol cols="12">
                  <AppTextarea
                    v-model="form.notes"
                    label="Notas"
                    placeholder="Añade notas sobre este contacto..."
                    rows="4"
                  />
                </VCol>
              </VRow>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Alerts y botones -->
        <VCol cols="12">
          <VAlert
            v-if="errorMsg"
            type="error"
            density="compact"
            class="mb-4"
          >
            {{ errorMsg }}
          </VAlert>

          <VAlert
            v-if="successMsg"
            type="success"
            density="compact"
            class="mb-4"
          >
            {{ successMsg }}
          </VAlert>

          <div class="d-flex gap-4">
            <VBtn
              type="submit"
              color="primary"
              :loading="loading"
              prepend-icon="tabler-device-floppy"
            >
              Guardar contacto
            </VBtn>
            <VBtn
              variant="outlined"
              color="secondary"
              @click="router.back()"
            >
              Cancelar
            </VBtn>
          </div>
        </VCol>
      </VRow>
    </VForm>
  </div>
</template>
