<template>
  <v-menu offset-y>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        size="large"
        color="white"
      >
        <v-badge
          :content="unreadCount"
          :model-value="hasUnreadNotifications"
          color="error"
          overlap
        >
          <v-icon>
            {{ hasUnreadNotifications ? 'mdi-bell-ring' : 'mdi-bell' }}
          </v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card min-width="350" max-width="400">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Notifications</span>
        <v-btn
          v-if="hasUnreadNotifications"
          size="small"
          variant="text"
          @click="markAllAsRead"
        >
          Mark all read
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <div v-if="notifications.length === 0" class="text-center pa-4">
          <v-icon size="48" color="grey-lighten-1" class="mb-2">
            mdi-bell-off-outline
          </v-icon>
          <div class="text-grey-darken-1">No notifications</div>
        </div>

        <v-list v-else max-height="400" class="overflow-y-auto">
          <template v-for="(notification, index) in displayNotifications" :key="notification.id">
            <v-list-item
              :class="{ 'notification-unread': !notification.read }"
              @click="handleNotificationClick(notification)"
            >
              <template #prepend>
                <v-avatar :color="getNotificationColor(notification.type)" size="small">
                  <v-icon :icon="getNotificationIcon(notification.type)" />
                </v-avatar>
              </template>

              <v-list-item-title class="text-wrap">
                {{ notification.title }}
              </v-list-item-title>

              <v-list-item-subtitle class="text-wrap">
                {{ notification.message }}
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex flex-column align-end">
                  <div class="text-caption text-grey-darken-1">
                    {{ formatTime(notification.timestamp) }}
                  </div>
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    @click.stop="removeNotification(notification.id)"
                  />
                </div>
              </template>
            </v-list-item>

            <v-divider v-if="index < displayNotifications.length - 1" />
          </template>
        </v-list>
      </v-card-text>

      <v-divider v-if="notifications.length > 0" />

      <v-card-actions v-if="notifications.length > 0">
        <v-spacer />
        <v-btn
          variant="text"
          size="small"
          @click="clearAllNotifications"
        >
          Clear All
        </v-btn>
        <v-btn
          variant="text"
          size="small"
          :to="{ name: 'NotificationCenter' }"
        >
          View All
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { format, isToday, isYesterday, differenceInDays } from 'date-fns'

const router = useRouter()
const appStore = useAppStore()

// Computed properties
const notifications = computed(() => appStore.notifications)
const unreadCount = computed(() => appStore.unreadNotifications)
const hasUnreadNotifications = computed(() => unreadCount.value > 0)

// Show only recent notifications in the dropdown (last 10)
const displayNotifications = computed(() => 
  notifications.value.slice(0, 10)
)

// Methods
const markAllAsRead = () => {
  appStore.markAllNotificationsAsRead()
}

const removeNotification = (id: number) => {
  appStore.removeNotification(id)
}

const clearAllNotifications = () => {
  appStore.clearAllNotifications()
}

const handleNotificationClick = (notification: any) => {
  // Mark as read
  if (!notification.read) {
    appStore.markNotificationAsRead(notification.id)
  }

  // Navigate to related page if specified
  if (notification.route) {
    router.push(notification.route)
  } else if (notification.action) {
    // Handle specific actions
    handleNotificationAction(notification.action, notification.data)
  }
}

const handleNotificationAction = (action: string, data: any) => {
  switch (action) {
    case 'view_employee':
      router.push({ name: 'EmployeeDetail', params: { id: data.employeeId } })
      break
    case 'view_expiry':
      router.push({ name: 'ExpiryAlerts' })
      break
    case 'view_payroll':
      router.push({ name: 'PayrollDashboard' })
      break
    case 'view_compliance':
      router.push({ name: 'ComplianceDashboard' })
      break
    default:
      console.log('Unknown notification action:', action)
  }
}

const getNotificationColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    expiry: 'warning',
    payroll: 'primary',
    compliance: 'orange',
    system: 'grey'
  }
  return colorMap[type] || 'grey'
}

const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    info: 'mdi-information',
    success: 'mdi-check-circle',
    warning: 'mdi-alert',
    error: 'mdi-alert-circle',
    expiry: 'mdi-calendar-alert',
    payroll: 'mdi-cash',
    compliance: 'mdi-shield-alert',
    system: 'mdi-cog'
  }
  return iconMap[type] || 'mdi-bell'
}

const formatTime = (timestamp: Date): string => {
  const date = new Date(timestamp)
  
  if (isToday(date)) {
    return format(date, 'HH:mm')
  } else if (isYesterday(date)) {
    return 'Yesterday'
  } else if (differenceInDays(new Date(), date) <= 7) {
    return format(date, 'EEE')
  } else {
    return format(date, 'MMM dd')
  }
}
</script>

<style scoped>
.notification-unread {
  background-color: rgba(25, 118, 210, 0.05);
  border-left: 3px solid #1976d2;
}

.v-list-item {
  padding: 12px 16px;
}

.v-list-item-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.v-list-item-subtitle {
  font-size: 13px;
  line-height: 1.3;
  opacity: 0.8;
}

.text-wrap {
  white-space: normal;
  word-break: break-word;
}

/* Hover effects */
.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.v-theme--dark .v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.v-theme--dark .notification-unread {
  background-color: rgba(33, 150, 243, 0.1);
  border-left-color: #2196f3;
}

/* Scrollbar styling for notification list */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}
</style>