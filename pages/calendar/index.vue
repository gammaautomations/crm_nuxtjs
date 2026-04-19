<script setup lang="ts">
// pages/calendar/index.vue
import esLocale from '@fullcalendar/core/locales/es'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'

definePageMeta({
  middleware: ['auth'],
})

const { swalConfirmation } = useSweetAlert()

// ─── Datos auxiliares ─────────────────────────────────────────────────────────
const { data: lawyersData } = await useFetch('/api/lawyers')
const { data: contactsData } = await useFetch('/api/contacts?limit=200')

const lawyers = computed(() => lawyersData.value || [])

const contacts = computed(() => {
  console.log('contactsData:', contactsData.value)

  return (contactsData.value as any)?.data || contactsData.value || []
})

// ─── Estado ───────────────────────────────────────────────────────────────────
const calendarRef = ref()
const dialog = ref(false)
const loadingAction = ref(false)
const errorMsg = ref('')
const editingId = ref<string | null>(null)
const appointments = ref<any[]>([])

// ─── Formulario ───────────────────────────────────────────────────────────────
const defaultForm = () => ({
  title: '',
  description: '',
  type: 'appointment',
  status: 'pending',
  startAt: '',
  endAt: '',
  allDay: false,
  contactId: '',
  lawyerId: '',
  location: '',
  meetUrl: '',
  reminderMinutes: 30,
  color: '#7367F0',
})

const form = ref(defaultForm())

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeItems = [
  { title: 'Cita', value: 'appointment' },
  { title: 'Tarea', value: 'task' },
  { title: 'Recordatorio', value: 'reminder' },
  { title: 'Audiencia', value: 'hearing' },
  { title: 'Reunión', value: 'meeting' },
]

const statusItems = [
  { title: 'Pendiente', value: 'pending' },
  { title: 'Confirmada', value: 'confirmed' },
  { title: 'Completada', value: 'completed' },
  { title: 'Cancelada', value: 'cancelled' },
]

const reminderItems = [
  { title: '15 minutos', value: 15 },
  { title: '30 minutos', value: 30 },
  { title: '1 hora', value: 60 },
  { title: '2 horas', value: 120 },
  { title: '1 día', value: 1440 },
]

const colorItems = [
  { title: 'Morado', value: '#7367F0' },
  { title: 'Verde', value: '#28C76F' },
  { title: 'Rojo', value: '#FF4C51' },
  { title: 'Amarillo', value: '#FFB400' },
  { title: 'Azul', value: '#00CFE8' },
  { title: 'Gris', value: '#6c757d' },
]

const toDatetimeLocal = (d: string) =>
  d ? new Date(d).toISOString().slice(0, 16) : ''

// ─── Cargar citas ─────────────────────────────────────────────────────────────
const fetchAppointments = async (from?: string, to?: string) => {
  const query: Record<string, string> = {}
  if (from)
    query.from = from
  if (to)
    query.to = to

  const data = await $fetch<any[]>('/api/appointments', { query })

  appointments.value = data

  return data.map((a: any) => ({
    id: a._id,
    title: a.title,
    start: a.startAt,
    end: a.endAt,
    allDay: a.allDay,
    backgroundColor: a.color || '#7367F0',
    borderColor: a.color || '#7367F0',
    extendedProps: a,
  }))
}

// ─── FullCalendar options ─────────────────────────────────────────────────────
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  locale: esLocale,
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  height: 'auto',

  // Cargar eventos desde la API
  events: async (info: any) => {
    return await fetchAppointments(
      info.startStr,
      info.endStr,
    )
  },

  // Click en evento existente → abrir edición
  eventClick: (info: any) => {
    openDialog(info.event.extendedProps)
  },

  // Seleccionar rango → abrir creación
  select: (info: any) => {
    form.value = defaultForm()
    form.value.startAt = info.startStr.slice(0, 16)
    form.value.endAt = info.endStr.slice(0, 16)
    editingId.value = null
    dialog.value = true
  },

  // Drag & drop para mover evento
  eventDrop: async (info: any) => {
    try {
      await $fetch(`/api/appointments/${info.event.id}`, {
        method: 'PUT',
        body: {
          startAt: info.event.start?.toISOString(),
          endAt: info.event.end?.toISOString() || info.event.start?.toISOString(),
        },
      })
    }
    catch {
      info.revert()
    }
  },

  // Resize evento
  eventResize: async (info: any) => {
    try {
      await $fetch(`/api/appointments/${info.event.id}`, {
        method: 'PUT',
        body: {
          startAt: info.event.start?.toISOString(),
          endAt: info.event.end?.toISOString(),
        },
      })
    }
    catch {
      info.revert()
    }
  },
})

// ─── Dialog ───────────────────────────────────────────────────────────────────
const openDialog = (appointment?: any) => {
  errorMsg.value = ''
  if (appointment) {
    editingId.value = appointment._id
    form.value = {
      title: appointment.title || '',
      description: appointment.description || '',
      type: appointment.type || 'appointment',
      status: appointment.status || 'pending',
      startAt: toDatetimeLocal(appointment.startAt),
      endAt: toDatetimeLocal(appointment.endAt),
      allDay: appointment.allDay || false,
      contactId: appointment.contactId?._id || appointment.contactId || '',
      lawyerId: appointment.lawyerId?._id || appointment.lawyerId || '',
      location: appointment.location || '',
      meetUrl: appointment.meetUrl || '',
      reminderMinutes: appointment.reminderMinutes || 30,
      color: appointment.color || '#7367F0',
    }
  }
  else {
    editingId.value = null
    form.value = defaultForm()
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  errorMsg.value = ''
  editingId.value = null
}

// ─── Guardar ──────────────────────────────────────────────────────────────────
const save = async () => {
  errorMsg.value = ''

  if (!form.value.title.trim()) {
    errorMsg.value = 'El título es requerido'

    return
  }

  if (!form.value.startAt || !form.value.endAt) {
    errorMsg.value = 'Las fechas de inicio y fin son requeridas'

    return
  }

  loadingAction.value = true

  try {
    const body = {
      ...form.value,
      startAt: new Date(form.value.startAt).toISOString(),
      endAt: new Date(form.value.endAt).toISOString(),
    }

    if (editingId.value)
      await $fetch(`/api/appointments/${editingId.value}`, { method: 'PUT', body })

    else
      await $fetch('/api/appointments', { method: 'POST', body })

    closeDialog()
    calendarRef.value?.getApi().refetchEvents()
  }
  catch (e: any) {
    errorMsg.value = e?.data?.message || 'Error al guardar la cita'
  }
  finally {
    loadingAction.value = false
  }
}

// ─── Eliminar ─────────────────────────────────────────────────────────────────
const deleteAppointment = async () => {
  if (!editingId.value)
    return

  const confirmed = await swalConfirmation({
    title: '¿Cancelar cita?',
    text: 'La cita se marcará como cancelada.',
    icon: 'warning',
  })

  if (!confirmed)
    return

  loadingAction.value = true
  try {
    await $fetch(`/api/appointments/${editingId.value}`, { method: 'DELETE' })
    closeDialog()
    calendarRef.value?.getApi().refetchEvents()
  }
  catch (e: any) {
    errorMsg.value = e?.data?.message || 'Error al cancelar la cita'
  }
  finally {
    loadingAction.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h4 class="text-h4">
        Calendario
      </h4>
      <VBtn
        color="primary"
        prepend-icon="tabler-plus"
        @click="openDialog"
      >
        Nueva cita
      </VBtn>
    </div>

    <!-- Calendario -->
    <VCard>
      <VCardText class="pa-4">
        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
        />
      </VCardText>
    </VCard>

    <!-- Dialog crear/editar -->
    <VDialog
      v-model="dialog"
      max-width="640"
      scrollable
    >
      <VCard>
        <VCardTitle class="pa-6 pb-2 d-flex align-center justify-space-between">
          <span>{{ editingId ? 'Editar cita' : 'Nueva cita' }}</span>
          <VBtn
            icon="tabler-x"
            variant="text"
            size="small"
            @click="closeDialog"
          />
        </VCardTitle>

        <VCardText>
          <VRow>
            <!-- Título -->
            <VCol cols="12">
              <AppTextField
                v-model="form.title"
                label="Título *"
                placeholder="Ej: Consulta inicial con cliente"
                autofocus
              />
            </VCol>

            <!-- Tipo y estado -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppSelect
                v-model="form.type"
                label="Tipo"
                :items="typeItems"
              />
            </VCol>
            <VCol
              cols="12"
              sm="6"
            >
              <AppSelect
                v-model="form.status"
                label="Estado"
                :items="statusItems"
              />
            </VCol>

            <!-- Fechas -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.startAt"
                label="Inicio *"
                :type="form.allDay ? 'date' : 'datetime-local'"
              />
            </VCol>
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.endAt"
                label="Fin *"
                :type="form.allDay ? 'date' : 'datetime-local'"
              />
            </VCol>

            <!-- Todo el día -->
            <VCol cols="12">
              <VSwitch
                v-model="form.allDay"
                label="Todo el día"
                color="primary"
                density="compact"
                hide-details
              />
            </VCol>

            <!-- Descripción -->
            <VCol cols="12">
              <AppTextarea
                v-model="form.description"
                label="Descripción"
                placeholder="Detalles de la cita..."
                rows="2"
              />
            </VCol>

            <!-- Contacto y abogado -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppSelect
                v-model="form.contactId"
                label="Cliente / Contacto"
                :items="(contacts as any[]).map((c: any) => ({ title: c.name, value: c._id }))"
                clearable
              />
            </VCol>
            <VCol
              cols="12"
              sm="6"
            >
              <AppSelect
                v-model="form.lawyerId"
                label="Abogado"
                :items="(lawyers as any[]).map((l: any) => ({ title: l.name, value: l._id }))"
                clearable
              />
            </VCol>

            <!-- Ubicación -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.location"
                label="Ubicación"
                placeholder="Oficina, sala, dirección..."
                prepend-inner-icon="tabler-map-pin"
              />
            </VCol>

            <!-- URL reunión -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppTextField
                v-model="form.meetUrl"
                label="Enlace reunión"
                placeholder="https://meet.google.com/..."
                prepend-inner-icon="tabler-video"
              />
            </VCol>

            <!-- Recordatorio y color -->
            <VCol
              cols="12"
              sm="6"
            >
              <AppSelect
                v-model="form.reminderMinutes"
                label="Recordatorio"
                :items="reminderItems"
              />
            </VCol>
            <VCol
              cols="12"
              sm="6"
            >
              <AppSelect
                v-model="form.color"
                label="Color"
                :items="colorItems"
              >
                <template #item="{ item, props }">
                  <VListItem v-bind="props">
                    <template #prepend>
                      <div :style="`background: ${item.raw.value}; width: 14px; height: 14px; border-radius: 50%; margin-right: 8px;`" />
                    </template>
                  </VListItem>
                </template>
              </AppSelect>
            </VCol>

            <!-- Error -->
            <VCol
              v-if="errorMsg"
              cols="12"
            >
              <VAlert
                type="error"
                density="compact"
              >
                {{ errorMsg }}
              </VAlert>
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions class="pa-6 pt-0">
          <VBtn
            v-if="editingId"
            variant="outlined"
            color="error"
            prepend-icon="tabler-ban"
            :loading="loadingAction"
            @click="deleteAppointment"
          >
            Cancelar cita
          </VBtn>
          <VSpacer />
          <VBtn
            variant="outlined"
            color="secondary"
            @click="closeDialog"
          >
            Cerrar
          </VBtn>
          <VBtn
            color="primary"
            :loading="loadingAction"
            @click="save"
          >
            {{ editingId ? 'Actualizar' : 'Crear cita' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
