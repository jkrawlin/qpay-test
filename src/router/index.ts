import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteRecordRaw } from 'vue-router'

// Lazy-loaded components for better performance
const Dashboard = () => import('@/views/Dashboard.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const ForgotPassword = () => import('@/views/auth/ForgotPassword.vue')

// Employee Management
const NiponEmployees = () => import('@/views/employees/NiponEmployees.vue')
const TemporaryEmployees = () => import('@/views/employees/TemporaryEmployees.vue')
const EmployeeDetail = () => import('@/views/employees/EmployeeDetail.vue')
const EmployeeCreate = () => import('@/views/employees/EmployeeCreate.vue')
const EmployeeEdit = () => import('@/views/employees/EmployeeEdit.vue')
const DocumentManagement = () => import('@/views/employees/DocumentManagement.vue')

// Payroll & Transactions
const PayrollDashboard = () => import('@/views/payroll/PayrollDashboard.vue')
const SalaryManagement = () => import('@/views/payroll/SalaryManagement.vue')
const AdvanceLoans = () => import('@/views/payroll/AdvanceLoans.vue')
const TransactionHistory = () => import('@/views/payroll/TransactionHistory.vue')
const PayslipGeneration = () => import('@/views/payroll/PayslipGeneration.vue')

// Compliance & Notifications
const ComplianceDashboard = () => import('@/views/compliance/ComplianceDashboard.vue')
const ExpiryAlerts = () => import('@/views/compliance/ExpiryAlerts.vue')
const NotificationCenter = () => import('@/views/compliance/NotificationCenter.vue')

// Accounts & Finance
const AccountsDashboard = () => import('@/views/accounts/AccountsDashboard.vue')
const CashFlowManagement = () => import('@/views/accounts/CashFlowManagement.vue')
const ExpenseTracking = () => import('@/views/accounts/ExpenseTracking.vue')
const FinancialReports = () => import('@/views/accounts/FinancialReports.vue')
const BankReconciliation = () => import('@/views/accounts/BankReconciliation.vue')

// Customer Management
const CustomerList = () => import('@/views/customers/CustomerList.vue')
const CustomerDetail = () => import('@/views/customers/CustomerDetail.vue')
const CustomerCreate = () => import('@/views/customers/CustomerCreate.vue')
const ContractManagement = () => import('@/views/customers/ContractManagement.vue')
const ClientPortal = () => import('@/views/customers/ClientPortal.vue')

// Receipts & Invoicing
const ReceiptDashboard = () => import('@/views/receipts/ReceiptDashboard.vue')
const InvoiceGeneration = () => import('@/views/receipts/InvoiceGeneration.vue')
const ReceiptTemplates = () => import('@/views/receipts/ReceiptTemplates.vue')
const PaymentTracking = () => import('@/views/receipts/PaymentTracking.vue')

// Analytics & Reports
const AnalyticsDashboard = () => import('@/views/analytics/AnalyticsDashboard.vue')
const HRAnalytics = () => import('@/views/analytics/HRAnalytics.vue')
const FinancialAnalytics = () => import('@/views/analytics/FinancialAnalytics.vue')
const ComplianceReports = () => import('@/views/analytics/ComplianceReports.vue')

// Settings & Administration
const Settings = () => import('@/views/settings/Settings.vue')
const UserManagement = () => import('@/views/settings/UserManagement.vue')
const CompanyProfile = () => import('@/views/settings/CompanyProfile.vue')
const SubscriptionManagement = () => import('@/views/settings/SubscriptionManagement.vue')
const BackupRestore = () => import('@/views/settings/BackupRestore.vue')
const SystemLogs = () => import('@/views/settings/SystemLogs.vue')

// Employee Self-Service Portal
const EmployeePortal = () => import('@/views/employee-portal/EmployeePortal.vue')
const EmployeeProfile = () => import('@/views/employee-portal/EmployeeProfile.vue')
const EmployeePayslips = () => import('@/views/employee-portal/EmployeePayslips.vue')
const EmployeeDocuments = () => import('@/views/employee-portal/EmployeeDocuments.vue')

// Error and Utility Pages
const NotFound = () => import('@/views/error/NotFound.vue')
const Unauthorized = () => import('@/views/error/Unauthorized.vue')
const ServerError = () => import('@/views/error/ServerError.vue')

const routes: RouteRecordRaw[] = [
  // Authentication Routes
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true, title: 'Login - Nipon Payroll Pro' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true, title: 'Register - Nipon Payroll Pro' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresGuest: true, title: 'Forgot Password - Nipon Payroll Pro' }
  },

  // Main Application Routes
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, title: 'Dashboard - Nipon Payroll Pro' }
  },

  // Employee Management
  {
    path: '/employees',
    name: 'EmployeeManagement',
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
    children: [
      {
        path: '',
        redirect: '/employees/nipon'
      },
      {
        path: 'nipon',
        name: 'NiponEmployees',
        component: NiponEmployees,
        meta: { title: 'Nipon Sponsored Employees - Nipon Payroll Pro' }
      },
      {
        path: 'temporary',
        name: 'TemporaryEmployees',
        component: TemporaryEmployees,
        meta: { title: 'Temporary Employees - Nipon Payroll Pro' }
      },
      {
        path: 'create',
        name: 'EmployeeCreate',
        component: EmployeeCreate,
        meta: { title: 'Add Employee - Nipon Payroll Pro' }
      },
      {
        path: ':id',
        name: 'EmployeeDetail',
        component: EmployeeDetail,
        meta: { title: 'Employee Details - Nipon Payroll Pro' }
      },
      {
        path: ':id/edit',
        name: 'EmployeeEdit',
        component: EmployeeEdit,
        meta: { title: 'Edit Employee - Nipon Payroll Pro' }
      },
      {
        path: ':id/documents',
        name: 'EmployeeDocuments',
        component: DocumentManagement,
        meta: { title: 'Employee Documents - Nipon Payroll Pro' }
      }
    ]
  },

  // Payroll Management
  {
    path: '/payroll',
    name: 'PayrollManagement',
    meta: { requiresAuth: true, roles: ['admin', 'hr', 'finance'] },
    children: [
      {
        path: '',
        name: 'PayrollDashboard',
        component: PayrollDashboard,
        meta: { title: 'Payroll Dashboard - Nipon Payroll Pro' }
      },
      {
        path: 'salaries',
        name: 'SalaryManagement',
        component: SalaryManagement,
        meta: { title: 'Salary Management - Nipon Payroll Pro' }
      },
      {
        path: 'advances',
        name: 'AdvanceLoans',
        component: AdvanceLoans,
        meta: { title: 'Advances - Nipon Payroll Pro' }
      },
      {
        path: 'transactions',
        name: 'TransactionHistory',
        component: TransactionHistory,
        meta: { title: 'Transaction History - Nipon Payroll Pro' }
      },
      {
        path: 'payslips',
        name: 'PayslipGeneration',
        component: PayslipGeneration,
        meta: { title: 'Payslip Generation - Nipon Payroll Pro' }
      }
    ]
  },

  // Compliance Management
  {
    path: '/compliance',
    name: 'ComplianceManagement',
    meta: { requiresAuth: true, roles: ['admin', 'hr'] },
    children: [
      {
        path: '',
        name: 'ComplianceDashboard',
        component: ComplianceDashboard,
        meta: { title: 'Compliance Dashboard - Nipon Payroll Pro' }
      },
      {
        path: 'expiry-alerts',
        name: 'ExpiryAlerts',
        component: ExpiryAlerts,
        meta: { title: 'Expiry Alerts - Nipon Payroll Pro' }
      },
      {
        path: 'notifications',
        name: 'NotificationCenter',
        component: NotificationCenter,
        meta: { title: 'Notification Center - Nipon Payroll Pro' }
      }
    ]
  },

  // Accounts & Finance
  {
    path: '/accounts',
    name: 'AccountsManagement',
    meta: { requiresAuth: true, roles: ['admin', 'finance'] },
    children: [
      {
        path: '',
        name: 'AccountsDashboard',
        component: AccountsDashboard,
        meta: { title: 'Accounts Dashboard - Nipon Payroll Pro' }
      },
      {
        path: 'cash-flow',
        name: 'CashFlowManagement',
        component: CashFlowManagement,
        meta: { title: 'Cash Flow Management - Nipon Payroll Pro' }
      },
      {
        path: 'expenses',
        name: 'ExpenseTracking',
        component: ExpenseTracking,
        meta: { title: 'Expense Tracking - Nipon Payroll Pro' }
      },
      {
        path: 'reports',
        name: 'FinancialReports',
        component: FinancialReports,
        meta: { title: 'Financial Reports - Nipon Payroll Pro' }
      },
      {
        path: 'bank-reconciliation',
        name: 'BankReconciliation',
        component: BankReconciliation,
        meta: { title: 'Bank Reconciliation - Nipon Payroll Pro' }
      }
    ]
  },

  // Customer Management
  {
    path: '/customers',
    name: 'CustomerManagement',
    meta: { requiresAuth: true, roles: ['admin', 'sales'] },
    children: [
      {
        path: '',
        name: 'CustomerList',
        component: CustomerList,
        meta: { title: 'Customers - Nipon Payroll Pro' }
      },
      {
        path: 'create',
        name: 'CustomerCreate',
        component: CustomerCreate,
        meta: { title: 'Add Customer - Nipon Payroll Pro' }
      },
      {
        path: ':id',
        name: 'CustomerDetail',
        component: CustomerDetail,
        meta: { title: 'Customer Details - Nipon Payroll Pro' }
      },
      {
        path: 'contracts',
        name: 'ContractManagement',
        component: ContractManagement,
        meta: { title: 'Contract Management - Nipon Payroll Pro' }
      },
      {
        path: 'portal',
        name: 'ClientPortal',
        component: ClientPortal,
        meta: { title: 'Client Portal - Nipon Payroll Pro' }
      }
    ]
  },

  // Receipts & Invoicing
  {
    path: '/receipts',
    name: 'ReceiptManagement',
    meta: { requiresAuth: true, roles: ['admin', 'finance'] },
    children: [
      {
        path: '',
        name: 'ReceiptDashboard',
        component: ReceiptDashboard,
        meta: { title: 'Receipt Dashboard - Nipon Payroll Pro' }
      },
      {
        path: 'invoices',
        name: 'InvoiceGeneration',
        component: InvoiceGeneration,
        meta: { title: 'Invoice Generation - Nipon Payroll Pro' }
      },
      {
        path: 'templates',
        name: 'ReceiptTemplates',
        component: ReceiptTemplates,
        meta: { title: 'Receipt Templates - Nipon Payroll Pro' }
      },
      {
        path: 'payments',
        name: 'PaymentTracking',
        component: PaymentTracking,
        meta: { title: 'Payment Tracking - Nipon Payroll Pro' }
      }
    ]
  },

  // Analytics & Reports
  {
    path: '/analytics',
    name: 'Analytics',
    meta: { requiresAuth: true, roles: ['admin', 'manager'] },
    children: [
      {
        path: '',
        name: 'AnalyticsDashboard',
        component: AnalyticsDashboard,
        meta: { title: 'Analytics Dashboard - Nipon Payroll Pro' }
      },
      {
        path: 'hr',
        name: 'HRAnalytics',
        component: HRAnalytics,
        meta: { title: 'HR Analytics - Nipon Payroll Pro' }
      },
      {
        path: 'financial',
        name: 'FinancialAnalytics',
        component: FinancialAnalytics,
        meta: { title: 'Financial Analytics - Nipon Payroll Pro' }
      },
      {
        path: 'compliance',
        name: 'ComplianceReports',
        component: ComplianceReports,
        meta: { title: 'Compliance Reports - Nipon Payroll Pro' }
      }
    ]
  },

  // Employee Self-Service Portal
  {
    path: '/employee-portal',
    name: 'EmployeePortalManagement',
    meta: { requiresAuth: true, roles: ['employee'] },
    children: [
      {
        path: '',
        name: 'EmployeePortal',
        component: EmployeePortal,
        meta: { title: 'Employee Portal - Nipon Payroll Pro' }
      },
      {
        path: 'profile',
        name: 'EmployeeProfile',
        component: EmployeeProfile,
        meta: { title: 'My Profile - Nipon Payroll Pro' }
      },
      {
        path: 'payslips',
        name: 'EmployeePayslips',
        component: EmployeePayslips,
        meta: { title: 'My Payslips - Nipon Payroll Pro' }
      },
      {
        path: 'documents',
        name: 'EmployeePortalDocuments',
        component: EmployeeDocuments,
        meta: { title: 'My Documents - Nipon Payroll Pro' }
      }
    ]
  },

  // Settings & Administration
  {
    path: '/settings',
    name: 'SettingsManagement',
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'Settings',
        component: Settings,
        meta: { title: 'Settings - Nipon Payroll Pro' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: UserManagement,
        meta: { title: 'User Management - Nipon Payroll Pro' }
      },
      {
        path: 'company',
        name: 'CompanyProfile',
        component: CompanyProfile,
        meta: { title: 'Company Profile - Nipon Payroll Pro' }
      },
      {
        path: 'subscription',
        name: 'SubscriptionManagement',
        component: SubscriptionManagement,
        meta: { title: 'Subscription - Nipon Payroll Pro' }
      },
      {
        path: 'backup',
        name: 'BackupRestore',
        component: BackupRestore,
        meta: { title: 'Backup & Restore - Nipon Payroll Pro' }
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: SystemLogs,
        meta: { title: 'System Logs - Nipon Payroll Pro' }
      }
    ]
  },

  // Error Pages
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: Unauthorized,
    meta: { title: 'Unauthorized - Nipon Payroll Pro' }
  },
  {
    path: '/server-error',
    name: 'ServerError',
    component: ServerError,
    meta: { title: 'Server Error - Nipon Payroll Pro' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Page Not Found - Nipon Payroll Pro' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore()
    
    // Wait for auth initialization
    if (!authStore.initialized) {
      await authStore.initializeAuth()
    }
    
    // Set page title
    if (to.meta.title) {
      document.title = to.meta.title as string
    }

    // Check authentication requirements
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    // Check guest-only routes (login, register)
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      next({ name: 'Dashboard' })
      return
    }

    // Check role-based access
    if (to.meta.roles && authStore.user) {
      const userRoles = authStore.user.roles || []
      const requiredRoles = to.meta.roles as string[]
      
      if (!requiredRoles.some(role => userRoles.includes(role))) {
        next({ name: 'Unauthorized' })
        return
      }
    }

    // Check subscription status for premium features
    if (to.meta.requiresPremium && !authStore.hasPremiumAccess) {
      next({ name: 'SubscriptionManagement' })
      return
    }

    next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    // Allow navigation to proceed even if there's an error
    next()
  }
})

// Handle navigation errors
router.onError((error) => {
  console.error('Router error:', error)
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  })
  
  // Only redirect to server error for actual server errors, not navigation issues
  if (error.message?.includes('Loading chunk') || error.message?.includes('Failed to fetch')) {
    // This is likely a chunk loading error, retry the navigation
    console.log('Chunk loading error detected, attempting to reload...')
    window.location.reload()
  } else {
    // For other errors, just log them but don't redirect automatically
    console.warn('Navigation error handled, but not redirecting to server error page')
  }
})

export default router