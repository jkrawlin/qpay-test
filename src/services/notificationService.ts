import { 
  getMessaging, 
  getToken, 
  onMessage,
  MessagePayload 
} from 'firebase/messaging'
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit as firestoreLimit,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/firebase/config'

interface NotificationConfig {
  qatarId: number[]  // Alert thresholds in days
  passport: number[]
  visa: number[]
  workPermit: number[]
}

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
  private messaging: any
  private readonly alertThresholds: NotificationConfig = {
    qatarId: [90, 60, 30, 7],      // 3 months, 2 months, 1 month, 1 week
    passport: [180, 90, 30],        // 6 months, 3 months, 1 month
    visa: [60, 30, 7],              // 2 months, 1 month, 1 week
    workPermit: [90, 60, 30]        // 3 months, 2 months, 1 month
  }

  constructor() {
    this.messaging = getMessaging()
    this.setupMessageListener()
  }

  // Initialize FCM and request permission
  async initializeNotifications(): Promise<string | null> {
    try {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        })
        
        if (token) {
          await this.saveNotificationSubscription(token)
          return token
        }
      }
      
      return null
    } catch (error) {
      console.error('Error initializing notifications:', error)
      return null
    }
  }

  // Setup message listener for foreground messages
  private setupMessageListener(): void {
    onMessage(this.messaging, (payload: MessagePayload) => {
      console.log('Message received in foreground:', payload)
      
      // Show browser notification
      if (payload.notification) {
        new Notification(payload.notification.title || 'QPay Notification', {
          body: payload.notification.body,
          icon: payload.notification.icon || '/favicon.ico',
          badge: '/favicon.ico'
        })
      }
      
      // Handle data payload
      if (payload.data) {
        this.handleNotificationData(payload.data)
      }
    })
  }

  // Save FCM token and user preferences
  async saveNotificationSubscription(fcmToken: string): Promise<void> {
    const userId = 'current-user-id' // Get from auth context
    
    const subscription: NotificationSubscription = {
      userId,
      fcmToken,
      deviceType: 'web',
      preferences: {
        documentExpiry: true,
        payrollAlerts: true,
        systemUpdates: true,
        complianceAlerts: true
      },
      createdAt: new Date(),
      lastActive: new Date()
    }
    
    const docRef = doc(db, 'notification-subscriptions', userId)
    await setDoc(docRef, subscription, { merge: true })
  }

  // Main function to check and create expiring document alerts
  async checkExpiringDocuments(): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = []
    
    try {
      // Get all employees with documents
      const employeesSnapshot = await getDocs(collection(db, 'employees'))
      
      for (const employeeDoc of employeesSnapshot.docs) {
        const employee = { id: employeeDoc.id, ...employeeDoc.data() } as any
        
        // Check Qatar ID
        if (employee.documents?.qatarId?.expiryDate) {
          const qatarIdAlerts = await this.checkDocumentExpiry(
            employee,
            'qatarId',
            employee.documents.qatarId.expiryDate,
            employee.documents.qatarId.number,
            this.alertThresholds.qatarId
          )
          alerts.push(...qatarIdAlerts)
        }
        
        // Check Passport
        if (employee.documents?.passport?.expiryDate) {
          const passportAlerts = await this.checkDocumentExpiry(
            employee,
            'passport',
            employee.documents.passport.expiryDate,
            employee.documents.passport.number,
            this.alertThresholds.passport
          )
          alerts.push(...passportAlerts)
        }
        
        // Check Visa
        if (employee.documents?.visa?.expiryDate) {
          const visaAlerts = await this.checkDocumentExpiry(
            employee,
            'visa',
            employee.documents.visa.expiryDate,
            employee.documents.visa.number,
            this.alertThresholds.visa
          )
          alerts.push(...visaAlerts)
        }
      }
      
      // Save alerts to database
      for (const alert of alerts) {
        await this.saveComplianceAlert(alert)
      }
      
      // Send notifications for new alerts
      await this.sendNotificationsForAlerts(alerts)
      
      return alerts
    } catch (error) {
      console.error('Error checking expiring documents:', error)
      return []
    }
  }

  // Check individual document expiry against thresholds
  private async checkDocumentExpiry(
    employee: any,
    documentType: string,
    expiryDate: any,
    documentNumber: string,
    thresholds: number[]
  ): Promise<ComplianceAlert[]> {
    const alerts: ComplianceAlert[] = []
    const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    // Check if document is already expired
    if (daysUntilExpiry < 0) {
      alerts.push({
        type: 'document_expiry',
        priority: 'critical',
        employeeId: employee.id,
        employeeName: employee.name,
        documentType: this.formatDocumentType(documentType),
        documentNumber,
        expiryDate: expiry,
        daysUntilExpiry,
        message: `${this.formatDocumentType(documentType)} has expired ${Math.abs(daysUntilExpiry)} days ago`,
        actionRequired: `Immediate renewal required for ${employee.name}'s ${this.formatDocumentType(documentType)}`,
        isRead: false,
        isSent: false,
        createdAt: new Date()
      })
    } else {
      // Check against all thresholds
      for (const threshold of thresholds) {
        if (daysUntilExpiry <= threshold) {
          // Check if alert already exists for this threshold
          const existingAlert = await this.checkExistingAlert(
            employee.id,
            documentType,
            threshold
          )
          
          if (!existingAlert) {
            alerts.push({
              type: 'document_expiry',
              priority: this.getPriorityByDays(daysUntilExpiry),
              employeeId: employee.id,
              employeeName: employee.name,
              documentType: this.formatDocumentType(documentType),
              documentNumber,
              expiryDate: expiry,
              daysUntilExpiry,
              message: `${this.formatDocumentType(documentType)} expires in ${daysUntilExpiry} days`,
              actionRequired: `Schedule renewal for ${employee.name}'s ${this.formatDocumentType(documentType)}`,
              isRead: false,
              isSent: false,
              createdAt: new Date()
            })
          }
          break // Only create one alert per document check
        }
      }
    }
    
    return alerts
  }

  // Check if alert already exists
  private async checkExistingAlert(
    employeeId: string,
    documentType: string,
    _threshold: number
  ): Promise<boolean> {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const q = query(
      collection(db, 'compliance-alerts'),
      where('employeeId', '==', employeeId),
      where('documentType', '==', this.formatDocumentType(documentType)),
      where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo))
    )
    
    const snapshot = await getDocs(q)
    return !snapshot.empty
  }

  // Save compliance alert to database
  private async saveComplianceAlert(alert: ComplianceAlert): Promise<string> {
    const docRef = doc(collection(db, 'compliance-alerts'))
    const alertData = {
      ...alert,
      id: docRef.id
    }
    
    await setDoc(docRef, alertData)
    return docRef.id
  }

  // Send notifications for new alerts
  private async sendNotificationsForAlerts(alerts: ComplianceAlert[]): Promise<void> {
    // Get all notification subscriptions
    const subscriptionsSnapshot = await getDocs(collection(db, 'notification-subscriptions'))
    const subscriptions = subscriptionsSnapshot.docs.map(doc => doc.data() as NotificationSubscription)
    
    for (const alert of alerts) {
      for (const subscription of subscriptions) {
        if (subscription.preferences.documentExpiry) {
          await this.sendFCMNotification(subscription.fcmToken, {
            title: `Document Expiry Alert - ${alert.priority.toUpperCase()}`,
            body: alert.message,
            data: {
              type: alert.type,
              employeeId: alert.employeeId,
              documentType: alert.documentType,
              priority: alert.priority,
              alertId: alert.id || '',
              actionUrl: `/employees/documents?employee=${alert.employeeId}`
            }
          })
        }
      }
      
      // Mark alert as sent
      if (alert.id) {
        await updateDoc(doc(db, 'compliance-alerts', alert.id), {
          isSent: true,
          sentAt: new Date()
        })
      }
    }
  }

  // Send FCM notification
  private async sendFCMNotification(
    fcmToken: string,
    notification: {
      title: string
      body: string
      data?: Record<string, string>
    }
  ): Promise<void> {
    try {
      // This would typically be done server-side
      // For demo purposes, we'll just log the notification
      console.log('Sending FCM notification:', {
        token: fcmToken,
        notification
      })
      
      // In a real implementation, you'd call your backend API
      // which would use the Firebase Admin SDK to send the notification
      /*
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fcmToken,
          notification
        })
      })
      */
    } catch (error) {
      console.error('Error sending FCM notification:', error)
    }
  }

  // Get all alerts
  async getComplianceAlerts(limit?: number, unreadOnly = false): Promise<ComplianceAlert[]> {
    let q = query(
      collection(db, 'compliance-alerts'),
      orderBy('createdAt', 'desc')
    )
    
    if (unreadOnly) {
      q = query(q, where('isRead', '==', false))
    }
    
    if (limit) {
      q = query(q, firestoreLimit(limit))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ComplianceAlert))
  }

  // Mark alert as read
  async markAlertAsRead(alertId: string): Promise<void> {
    const docRef = doc(db, 'compliance-alerts', alertId)
    await updateDoc(docRef, {
      isRead: true,
      readAt: new Date()
    })
  }

  // Schedule daily compliance check
  async scheduleDailyComplianceCheck(): Promise<void> {
    // This would typically be set up as a scheduled cloud function
    // For demo purposes, we'll set up a simple interval
    setInterval(async () => {
      await this.checkExpiringDocuments()
    }, 24 * 60 * 60 * 1000) // Check daily
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
  private formatDocumentType(type: string): string {
    const types: Record<string, string> = {
      qatarId: 'Qatar ID',
      passport: 'Passport',
      visa: 'Visa',
      workPermit: 'Work Permit'
    }
    return types[type] || type
  }

  private getPriorityByDays(days: number): 'low' | 'medium' | 'high' | 'critical' {
    if (days <= 0) return 'critical'
    if (days <= 7) return 'high'
    if (days <= 30) return 'medium'
    return 'low'
  }

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

  private handleNotificationData(data: Record<string, string>): void {
    // Handle different types of notification data
    switch (data.type) {
      case 'document_expiry':
        // Redirect to document management
        if (data.actionUrl) {
          // This would be handled by your router
          console.log('Navigate to:', data.actionUrl)
        }
        break
      case 'compliance_violation':
        // Handle compliance violations
        break
      case 'system_alert':
        // Handle system alerts
        break
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationSubscription['preferences']>
  ): Promise<void> {
    const docRef = doc(db, 'notification-subscriptions', userId)
    await updateDoc(docRef, {
      preferences,
      lastActive: new Date()
    })
  }
}

export const complianceNotificationService = new ComplianceNotificationService()