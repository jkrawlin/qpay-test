<template>
  <v-menu offset-y>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        size="large"
        :color="hasUnreadNotifications ? 'warning' : 'default'"
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
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(25, 118, 210, 0.04) 100%);
  border-left: 4px solid #1976d2;
  border-radius: 0 8px 8px 0;
  position: relative;
  overflow: hidden;
}

.notification-unread::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.1), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.v-list-item {
  padding: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  margin: 4px 8px;
  border: 1px solid transparent;
}

.v-list-item-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1f2937;
  line-height: 1.4;
}

.v-list-item-subtitle {
  font-size: 13px;
  line-height: 1.4;
  opacity: 0.8;
  color: #6b7280;
}

.text-wrap {
  white-space: normal;
  word-break: break-word;
}

/* Enhanced hover effects */
.v-list-item:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.06) 0%, rgba(25, 118, 210, 0.02) 100%);
  transform: translateX(4px);
  border-color: rgba(25, 118, 210, 0.2);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.1);
}

.v-theme--dark .v-list-item:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.v-theme--dark .notification-unread {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-left-color: #3b82f6;
}

.v-theme--dark .v-list-item-title {
  color: #f9fafb;
}

.v-theme--dark .v-list-item-subtitle {
  color: #d1d5db;
}

/* Notification menu card styling */
.v-card {
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  overflow: hidden;
}

.v-theme--dark .v-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

/* Card title styling */
.v-card-title {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.025em;
}

.v-theme--dark .v-card-title {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Badge styling */
.v-badge {
  transition: all 0.3s ease;
}

.v-badge:hover {
  transform: scale(1.1);
}

.v-badge .v-badge__badge {
  font-size: 10px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Button enhancements */
.v-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;
  text-transform: none;
  font-weight: 500;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.v-btn.v-btn--variant-text:hover {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
}

/* Icon enhancements */
.v-icon {
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.v-btn:hover .v-icon {
  transform: scale(1.1);
}

/* Time display styling */
.text-caption {
  font-size: 11px;
  font-weight: 500;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Scrollbar styling for notification list */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(25, 118, 210, 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(25, 118, 210, 0.4) 0%, rgba(25, 118, 210, 0.2) 100%);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(25, 118, 210, 0.6) 0%, rgba(25, 118, 210, 0.4) 100%);
}

/* Empty state styling */
.v-list-item[disabled] {
  opacity: 0.6;
  font-style: italic;
  text-align: center;
  background: linear-gradient(135deg, rgba(107, 114, 128, 0.1) 0%, rgba(107, 114, 128, 0.05) 100%);
  border: 1px dashed rgba(107, 114, 128, 0.3);
}

/* Notification type indicators */
.notification-success {
  border-left-color: #10b981;
}

.notification-warning {
  border-left-color: #f59e0b;
}

.notification-error {
  border-left-color: #ef4444;
}

.notification-info {
  border-left-color: #3b82f6;
}

/* Animation for new notifications */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-new {
  animation: slideInRight 0.3s ease-out;
}
</style>