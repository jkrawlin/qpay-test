<template>
  <div
    class="navigation-drawer enhanced-nav"
    :class="{ collapsed }"
    role="navigation"
    aria-label="Main navigation"
  >
    <!-- Brand / Collapse Header -->
    <div class="nav-header" :class="{ 'is-collapsed': collapsed }">
      <div
        class="brand"
        role="button"
        tabindex="0"
        @click="toggleCollapse"
        @keydown.enter.prevent="toggleCollapse"
        :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'"
      >
        <v-icon class="brand-icon" :size="collapsed ? 28 : 32">mdi-alpha-n-box</v-icon>
        <span class="brand-text" v-if="!collapsed">QPay Portal</span>
      </div>
      <v-btn
        class="collapse-btn"
        icon
        size="small"
        variant="text"
        :aria-label="collapsed ? 'Expand navigation' : 'Collapse navigation'"
        @click="toggleCollapse"
      >
        <v-icon>{{ collapsed ? 'mdi-arrow-expand-right' : 'mdi-arrow-collapse-left' }}</v-icon>
      </v-btn>
    </div>
    <!-- Scrollable Navigation Menu -->
    <div class="navigation-content enhanced-scroll" :class="{ 'is-collapsed': collapsed }">
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
            :to="{ name: 'GeneralLedger' }"
            title="Ledger"
            value="general-ledger"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-table</v-icon>
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
            :to="{ name: 'ContractManagement' }"
            title="Contracts"
            value="contract-management"
            class="nav-sub-item enhanced-nav-sub"
          >
            <template #prepend>
              <v-icon class="nav-sub-icon">mdi-file-document</v-icon>
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
    <div class="navigation-footer enhanced-footer" :class="{ 'is-collapsed': collapsed }">
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
import { computed, ref } from 'vue'

// Simplified without auth - allow access to all features
const hasPermission = (_permission: string) => true
const isAdmin = computed(() => true)
const hasPremiumAccess = computed(() => true)

// Collapsing state
const collapsed = ref(false)
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

// Mock data for alerts count - in real app this would come from a store
const expiryAlertsCount = computed(() => 5) // This should be fetched from compliance store
// Removed employeeCount badge per refinement request
</script>

<style scoped>
/* Ultra compact adjustments (pass 3) */
.navigation-drawer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: var(--shadow-lg);
  width: 248px; /* even narrower */
  transition: width var(--transition-fast), background var(--transition-fast);
}

.navigation-drawer.collapsed {
  width: 66px; /* slimmer */
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-xs) var(--spacing-sm);
  min-height: 56px;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(90deg, #8B1538 0%, #6B0F2A 100%);
  position: relative;
}

.nav-header.is-collapsed {
  justify-content: center;
  padding-right: var(--spacing-sm);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  color: #fff;
  font-weight: 600;
  letter-spacing: .5px;
  user-select: none;
}

.brand:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
  border-radius: 6px;
}

.brand-icon {
  color: #fff !important;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
}

.brand-text {
  font-size: 15px;
  white-space: nowrap;
  color: #fff;
}

.collapse-btn {
  position: absolute;
  top: 6px;
  right: 4px;
  color: #fff !important;
  opacity: .85;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.collapse-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

.enhanced-nav {
  border-right: 1px solid var(--color-border);
}

.navigation-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px 0; /* tighter */
  background: var(--gradient-surface-light);
}

.navigation-drawer.collapsed .navigation-content {
  padding-top: var(--spacing-sm);
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
  margin: 0 3px; /* tighter */
  border-radius: var(--border-radius-md);
  min-height: 38px !important; /* reduced */
  font-size: 13px;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  padding-inline: 7px !important; /* reduced */
  line-height: 1.22; /* denser */
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
  margin: 2px 3px 2px 3px;
  border-radius: var(--border-radius-md);
  min-height: 38px !important;
  font-size: 13px;
  font-weight: 600;
  transition: all var(--transition-fast);
  padding-inline: 5px !important;
  line-height: 1.22;
}

.enhanced-nav-sub {
  margin: 0 3px; /* tighter */
  border-radius: var(--border-radius-md);
  min-height: 34px !important; /* reduced */
  font-size: 12.25px;
  padding-left: 36px !important; /* less indent */
  transition: all var(--transition-fast);
  position: relative;
  padding-right: 5px !important;
  line-height: 1.2;
}

.enhanced-nav-sub::before {
  content: '';
  position: absolute;
  left: 26px; /* align with new indent */
  top: 50%;
  width: 5px; /* smaller connector */
  height: 1px;
  background: var(--color-border);
  transform: translateY(-50%);
}

.nav-icon {
  font-size: 18px !important; /* slightly smaller */
  transition: all var(--transition-fast);
}

.nav-sub-icon {
  font-size: 16px !important; /* slightly smaller */
  transition: all var(--transition-fast);
}

.v-list-item--active {
  font-weight: 500 !important;
  letter-spacing: 0.2px;
  line-height: 1.3;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}

.v-list-item--active .nav-icon,
.v-list-item--active .nav-sub-icon {
  color: #8B1538 !important;
  padding-left: 2px !important;
  padding-right: 2px !important;
  justify-content: center;
}

/* Collapsed mode adjustments */
.navigation-drawer.collapsed .enhanced-nav-item,
.navigation-drawer.collapsed .enhanced-nav-group,
.navigation-drawer.collapsed .enhanced-nav-sub {
  padding-left: 1px !important;
  padding-right: 1px !important;
  justify-content: center;
}

.navigation-drawer.collapsed .enhanced-nav-sub {
  padding-left: 1px !important;
}

.navigation-drawer.collapsed .v-list-item-title,
.navigation-drawer.collapsed .v-list-item-subtitle,
.navigation-drawer.collapsed .enhanced-badge,
.navigation-drawer.collapsed .enhanced-chip {
  position: absolute !important;
  left: -9999px !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.navigation-drawer.collapsed .enhanced-nav-sub::before {
  display: none;
}

.navigation-drawer.collapsed .nav-icon,
.navigation-drawer.collapsed .nav-sub-icon {
  margin-inline-end: 0 !important;
}

.navigation-drawer.collapsed .navigation-footer {
  padding: var(--spacing-xs) 0 !important;
}

.navigation-drawer.collapsed .premium-badge,
.navigation-drawer.collapsed .version-info {
  display: none;
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

.navigation-drawer.collapsed .enhanced-nav-item:hover,
.navigation-drawer.collapsed .enhanced-nav-group:hover,
.navigation-drawer.collapsed .enhanced-nav-sub:hover {
  transform: none;
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