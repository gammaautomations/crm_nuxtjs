//

<script setup lang="ts">
const notificationStore = useNotificationStore()
const { unreadCount } = storeToRefs(notificationStore)

const typeIcon: Record<string, string> = {
  info: 'tabler-info-circle',
  success: 'tabler-circle-check',
  warning: 'tabler-alert-triangle',
  error: 'tabler-circle-x',
}

const typeColor: Record<string, string> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleNotificationClick = async (notification: any) => {
  if (!notification.read)
    await notificationStore.markAsRead(notification._id)

  if (notification.link)
    navigateTo(notification.link)
}
</script>

<template>
  <VBtn
    icon
    variant="text"
  >
    <div class="position-relative">
      <VIcon icon="tabler-bell" />
      <span
        v-if="unreadCount > 0"
        class="position-absolute bg-error rounded-circle d-flex align-center justify-center text-white"
        style=" block-size: 18px; font-size: 10px; inline-size: 18px;inset-block-start: -4px; inset-inline-end: -4px;"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </div>

    <VMenu
      activator="parent"
      width="380"
      location="bottom end"
      offset="14px"
    >
      <VCard>
        <!-- Header -->
        <VCardText class="d-flex align-center justify-space-between py-3">
          <h6 class="text-h6">
            Notificaciones
            <VChip
              v-if="notificationStore.unreadCount > 0"
              size="x-small"
              color="error"
              class="ms-2"
            >
              {{ notificationStore.unreadCount }}
            </VChip>
          </h6>
          <VBtn
            v-if="notificationStore.unreadCount > 0"
            variant="text"
            size="small"
            @click="notificationStore.markAllAsRead()"
          >
            Marcar todas como leídas
          </VBtn>
        </VCardText>

        <VDivider />

        <!-- Lista -->
        <VList
          lines="two"
          max-height="400"
          style="overflow-y: auto;"
        >
          <template v-if="notificationStore.notifications.length">
            <VListItem
              v-for="notification in notificationStore.notifications"
              :key="notification._id"
              :class="{ 'bg-surface': !notification.read }"
              class="cursor-pointer"
              @click="handleNotificationClick(notification)"
            >
              <template #prepend>
                <VAvatar
                  size="36"
                  :color="typeColor[notification.type]"
                  variant="tonal"
                >
                  <VIcon
                    :icon="typeIcon[notification.type]"
                    size="18"
                  />
                </VAvatar>
              </template>

              <VListItemTitle class="font-weight-medium mb-1">
                {{ notification.title }}
              </VListItemTitle>
              <VListItemSubtitle>{{ notification.message }}</VListItemSubtitle>

              <template #append>
                <div class="d-flex flex-column align-end gap-1">
                  <span class="text-caption text-disabled">
                    {{ formatDate(notification.createdAt) }}
                  </span>
                  <div class="d-flex align-center gap-1">
                    <VIcon
                      v-if="!notification.read"
                      icon="tabler-circle-filled"
                      size="8"
                      color="primary"
                    />
                    <VIcon
                      icon="tabler-x"
                      size="16"
                      class="cursor-pointer text-disabled"
                      @click.stop="notificationStore.deleteNotification(notification._id)"
                    />
                  </div>
                </div>
              </template>
            </VListItem>
          </template>

          <VListItem v-else>
            <VListItemTitle class="text-center text-disabled py-4">
              No hay notificaciones
            </VListItemTitle>
          </VListItem>
        </VList>
      </VCard>
    </VMenu>
  </VBtn>
</template>
