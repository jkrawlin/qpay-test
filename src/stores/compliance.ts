import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface ComplianceAlert {
  id: string
  type: 'qatar-id' | 'passport' | 'visa' | 'work-permit' | 'contract'
  employeeId: string
  employeeName: string
  documentNumber: string
  expiryDate: Date
  daysUntilExpiry: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'ignored'
  notificationsSent: number
  lastNotificationDate?: Date
}

export const useComplianceStore = defineStore('compliance', () => {
  const alerts = ref<ComplianceAlert[]>([])
  const loading = ref(false)
  
  const alertThresholds = {
    qatarId: [90, 60, 30, 7],
    passport: [180, 90, 30],
    visa: [60, 30, 7],
    workPermit: [90, 60, 30],
    contract: [90, 60, 30]
  }

  const criticalAlerts = computed(() => {
    return alerts.value.filter(alert => alert.urgency === 'critical')
  })
  
  const activeAlerts = computed(() => {
    return alerts.value.filter(alert => alert.status === 'active')
  })
  
  const alertsByEmployee = computed(() => {
    return (employeeId: string) => {
      return alerts.value.filter(alert => alert.employeeId === employeeId)
    }
  })

  const checkComplianceAlerts = async (): Promise<void> => {
    loading.value = true
    try {
      // Mock compliance checking - replace with actual implementation
      const mockAlerts: ComplianceAlert[] = [
        {
          id: '1',
          type: 'qatar-id',
          employeeId: 'EMP001',
          employeeName: 'Ahmed Hassan Ali',
          documentNumber: '12345678901',
          expiryDate: new Date('2025-01-15'),
          daysUntilExpiry: 32,
          urgency: 'high',
          status: 'active',
          notificationsSent: 1,
          lastNotificationDate: new Date()
        },
        {
          id: '2',
          type: 'passport',
          employeeId: 'EMP002',
          employeeName: 'Sarah Ahmed Mohamed',
          documentNumber: 'P123456789',
          expiryDate: new Date('2024-12-25'),
          daysUntilExpiry: 11,
          urgency: 'critical',
          status: 'active',
          notificationsSent: 2
        }
      ]
      
      alerts.value = mockAlerts
      
      // Send notifications for critical alerts
      await sendNotifications()
    } catch (error) {
      console.error('Failed to check compliance alerts:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const getUrgencyLevel = (daysUntilExpiry: number): ComplianceAlert['urgency'] => {
    if (daysUntilExpiry <= 7) return 'critical'
    if (daysUntilExpiry <= 30) return 'high'
    if (daysUntilExpiry <= 60) return 'medium'
    return 'low'
  }

  const sendNotifications = async (): Promise<void> => {
    const criticalAlertsToNotify = alerts.value.filter(
      alert => alert.urgency === 'critical' && alert.notificationsSent < 3
    )
    
    for (const alert of criticalAlertsToNotify) {
      try {
        // Send email notification
        await sendEmailNotification(alert)
        
        // Send push notification
        await sendPushNotification(alert)
        
        // Update notification count
        alert.notificationsSent++
        alert.lastNotificationDate = new Date()
        
      } catch (error) {
        console.error('Failed to send notification:', error)
      }
    }
  }

  const sendEmailNotification = async (alert: ComplianceAlert): Promise<void> => {
    // Mock email notification
    console.log(`Sending email notification for ${alert.employeeName} - ${alert.type} expiry`)
  }

  const sendPushNotification = async (alert: ComplianceAlert): Promise<void> => {
    // Mock push notification
    console.log(`Sending push notification for ${alert.employeeName} - ${alert.type} expiry`)
  }

  const resolveAlert = async (alertId: string): Promise<void> => {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'resolved'
    }
  }

  const ignoreAlert = async (alertId: string): Promise<void> => {
    const alert = alerts.value.find(a => a.id === alertId)
    if (alert) {
      alert.status = 'ignored'
    }
  }

  return {
    alerts,
    loading,
    alertThresholds,
    criticalAlerts,
    activeAlerts,
    alertsByEmployee,
    checkComplianceAlerts,
    getUrgencyLevel,
    sendNotifications,
    resolveAlert,
    ignoreAlert
  }
})