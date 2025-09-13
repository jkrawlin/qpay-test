<template>
  <div class="navigation-drawer enhanced-nav">
    <!-- Company Logo & Info -->
    <div class="company-header bg-gradient-primary">
      <div class="company-logo enhanced-logo">
        <v-icon size="24" color="white">mdi-office-building</v-icon>
      </div>
      <div class="company-info">
        <div class="company-name">Nipon Payroll Pro</div>
        <div class="company-subtitle">Qatar Manpower Solutions</div>
      </div>
    </div>

    <v-divider />

    <!-- Scrollable Navigation Menu -->
    <div class="navigation-content enhanced-scroll">
      <v-list nav class="scrollable-list" density="compact">
        <!-- Dashboard -->
        <v-list-item
          :to="{ name: 'Dashboard' }"
          title="Dashboard"
          value="dashboard"
          class="nav-item enhanced-nav-item"
        >
          <template #prepend>
            <v-icon class="nav-icon">mdi-view-dashboard</v-icon>
          </template>
        </v-list-item>

        <!-- Employee Management -->
        <v-list-group value="employees" v-if="hasPermission('employees')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Employees"
              class="nav-group enhanced-nav-group"
            >
              <template #prepend>
                <v-icon class="nav-icon">mdi-account-group</v-icon>
              </template>
              <template #append>
                <v-badge
                  v-if="employeeCount > 0"
                  :content="employeeCount"
                  color="primary"
                  inline
                  class="enhanced-badge"
                />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'NiponEmployees' }"
            title="Nipon Sponsored"
            value="nipon-employees"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-card-account-details</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'TemporaryEmployees' }"
            title="Temporary Employees"
            value="temporary-employees"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-clock-outline</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Payroll Management -->
        <v-list-group value="payroll" v-if="hasPermission('payroll')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Payroll"
              class="nav-group enhanced-nav-group"
            >
              <template #prepend>
                <v-icon class="nav-icon">mdi-cash-multiple</v-icon>
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'PayrollDashboard' }"
            title="Dashboard"
            value="payroll-dashboard"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-chart-line</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'SalaryManagement' }"
            title="Salary Management"
            value="salary-management"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-wallet</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'AdvanceLoans' }"
            title="Advances"
            value="advance-loans"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-currency-usd</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'TransactionHistory' }"
            title="Transactions"
            value="transaction-history"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-history</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'PayslipGeneration' }"
            title="Payslips"
            value="payslip-generation"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-receipt</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Compliance Management -->
        <v-list-group value="compliance" v-if="hasPermission('compliance')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Compliance"
              class="nav-group enhanced-nav-group"
            >
              <template #prepend>
                <v-icon class="nav-icon">mdi-shield-check</v-icon>
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'ComplianceDashboard' }"
            title="Dashboard"
            value="compliance-dashboard"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-chart-line</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ExpiryAlerts' }"
            title="Expiry Alerts"
            value="expiry-alerts"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-alert</v-icon>
            </template>
            <template #append>
              <v-chip
                v-if="expiryAlertsCount > 0"
                color="error"
                size="x-small"
                variant="flat"
                class="enhanced-chip"
                :text="expiryAlertsCount.toString()"
              />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'NotificationCenter' }"
            title="Notifications"
            value="notification-center"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-bell</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Accounts & Finance -->
        <v-list-group value="accounts" v-if="hasPermission('accounts')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Accounts"
              class="nav-group enhanced-nav-group"
            >
              <template #prepend>
                <v-icon class="nav-icon">mdi-calculator</v-icon>
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'AccountsDashboard' }"
            title="Dashboard"
            value="accounts-dashboard"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-chart-line</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'CashFlowManagement' }"
            title="Cash Flow"
            value="cash-flow"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-trending-up</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ExpenseTracking' }"
            title="Expenses"
            value="expense-tracking"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-receipt</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'FinancialReports' }"
            title="Reports"
            value="financial-reports"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-file-chart</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'BankReconciliation' }"
            title="Bank Reconciliation"
            value="bank-reconciliation"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-bank</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Customer Management -->
        <v-list-group value="customers" v-if="hasPermission('customers')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Customers"
              class="nav-group enhanced-nav-group"
            >
              <template #prepend>
                <v-icon class="nav-icon">mdi-office-building</v-icon>
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'CustomerList' }"
            title="All Customers"
            value="customer-list"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-format-list-bulleted</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'CustomerCreate' }"
            title="Add Customer"
            value="customer-create"
            v-if="hasPermission('customer-create')"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-plus</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ContractManagement' }"
            title="Contracts"
            value="contract-management"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-file-document</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ClientPortal' }"
            title="Client Portal"
            value="client-portal"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-web</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Receipts & Invoicing -->
        <v-list-group value="receipts" v-if="hasPermission('receipts')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Invoicing"
              class="nav-group enhanced-nav-group"
            >
              <template #prepend>
                <v-icon class="nav-icon">mdi-receipt</v-icon>
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'ReceiptDashboard' }"
            title="Dashboard"
            value="receipt-dashboard"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-chart-line</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'InvoiceGeneration' }"
            title="Generate Invoices"
            value="invoice-generation"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-file-document-plus</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ReceiptTemplates' }"
            title="Templates"
            value="receipt-templates"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-file-outline</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'PaymentTracking' }"
            title="Payments"
            value="payment-tracking"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-credit-card-check</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Analytics & Reports -->
        <v-list-group value="analytics" v-if="hasPermission('analytics')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Analytics"
              class="nav-group enhanced-nav-group"
            >
              <template #prepend>
                <v-icon class="nav-icon">mdi-chart-line</v-icon>
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'AnalyticsDashboard' }"
            title="Dashboard"
            value="analytics-dashboard"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-monitor-dashboard</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'HRAnalytics' }"
            title="HR Analytics"
            value="hr-analytics"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-account-multiple</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'FinancialAnalytics' }"
            title="Financial Analytics"
            value="financial-analytics"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-chart-pie</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ComplianceReports' }"
            title="Compliance Reports"
            value="compliance-reports"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-file-check</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <v-divider class="my-4" />

        <!-- Settings (Admin only) -->
        <v-list-group value="settings" v-if="isAdmin">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Settings"
              class="nav-group enhanced-nav-group"
            >
              <template #prepend>
                <v-icon class="nav-icon">mdi-cog</v-icon>
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'Settings' }"
            title="General"
            value="general-settings"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-tune</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'UserManagement' }"
            title="Users"
            value="user-management"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-account-cog</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'CompanyProfile' }"
            title="Company"
            value="company-profile"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-office-building</v-icon>
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'BackupRestore' }"
            title="Backup"
            value="backup-restore"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-backup-restore</v-icon>
            </template>
          </v-list-item>
        </v-list-group>
      </v-list>
    </div>

    <!-- Footer Section -->
    <div class="navigation-footer enhanced-footer">
      <!-- Premium Badge -->
      <div class="premium-badge" v-if="hasPremiumAccess">
        <v-chip
          color="amber"
          variant="elevated"
          size="small"
          class="enhanced-premium-chip"
        >
          <template #prepend>
            <v-icon size="14">mdi-crown</v-icon>
          </template>
          Premium
        </v-chip>
      </div>

      <!-- Version Info -->
      <div class="version-info">
        <div class="text-caption text-grey-darken-1">
          Version 1.0.0
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Simplified without auth - allow access to all features
const hasPermission = (_permission: string) => true
const isAdmin = computed(() => true)
const hasPremiumAccess = computed(() => true)

// Mock data for alerts count - in real app this would come from a store
const expiryAlertsCount = computed(() => 5) // This should be fetched from compliance store
const employeeCount = computed(() => 245) // Mock employee count
</script>

<style scoped>
.navigation-drawer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: var(--shadow-lg);
}

.enhanced-nav {
  border-right: 1px solid var(--color-border);
}

.company-header {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-md);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
  border-radius: 0;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.company-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.enhanced-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  margin-right: var(--spacing-md);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
}

.company-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.company-name {
  font-weight: 700;
  font-size: 15px;
  line-height: 1.3;
  letter-spacing: 0.5px;
}

.company-subtitle {
  font-size: 11px;
  opacity: 0.9;
  line-height: 1.2;
  font-weight: 400;
}

.navigation-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-sm) 0;
}

.enhanced-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

/* Webkit scrollbar styling */
.enhanced-scroll::-webkit-scrollbar {
  width: 6px;
}

.enhanced-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.enhanced-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background-color var(--transition-fast);
}

.enhanced-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.scrollable-list {
  padding: 0;
}

.enhanced-footer {
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

/* Navigation Items */
.enhanced-nav-item {
  margin: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  min-height: 44px !important;
  font-size: 14px;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.enhanced-nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: var(--color-primary);
  transition: width var(--transition-fast);
}

.enhanced-nav-item:hover::before {
  width: 3px;
}

.enhanced-nav-group {
  margin: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  min-height: 44px !important;
  font-size: 14px;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.enhanced-nav-sub {
  margin: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  min-height: 40px !important;
  font-size: 13px;
  padding-left: calc(var(--spacing-xl) + var(--spacing-lg)) !important;
  transition: all var(--transition-fast);
  position: relative;
}

.enhanced-nav-sub::before {
  content: '';
  position: absolute;
  left: var(--spacing-xl);
  top: 50%;
  width: var(--spacing-sm);
  height: 1px;
  background: var(--color-border);
  transform: translateY(-50%);
}

.nav-icon {
  font-size: 20px !important;
  transition: all var(--transition-fast);
}

.nav-sub-icon {
  font-size: 18px !important;
  transition: all var(--transition-fast);
}

.v-list-item--active {
  background: linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.12) 0%, rgba(var(--color-primary-rgb), 0.08) 100%) !important;
  color: var(--color-primary) !important;
}

.v-list-item--active .nav-icon,
.v-list-item--active .nav-sub-icon {
  color: var(--color-primary) !important;
  transform: scale(1.1);
}

.enhanced-badge {
  font-size: 10px !important;
  font-weight: 700 !important;
  min-width: 20px !important;
  height: 20px !important;
}

.enhanced-chip {
  font-size: 10px !important;
  font-weight: 700 !important;
  min-width: 18px !important;
  height: 18px !important;
}

.enhanced-premium-chip {
  background: linear-gradient(45deg, #ffd700 0%, #ffed4a 100%) !important;
  color: #8b5cf6 !important;
  font-weight: 700 !important;
  box-shadow: var(--shadow-md);
}

.premium-badge {
  padding: var(--spacing-md);
}

.version-info {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Hover effects */
.enhanced-nav-item:hover,
.enhanced-nav-group:hover,
.enhanced-nav-sub:hover {
  background: var(--color-surface-hover) !important;
  transform: translateX(2px);
}

.v-list-item--active:hover {
  background: linear-gradient(90deg, rgba(var(--color-primary-rgb), 0.16) 0%, rgba(var(--color-primary-rgb), 0.12) 100%) !important;
}

.enhanced-nav-item:hover .nav-icon,
.enhanced-nav-group:hover .nav-icon,
.enhanced-nav-sub:hover .nav-sub-icon {
  color: var(--color-primary);
  transform: scale(1.05);
}

/* Typography improvements */
.v-list-item-title {
  font-weight: 500 !important;
  letter-spacing: 0.25px;
  line-height: 1.4;
}

.enhanced-nav-sub .v-list-item-title {
  font-weight: 400 !important;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .company-header {
    padding: var(--spacing-md);
  }
  
  .company-name {
    font-size: 14px;
  }
  
  .company-subtitle {
    font-size: 10px;
  }
  
  .enhanced-nav-item,
  .enhanced-nav-group {
    min-height: 40px !important;
    font-size: 13px;
  }
  
  .enhanced-nav-sub {
    min-height: 36px !important;
    font-size: 12px;
  }
}

/* Dark theme adjustments */
.v-theme--dark .navigation-drawer {
  background: linear-gradient(180deg, #1e1e1e 0%, #121212 100%);
}

.v-theme--dark .enhanced-nav {
  border-right-color: #333;
}

.v-theme--dark .company-header {
  background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
}

.v-theme--dark .enhanced-footer {
  background: #1e1e1e;
  border-top-color: #333;
}

.v-theme--dark .v-list-item--active {
  background: linear-gradient(90deg, rgba(33, 150, 243, 0.16) 0%, rgba(33, 150, 243, 0.12) 100%) !important;
  color: #2196f3 !important;
}

.v-theme--dark .v-list-item--active .nav-icon,
.v-theme--dark .v-list-item--active .nav-sub-icon {
  color: #2196f3 !important;
}

.v-theme--dark .enhanced-nav-item:hover,
.v-theme--dark .enhanced-nav-group:hover,
.v-theme--dark .enhanced-nav-sub:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--dark .v-list-item--active:hover {
  background: linear-gradient(90deg, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0.16) 100%) !important;
}

.v-theme--dark .enhanced-nav-item:hover .nav-icon,
.v-theme--dark .enhanced-nav-group:hover .nav-icon,
.v-theme--dark .enhanced-nav-sub:hover .nav-sub-icon {
  color: #2196f3;
}

.v-theme--dark .enhanced-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}

.v-theme--dark .enhanced-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>