// In-memory stub for notifications replacing Firebase Messaging & Firestore.
// Provides basic local alert generation only; all network operations are no-ops.
// generateId not required in stub


interface ComplianceAlert {
  id?: string
  type: 'document_expiry' | 'compliance_violation' | 'system_alert'
  priority: 'low' | 'medium' | 'high' | 'critical'
  employeeId: string
  employeeName: string
  documentType: string
  documentNumber?: string
  expiryDate: Date
  daysUntilExpiry: number
  message: string
  actionRequired: string
  isRead: boolean
  isSent: boolean
  createdAt: Date
  sentAt?: Date
  readAt?: Date
}

interface NotificationSubscription {
  userId: string
  fcmToken: string
  deviceType: 'web' | 'android' | 'ios'
  preferences: {
    documentExpiry: boolean
    payrollAlerts: boolean
    systemUpdates: boolean
    complianceAlerts: boolean
  }
  createdAt: Date
  lastActive: Date
}

export class ComplianceNotificationService {
  // In-memory store of alerts only (subscriptions omitted in stub)
  private alerts: ComplianceAlert[] = []

  constructor() {}

  // Initialize FCM and request permission
  async initializeNotifications(): Promise<string | null> { return null }

  // Setup message listener for foreground messages
  // Removed messaging listener in stub

  // Save FCM token and user preferences
  async saveNotificationSubscription(_fcmToken: string): Promise<void> { /* no-op */ }

  // Main function to check and create expiring document alerts
  async checkExpiringDocuments(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = []
    
    // No employee dataset available in stub; return existing alerts.
    return alerts
  }

  // Check individual document expiry against thresholds
  // Removed detailed document expiry logic in stub

  // Check if alert already exists
  // Removed existing alert check logic in stub

  // Save compliance alert to database
  // Removed persistence helper in stub

  // Send notifications for new alerts
  // Removed send notifications logic

  // Send FCM notification
  // Removed FCM notification logic

  // Get all alerts
  async getComplianceAlerts(limit?: number, unreadOnly = false): Promise<ComplianceAlert[]> {
    let result = [...this.alerts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    if (unreadOnly) result = result.filter(a => !a.isRead)
    if (limit) result = result.slice(0, limit)
    return result
  }

  // Mark alert as read
  async markAlertAsRead(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.isRead = true
      alert.readAt = new Date()
    }
  }

  // Schedule daily compliance check
  async scheduleDailyComplianceCheck(): Promise<void> {
    // This would typically be set up as a scheduled cloud function
    // For demo purposes, we'll set up a simple interval
    // no-op in stub
  }

  // Generate compliance dashboard data
  async getComplianceDashboardData(): Promise<any> {
    const alerts = await this.getComplianceAlerts()
    
    const dashboard = {
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.priority === 'critical').length,
      highAlerts: alerts.filter(a => a.priority === 'high').length,
      mediumAlerts: alerts.filter(a => a.priority === 'medium').length,
      lowAlerts: alerts.filter(a => a.priority === 'low').length,
      unreadAlerts: alerts.filter(a => !a.isRead).length,
      recentAlerts: alerts.slice(0, 10),
      alertsByDocumentType: this.groupAlertsByDocumentType(alerts),
      alertsByEmployee: this.groupAlertsByEmployee(alerts)
    }
    
    return dashboard
  }

  // Utility methods
  // Removed formatting & priority helpers in stub

  private groupAlertsByDocumentType(alerts: ComplianceAlert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.documentType] = (acc[alert.documentType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private groupAlertsByEmployee(alerts: ComplianceAlert[]): Record<string, number> {
    return alerts.reduce((acc, alert) => {
      acc[alert.employeeName] = (acc[alert.employeeName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  // handleNotificationData removed in stub

  // Update notification preferences
  async updateNotificationPreferences(_userId: string, _preferences: Partial<NotificationSubscription['preferences']>): Promise<void> { /* no-op */ }
}

export const complianceNotificationService = new ComplianceNotificationService()