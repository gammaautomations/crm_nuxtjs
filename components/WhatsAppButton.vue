<script setup lang="ts">
const props = defineProps<{
  phone: string
  message?: string
  size?: 'small' | 'default' | 'large'
  variant?: 'flat' | 'outlined' | 'tonal' | 'text'
  block?: boolean
}>()

const waUrl = computed(() => {
  if (!props.phone)
    return null

  // Limpiar el número — solo dígitos y el + inicial
  const cleaned = props.phone.replace(/[^\d+]/g, '')

  // Si empieza por 6 o 7 (España) añadir prefijo 34
  const number = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned.startsWith('34') ? cleaned : `34${cleaned}`

  const text = encodeURIComponent(props.message || '¡Hola! Me pongo en contacto con usted desde el despacho Garriga & Asociados.')

  return `https://wa.me/${number}?text=${text}`
})
</script>

<template>
  <VBtn
    v-if="waUrl"
    :href="waUrl"
    target="_blank"
    rel="noopener noreferrer"
    :size="size || 'default'"
    :variant="variant || 'tonal'"
    :block="block"
    color="#25D366"
    prepend-icon="tabler-brand-whatsapp"
  >
    WhatsApp
  </VBtn>
</template>
