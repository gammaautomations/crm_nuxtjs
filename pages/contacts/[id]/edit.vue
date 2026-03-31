<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

// Cargar datos del contacto
const { data: contact } = await useFetch(`/api/contacts/${id}`)

// Inicializar formulario con los datos existentes
const { form, loading, errorMsg, successMsg, v$, updateContact } = useContactForm(contact.value as any)

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

const handleUpdate = () => updateContact(id)
</script>
