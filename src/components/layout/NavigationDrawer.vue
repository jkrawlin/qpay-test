<template>
  <div class="navigation-drawer">
    <!-- Company Logo & Info -->
    <div class="company-header">
      <div class="company-logo">
        <Icon icon="material-symbols:business" :width="28" :height="28" color="white" />
      </div>
      <div class="company-info">
        <div class="company-name">Nipon Payroll Pro</div>
        <div class="company-subtitle">Qatar Manpower Solutions</div>
      </div>
    </div>

    <v-divider />

    <!-- Scrollable Navigation Menu -->
    <div class="navigation-content">
      <v-list nav class="scrollable-list" density="compact">
        <!-- Dashboard -->
        <v-list-item
          :to="{ name: 'Dashboard' }"
          title="Dashboard"
          value="dashboard"
          class="nav-item"
        >
          <template #prepend>
            <Icon icon="material-symbols:dashboard" :width="20" :height="20" />
          </template>
        </v-list-item>

        <!-- Employee Management -->
        <v-list-group value="employees" v-if="hasPermission('employees')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Employees"
              class="nav-group"
            >
              <template #prepend>
                <Icon icon="material-symbols:group" :width="20" :height="20" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'NiponEmployees' }"
            title="Nipon Sponsored"
            value="nipon-employees"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:badge" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'TemporaryEmployees' }"
            title="Temporary Employees"
            value="temporary-employees"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:schedule" :width="18" :height="18" />
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Payroll Management -->
        <v-list-group value="payroll" v-if="hasPermission('payroll')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Payroll"
              class="nav-group"
            >
              <template #prepend>
                <Icon icon="material-symbols:payments" :width="20" :height="20" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'PayrollDashboard' }"
            title="Dashboard"
            value="payroll-dashboard"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:analytics" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'SalaryManagement' }"
            title="Salary Management"
            value="salary-management"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:account-balance-wallet" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'AdvanceLoans' }"
            title="Advances"
            value="advance-loans"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:request-quote" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'TransactionHistory' }"
            title="Transactions"
            value="transaction-history"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:history" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'PayslipGeneration' }"
            title="Payslips"
            value="payslip-generation"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:receipt-long" :width="18" :height="18" />
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Compliance Management -->
        <v-list-group value="compliance" v-if="hasPermission('compliance')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Compliance"
              class="nav-group"
            >
              <template #prepend>
                <Icon icon="material-symbols:security" :width="20" :height="20" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'ComplianceDashboard' }"
            title="Dashboard"
            value="compliance-dashboard"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:analytics" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ExpiryAlerts' }"
            title="Expiry Alerts"
            value="expiry-alerts"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:warning" :width="18" :height="18" />
            </template>
            <template #append>
              <v-chip
                v-if="expiryAlertsCount > 0"
                color="error"
                size="x-small"
                :text="expiryAlertsCount.toString()"
              />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'NotificationCenter' }"
            title="Notifications"
            value="notification-center"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:notifications" :width="18" :height="18" />
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Accounts & Finance -->
        <v-list-group value="accounts" v-if="hasPermission('accounts')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Accounts"
              class="nav-group"
            >
              <template #prepend>
                <Icon icon="material-symbols:calculate" :width="20" :height="20" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'AccountsDashboard' }"
            title="Dashboard"
            value="accounts-dashboard"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:analytics" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'CashFlowManagement' }"
            title="Cash Flow"
            value="cash-flow"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:trending-up" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ExpenseTracking' }"
            title="Expenses"
            value="expense-tracking"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:receipt" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'FinancialReports' }"
            title="Reports"
            value="financial-reports"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:assessment" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'BankReconciliation' }"
            title="Bank Reconciliation"
            value="bank-reconciliation"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:account-balance" :width="18" :height="18" />
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Customer Management -->
        <v-list-group value="customers" v-if="hasPermission('customers')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Customers"
              class="nav-group"
            >
              <template #prepend>
                <Icon icon="material-symbols:corporate-fare" :width="20" :height="20" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'CustomerList' }"
            title="All Customers"
            value="customer-list"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:list" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'CustomerCreate' }"
            title="Add Customer"
            value="customer-create"
            v-if="hasPermission('customer-create')"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:person-add" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ContractManagement' }"
            title="Contracts"
            value="contract-management"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:contract" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ClientPortal' }"
            title="Client Portal"
            value="client-portal"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:web" :width="18" :height="18" />
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Receipts & Invoicing -->
        <v-list-group value="receipts" v-if="hasPermission('receipts')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Invoicing"
              class="nav-group"
            >
              <template #prepend>
                <Icon icon="material-symbols:receipt-long" :width="20" :height="20" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'ReceiptDashboard' }"
            title="Dashboard"
            value="receipt-dashboard"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:analytics" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'InvoiceGeneration' }"
            title="Generate Invoices"
            value="invoice-generation"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:invoice" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ReceiptTemplates' }"
            title="Templates"
            value="receipt-templates"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:description" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'PaymentTracking' }"
            title="Payments"
            value="payment-tracking"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:credit-card-check" :width="18" :height="18" />
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Analytics & Reports -->
        <v-list-group value="analytics" v-if="hasPermission('analytics')">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Analytics"
              class="nav-group"
            >
              <template #prepend>
                <Icon icon="material-symbols:analytics" :width="20" :height="20" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'AnalyticsDashboard' }"
            title="Dashboard"
            value="analytics-dashboard"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:monitoring" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'HRAnalytics' }"
            title="HR Analytics"
            value="hr-analytics"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:people-alt" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'FinancialAnalytics' }"
            title="Financial Analytics"
            value="financial-analytics"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:finance" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'ComplianceReports' }"
            title="Compliance Reports"
            value="compliance-reports"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:verified-user" :width="18" :height="18" />
            </template>
          </v-list-item>
        </v-list-group>

        <v-divider class="my-2" />

        <!-- Settings (Admin only) -->
        <v-list-group value="settings" v-if="isAdmin">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              title="Settings"
              class="nav-group"
            >
              <template #prepend>
                <Icon icon="material-symbols:settings" :width="20" :height="20" />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            :to="{ name: 'Settings' }"
            title="General"
            value="general-settings"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:tune" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'UserManagement' }"
            title="Users"
            value="user-management"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:manage-accounts" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'CompanyProfile' }"
            title="Company"
            value="company-profile"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:business" :width="18" :height="18" />
            </template>
          </v-list-item>
          <v-list-item
            :to="{ name: 'BackupRestore' }"
            title="Backup"
            value="backup-restore"
            class="nav-sub-item"
          >
            <template #prepend>
              <Icon icon="material-symbols:backup" :width="18" :height="18" />
            </template>
          </v-list-item>
        </v-list-group>
      </v-list>
    </div>

    <!-- Footer Section -->
    <div class="navigation-footer">
      <!-- Premium Badge -->
      <div class="premium-badge" v-if="hasPremiumAccess">
        <v-chip
          color="gold"
          variant="elevated"
          size="small"
        >
          <template #prepend>
            <Icon icon="material-symbols:workspace-premium" :width="16" :height="16" />
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
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Computed properties
const hasPermission = (permission: string) => authStore.hasPermission(permission)
const isAdmin = computed(() => authStore.isAdmin)
const hasPremiumAccess = computed(() => authStore.hasPremiumAccess)

// Mock data for alerts count - in real app this would come from a store
const expiryAlertsCount = computed(() => 5) // This should be fetched from compliance store
</script>

<style scoped>
.navigation-drawer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.company-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #1565C0 0%, #1976D2 100%);
  color: white;
  border-radius: 0;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.company-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  margin-right: 12px;
}

.company-info {
  flex: 1;
}

.company-name {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.3;
  letter-spacing: 0.5px;
}

.company-subtitle {
  font-size: 11px;
  opacity: 0.85;
  line-height: 1.2;
  font-weight: 400;
}

.navigation-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

/* Webkit scrollbar styling */
.navigation-content::-webkit-scrollbar {
  width: 6px;
}

.navigation-content::-webkit-scrollbar-track {
  background: transparent;
}

.navigation-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.navigation-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.scrollable-list {
  padding: 4px 0;
}

.navigation-footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* Navigation Items */
.nav-item {
  margin: 1px 6px;
  border-radius: 6px;
  min-height: 40px !important;
  font-size: 14px;
}

.nav-group {
  margin: 1px 6px;
  border-radius: 6px;
  min-height: 40px !important;
  font-size: 14px;
  font-weight: 500;
}

.nav-sub-item {
  margin: 1px 6px;
  border-radius: 6px;
  min-height: 36px !important;
  font-size: 13px;
  padding-left: 48px !important;
}

.v-list-item--active {
  background: rgba(25, 118, 210, 0.12) !important;
  color: #1976d2 !important;
}

.v-list-item--active .v-list-item__prepend .v-icon {
  color: #1976d2 !important;
}

.premium-badge {
  padding: 8px 12px;
}

.version-info {
  padding: 6px 12px;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Hover effects */
.v-list-item:hover {
  background: rgba(0, 0, 0, 0.04) !important;
}

.v-list-item--active:hover {
  background: rgba(25, 118, 210, 0.16) !important;
}

/* Icon sizes */
.nav-item .v-list-item__prepend .v-icon,
.nav-group .v-list-item__prepend .v-icon {
  font-size: 20px;
}

.nav-sub-item .v-list-item__prepend .v-icon {
  font-size: 18px;
}

/* Typography improvements */
.v-list-item-title {
  font-weight: 500 !important;
  letter-spacing: 0.25px;
}

.nav-sub-item .v-list-item-title {
  font-weight: 400 !important;
}

/* Chip styling */
.v-chip {
  font-size: 10px !important;
  font-weight: 600 !important;
}

/* Dark theme adjustments */
.v-theme--dark .company-header {
  background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%);
}

.v-theme--dark .v-list-item--active {
  background: rgba(33, 150, 243, 0.16) !important;
  color: #2196f3 !important;
}

.v-theme--dark .v-list-item--active .v-list-item__prepend .v-icon {
  color: #2196f3 !important;
}

.v-theme--dark .v-list-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}

.v-theme--dark .v-list-item--active:hover {
  background: rgba(33, 150, 243, 0.2) !important;
}
</style>