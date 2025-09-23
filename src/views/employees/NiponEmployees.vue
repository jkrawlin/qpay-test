<template>
  <v-container fluid class="pa-4">
    <a href="#nipon-table" class="visually-hidden-focusable skip-link">Skip to sponsored employees table</a>
    <!-- Hero KPI Section -->
    <section class="temp-hero mb-6" aria-label="Sponsored workforce summary">
      <div class="hero-intro">
        <h1 class="hero-title">Nipon Sponsored Overview</h1>
        <p class="hero-sub">Track visa timelines, documentation completeness, and employee status at a glance.</p>
        <div class="hero-actions">
          <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="addEmployee">Add Sponsored</v-btn>
          <v-btn variant="outlined" size="small" prepend-icon="mdi-download" @click="exportEmployees">Export</v-btn>
          <v-btn variant="outlined" size="small" prepend-icon="mdi-file-chart" @click="generateReport">Report</v-btn>
        </div>
      </div>
      <div class="hero-kpis" role="list" aria-label="Key performance indicators">
        <div class="kpi-card" role="listitem">
          <div class="kpi-label">Total</div>
          <div class="kpi-value">{{ totalEmployees }}</div>
          <div class="kpi-foot">Employees</div>
        </div>
        <div class="kpi-card" role="listitem">
          <div class="kpi-label">Active Visas</div>
          <div class="kpi-value">{{ activeVisas }}</div>
          <div class="kpi-foot" :class="{ warn: expiringVisas > 0 }">{{ expiringVisas }} expiring &lt;90d</div>
        </div>
        <div class="kpi-card" role="listitem">
          <div class="kpi-label">Incomplete Profiles</div>
          <div class="kpi-value" :class="{ warn: incompleteProfiles > 0 }">{{ incompleteProfiles }}</div>
          <div class="kpi-foot" :class="{ success: profileCompletionPct === 100 }">{{ profileCompletionPct }}% complete</div>
        </div>
        <!-- Removed Avg Salary KPI per request -->
      </div>
    </section>
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Nipon Sponsored Employees</h1>
            <p class="text-body-1 text-medium-emphasis">
              Comprehensive management of sponsored workforce with visa and document tracking
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            :prepend-icon="'mdi-plus'"
            @click="addEmployee"
            elevation="2"
          >
            Add Employee
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Advanced Filter Panel -->
    <section class="adv-filter-panel mb-6" aria-label="Filter sponsored employees">
      <header class="af-header">
        <div class="af-title-group">
          <v-icon size="18" class="mr-2">mdi-filter-variant</v-icon>
          <h2 class="af-title">Filters</h2>
          <v-chip size="x-small" variant="tonal" color="primary" v-if="activeFilterCount">{{ activeFilterCount }}</v-chip>
        </div>
        <div class="af-header-actions">
          <v-btn v-if="hasAnyFilter" variant="text" size="x-small" prepend-icon="mdi-close-circle" @click="resetAllFilters" class="mr-1">Clear All</v-btn>
          <v-btn variant="text" size="x-small" :prepend-icon="showAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="toggleAdvanced" :aria-expanded="showAdvanced" aria-controls="advanced-filter-region">{{ showAdvanced ? 'Hide Advanced' : 'Advanced' }}</v-btn>
        </div>
      </header>

      <!-- Quick Filters Row -->
      <div class="quick-filters" role="toolbar" aria-label="Quick filters" ref="quickFilterContainer" @keydown="handleQuickFilterKey">
        <button
          v-for="q in quickFilters"
          :key="q.key"
          :class="['qf-btn', { active: q.isActive }]"
          type="button"
          @click="toggleQuickFilter(q.key)"
          :aria-pressed="q.isActive"
          :tabindex="-1"
        >
          <v-icon size="16" class="mr-1">{{ q.icon }}</v-icon>{{ q.label }}
          <span v-if="q.badge !== undefined" class="qf-badge" :data-severity="q.severity || ''">{{ q.badge }}</span>
        </button>
      </div>

      <!-- Active Filter Pills -->
      <div v-if="activePills.length" class="active-pills" aria-label="Active filters">
        <transition-group name="pill-fade" tag="div" class="pill-wrap">
          <div v-for="p in activePills" :key="p.key" class="filter-pill" :data-type="p.type">
            <v-icon size="14" class="mr-1 pill-icon">{{ p.icon }}</v-icon>
            <span class="pill-label">{{ p.label }}</span>
            <button class="pill-clear" @click="p.clear" :aria-label="`Remove filter ${p.label}`">
              <v-icon size="14">mdi-close</v-icon>
            </button>
          </div>
        </transition-group>
      </div>

      <!-- Advanced Region -->
      <div
        v-show="showAdvanced"
        id="advanced-filter-region"
        class="advanced-region"
        role="region"
        aria-label="Advanced filters"
      >
        <div class="af-grid">
          <!-- Search -->
          <div class="af-field">
            <label class="af-label" for="emp-search">Search</label>
            <div class="af-input-icon">
              <v-icon size="18">mdi-magnify</v-icon>
              <input id="emp-search" v-model="searchQuery" type="text" placeholder="Name, ID, position, department..." />
              <button v-if="searchQuery" class="clear-mini" @click="searchQuery = ''" :aria-label="'Clear search'">
                <v-icon size="14">mdi-close</v-icon>
              </button>
            </div>
          </div>
          <!-- Department -->
          <div class="af-field">
            <label class="af-label" for="dept">Department</label>
            <input id="dept" v-model="departmentFilter" type="text" placeholder="e.g., Engineering" />
          </div>
          <!-- Visa Status -->
          <div class="af-field">
            <label class="af-label" for="visa-status">Visa Status</label>
            <div class="af-input-icon no-icon select-wrapper">
              <select id="visa-status" v-model="visaStatusFilter">
                <option value="">All</option>
                <option v-for="v in visaStatuses" :key="v" :value="v">{{ v }}</option>
              </select>
              <button v-if="visaStatusFilter" class="clear-mini" @click="visaStatusFilter = ''" :aria-label="'Clear visa status'">
                <v-icon size="14">mdi-close</v-icon>
              </button>
            </div>
          </div>
          <!-- Employment Status -->
          <div class="af-field">
            <label class="af-label" for="emp-status">Status</label>
            <select id="emp-status" v-model="statusFilter">
              <option value="">All</option>
              <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.title }}</option>
            </select>
          </div>
          <!-- Removed salary/day/incomplete docs filters per request -->
        </div>
      </div>
    </section>

    <!-- Employee Table -->
    <v-card variant="outlined">

      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="pagedEmployees"
        :loading="loading"
        :search="searchQuery"
        class="elevation-0"
        density="comfortable"
        item-value="id"
        hide-default-footer
        :item-class="rowClass"
        id="nipon-table"
        aria-label="Sponsored employees results"
      >
        <!-- Employee Avatar and Basic Info -->
        <template v-slot:item.employee="{ item }">
          <div class="d-flex align-center cursor-pointer" @click="viewEmployee(item)">
            <v-avatar
              :image="`https://i.pravatar.cc/48?u=${item.email}`"
              size="28"
              class="mr-2"
            />
            <div>
              <div class="text-body-2 font-weight-medium">{{ item.firstName }} {{ item.lastName }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Employee ID -->
        <template v-slot:item.employeeId="{ item }">
          <v-chip color="primary" variant="outlined" size="x-small" density="compact">
            {{ item.employeeId }}
          </v-chip>
        </template>

        <!-- Department -->
        <template v-slot:item.department="{ item }">
          <v-chip color="blue" variant="tonal" size="x-small" density="compact">
            {{ item.department }}
          </v-chip>
        </template>

        <!-- Position -->
        <template v-slot:item.position="{ item }">
          <span class="text-caption">{{ item.position }}</span>
        </template>

        <!-- Documents -->
        <template v-slot:item.documents="{ item }">
          <div class="d-flex align-center gap-1">
            <v-tooltip text="Qatar ID Document" v-if="item.qatarIdDocumentUrl">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-fingerprint" size="x-small" variant="text" color="primary" :href="item.qatarIdDocumentUrl" target="_blank" />
              </template>
            </v-tooltip>
            <v-tooltip text="Passport Document" v-if="item.passportDocumentUrl">
              <template #activator="{ props }">
                <v-btn v-bind="props" icon="mdi-passport-biometric" size="x-small" variant="text" color="primary" :href="item.passportDocumentUrl" target="_blank" />
              </template>
            </v-tooltip>
            <v-icon v-if="!item.qatarIdDocumentUrl && !item.passportDocumentUrl" size="16" color="grey">mdi-file-off</v-icon>
          </div>
        </template>

        <!-- Visa Status -->
        <template v-slot:item.visaStatus="{ item }">
          <v-chip
              :color="getVisaStatusColor(item.visa?.status || '')"
              variant="tonal"
              size="x-small"
              density="compact"
            >
              {{ item.visa?.status || '—' }}
            </v-chip>
        </template>

        <!-- Visa Expiry -->
        <template v-slot:item.visaExpiry="{ item }">
          <div class="text-caption">
            <div>{{ formatDate(item.visa?.expiryDate) }}</div>
            <div v-if="isVisaExpiringSoon(item.visa?.expiryDate)" class="text-caption text-medium-emphasis">
              <v-icon color="warning" size="small" class="mr-1">mdi-alert</v-icon>
              Expiring Soon
            </div>
          </div>
        </template>

        <!-- Salary -->
        <template v-slot:item.salary="{ item }">
          <span class="text-caption font-weight-medium">{{ formatCurrency(item.salary || item.basicSalary) }}</span>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="tonal"
            size="x-small"
            density="compact"
          >
            {{ capitalize(item.status) }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center gap-1">
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="viewEmployee(item)"
              title="View Employee"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="editEmployee(item)"
              title="Edit Employee"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              density="compact"
              color="primary"
              class="action-btn"
              @click="viewDocuments(item)"
              title="View Documents"
            >
              <v-icon>mdi-file-document</v-icon>
            </v-btn>
          </div>
        </template>

        <!-- No data -->
        <template v-slot:no-data>
          <div class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-office-building-outline</v-icon>
            <div class="text-h6 mb-2">No sponsored employees found</div>
            <div class="text-body-2 text-medium-emphasis mb-3">
              Add your first Nipon sponsored employee to get started
            </div>
            <v-btn color="primary" size="small" @click="addEmployee">
              Add Sponsored Employee
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <!-- Table Footer -->
      <v-divider />
      <div class="d-flex align-center justify-space-between pa-3 table-footer-enhanced">
        <div class="text-body-2 text-medium-emphasis">
          Showing {{ pageStart + 1 }}–{{ Math.min(pageEnd, filteredEmployees.length) }} of {{ filteredEmployees.length }} (Total: {{ niponEmployees.length }})
          <span class="ml-2 summary-inline">Active Visas: {{ activeVisas }} • Expiring &lt;90d: {{ expiringVisas }} • Incomplete: {{ incompleteProfiles }}</span>
        </div>
        <div class="d-flex align-center footer-controls">
          <v-select
            v-model="itemsPerPage"
            :items="[10, 25, 50, 100]"
            label="Rows"
            variant="outlined"
            density="compact"
            hide-details
            class="mr-3 rows-select"
            style="width: 92px;"
          />
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="5"
            size="small"
            density="compact"
          />
        </div>
      </div>
    </v-card>

    <!-- Employee Detail Dialog (Redesigned Layout) -->
    <v-dialog v-model="showDetailDialog" max-width="1100px" scrollable transition="dialog-bottom-transition">
      <v-card
        v-if="selectedEmployee"
        class="employee-detail-dialog redesigned"
        role="dialog"
        :aria-label="`${selectedEmployee.firstName} ${selectedEmployee.lastName} details`"
        aria-modal="true"
        @keydown.esc.prevent="showDetailDialog = false"
      >
        <div class="employee-modal-layout">
          <!-- Side Panel / Navigation -->
            <aside class="employee-modal-nav" :class="{'elevated': true}">
              <div class="profile-block">
                <v-avatar :image="`https://i.pravatar.cc/96?u=${selectedEmployee.email}`" size="72" class="mb-3" />
                <h2 class="emp-name">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</h2>
                <p class="emp-position">{{ selectedEmployee.position }}</p>
                <div class="chips-row">
                  <v-chip
                    v-if="selectedEmployee.status === 'Active'"
                    size="x-small"
                    density="compact"
                    class="mr-1 status-chip status-active"
                  >
                    {{ selectedEmployee.status }}
                  </v-chip>
                  <v-chip
                    v-else
                    :color="getStatusColor(selectedEmployee.status)"
                    variant="tonal"
                    size="x-small"
                    density="compact"
                    class="mr-1 status-chip"
                  >
                    {{ selectedEmployee.status }}
                  </v-chip>
                  <v-chip class="emp-id-chip" size="x-small" density="compact" variant="outlined">
                    {{ selectedEmployee.employeeId }}
                  </v-chip>
                </div>
              </div>

              <div class="progress-block removed-progress" aria-hidden="true"></div>

              <nav class="section-nav" aria-label="Employee sections">
                <ul>
                  <li v-for="s in sections" :key="s.key">
                    <button
                      :class="['nav-link', { active: activeSection === s.key }]"
                      @click="setSection(s.key)"
                      :aria-current="activeSection === s.key ? 'page' : false"
                      class="text-left"
                    >
                      <v-icon size="18" class="mr-2">{{ s.icon }}</v-icon>
                      <span>{{ s.label }}</span>
                      <v-chip v-if="s.key === 'documents'" size="x-small" variant="outlined" color="primary" class="ml-auto" density="compact">
                        {{ documentCount }}
                      </v-chip>
                    </button>
                  </li>
                </ul>
              </nav>

              <div class="side-actions">
                <v-btn block color="primary" size="small" class="mb-2" @click="editEmployee(selectedEmployee)">
                  <v-icon start size="16">mdi-pencil</v-icon> Edit
                </v-btn>
                <v-btn block variant="outlined" size="small" class="mb-2" @click="viewDocuments(selectedEmployee)">
                  <v-icon start size="16">mdi-file-document</v-icon> Docs
                </v-btn>
                <v-btn block variant="text" size="small" class="text-danger" @click="showDetailDialog = false">
                  <v-icon start size="16">mdi-close</v-icon> Close
                </v-btn>
              </div>
            </aside>

            <!-- Main Content Area -->
            <main class="employee-modal-content" ref="contentArea" tabindex="0">
              <div class="content-top-bar">
                <div class="breadcrumbs text-caption">
                  Employees / Nipon / <span class="current">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</span>
                </div>
                <div class="top-actions">
                  <v-btn variant="text" size="small" icon="mdi-arrow-left" @click="showDetailDialog = false" :title="'Close'" />
                  <v-btn variant="text" size="small" icon="mdi-dots-vertical" :title="'More actions'" />
                </div>
              </div>

              <!-- Overview Section -->
              <section v-if="activeSection === 'overview'" key="overview" class="section-block" aria-labelledby="overview-heading">
                <header class="section-header">
                  <h3 id="overview-heading"><v-icon size="20" class="mr-1 white-icon">mdi-account-details</v-icon> Overview</h3>
                  <p class="section-sub">Key personal & sponsorship attributes</p>
                </header>
                <div class="grid two">
                  <div class="panel">
                    <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-account</v-icon> Personal Information</h4>
                    <ul class="data-list">
                      <li><span>Full Name</span><strong>{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</strong></li>
                      <li><span>Email</span><strong>{{ selectedEmployee.email }}</strong></li>
                      <li><span>Phone</span><strong>{{ selectedEmployee.phoneNumber || 'Not provided' }}</strong></li>
                      <li><span>Date of Birth</span><strong>{{ formatDate(selectedEmployee.dateOfBirth) || 'Not provided' }}</strong></li>
                      <li><span>Nationality</span><strong>{{ selectedEmployee.nationality || 'Not provided' }}</strong></li>
                      <li><span>Qatar ID</span><strong>{{ selectedEmployee.qatarId || 'Not provided' }}</strong></li>
                      <li><span>Passport #</span><strong>{{ selectedEmployee.passportNumber || 'Not provided' }}</strong></li>
                    </ul>
                  </div>
                  <div class="panel">
                    <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-briefcase</v-icon> Employment</h4>
                    <ul class="data-list">
                      <li><span>Employee ID</span><strong>{{ selectedEmployee.employeeId }}</strong></li>
                      <li><span>Department</span><strong>{{ selectedEmployee.department }}</strong></li>
                      <li><span>Position</span><strong>{{ selectedEmployee.position }}</strong></li>
                      <li><span>Join Date</span><strong>{{ formatDate(selectedEmployee.joinDate) }}</strong></li>
                      <li><span>Status</span><strong><v-chip :color="getStatusColor(selectedEmployee.status)" size="x-small" variant="tonal">{{ selectedEmployee.status }}</v-chip></strong></li>
                      <li><span>Salary</span><strong class="text-green">{{ formatCurrency(selectedEmployee.salary) }}</strong></li>
                    </ul>
                  </div>
                </div>
                <div class="kpi-row">
                  <div class="kpi">
                    <div class="kpi-label">Visa Status</div>
                    <div class="kpi-value"><v-chip :color="getVisaStatusColor(selectedEmployee.visaStatus)" size="x-small" variant="tonal">{{ selectedEmployee.visaStatus }}</v-chip></div>
                  </div>
                  <div class="kpi">
                    <div class="kpi-label">Visa Expiry</div>
                    <div class="kpi-value">{{ formatDate(selectedEmployee.visaExpiry) }}</div>
                  </div>
                  <div class="kpi">
                    <div class="kpi-label">Profile Docs</div>
                    <div class="kpi-value">{{ documentCount }} / 2</div>
                  </div>
                </div>
              </section>

              <!-- Employment Section (extended) -->
              <section v-if="activeSection === 'employment'" key="employment" class="section-block" aria-labelledby="employment-heading">
                <header class="section-header">
                  <h3 id="employment-heading"><v-icon size="20" class="mr-1 white-icon">mdi-briefcase</v-icon> Employment & Compensation</h3>
                  <p class="section-sub">Core employment & salary information</p>
                </header>
                <div class="grid two">
                  <div class="panel">
                    <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-briefcase-account</v-icon> Employment Details</h4>
                    <ul class="data-list">
                      <li><span>Department</span><strong>{{ selectedEmployee.department }}</strong></li>
                      <li><span>Join Date</span><strong>{{ formatDate(selectedEmployee.joinDate) }}</strong></li>
                      <li><span>Status</span><strong>{{ selectedEmployee.status }}</strong></li>
                      <li><span>Bank</span><strong>{{ selectedEmployee.bankName || 'Not provided' }}</strong></li>
                      <li><span>Account #</span><strong>{{ selectedEmployee.accountNumber || 'Not provided' }}</strong></li>
                      <li><span>IBAN</span><strong>{{ selectedEmployee.iban || 'Not provided' }}</strong></li>
                    </ul>
                  </div>
                  <div class="panel">
                    <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-cash</v-icon> Compensation</h4>
                    <ul class="data-list">
                      <li><span>Monthly Salary</span><strong class="text-green">{{ formatCurrency(selectedEmployee.salary) }}</strong></li>
                      <li><span>Annual Est.</span><strong>{{ formatCurrency(selectedEmployee.salary * 12) }}</strong></li>
                    </ul>
                  </div>
                </div>
              </section>

              <!-- Documents Section -->
              <section v-if="activeSection === 'documents'" key="documents" class="section-block" aria-labelledby="documents-heading">
                <header class="section-header">
                  <h3 id="documents-heading"><v-icon size="20" class="mr-1 white-icon">mdi-file-document-multiple</v-icon> Documents</h3>
                  <p class="section-sub">Identity & employment documents</p>
                </header>
                <div class="documents-list">
                  <div class="doc-item" v-for="doc in documentItems" :key="doc.key">
                    <div class="doc-icon">
                      <v-icon :color="doc.color" size="22">{{ doc.icon }}</v-icon>
                    </div>
                    <div class="doc-meta">
                      <div class="doc-title">{{ doc.label }}</div>
                      <div class="doc-status" :class="{'missing': !doc.present}">
                        <v-chip v-if="doc.present" size="x-small" color="success" variant="tonal">Available</v-chip>
                        <v-chip v-else size="x-small" color="grey" variant="outlined">Missing</v-chip>
                      </div>
                    </div>
                    <div class="doc-actions">
                      <v-btn
                        v-if="doc.present"
                        size="x-small"
                        variant="text"
                        color="primary"
                        @click="viewDocument(doc.value as string)"
                      >
                        View
                      </v-btn>
                      <v-btn
                        v-else
                        size="x-small"
                        variant="text"
                        color="primary"
                        @click="uploadDocument(doc.key)"
                      >
                        Upload
                      </v-btn>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Visa Section -->
              <section v-if="activeSection === 'visa'" key="visa" class="section-block" aria-labelledby="visa-heading">
                <header class="section-header">
                  <h3 id="visa-heading"><v-icon size="20" class="mr-1 white-icon">mdi-passport</v-icon> Visa Information</h3>
                  <p class="section-sub">Status & expiry timeline</p>
                </header>
                <div class="grid one">
                  <div class="panel">
                    <h4 class="panel-title"><v-icon size="16" class="mr-1 white-icon">mdi-passport</v-icon> Visa Details</h4>
                    <ul class="data-list">
                      <li><span>Visa Status</span><strong><v-chip :color="getVisaStatusColor(selectedEmployee.visaStatus)" size="x-small" variant="tonal">{{ selectedEmployee.visaStatus }}</v-chip></strong></li>
                      <li><span>Visa Expiry</span><strong>{{ formatDate(selectedEmployee.visaExpiry) }}</strong></li>
                      <li><span>Expiring Soon</span><strong>{{ isVisaExpiringSoon(selectedEmployee.visaExpiry) ? 'Yes' : 'No' }}</strong></li>
                    </ul>
                  </div>
                </div>
              </section>

              <!-- Activity -->
              <section v-if="activeSection === 'activity'" key="activity" class="section-block" aria-labelledby="activity-heading">
                <header class="section-header">
                  <h3 id="activity-heading"><v-icon size="20" class="mr-1 white-icon">mdi-history</v-icon> Activity (Placeholder)</h3>
                  <p class="section-sub">Recent changes & audit log (future)</p>
                </header>
                <div class="placeholder muted">No activity data implemented yet.</div>
              </section>

              <!-- Notes -->
              <section v-if="activeSection === 'notes'" key="notes" class="section-block" aria-labelledby="notes-heading">
                <header class="section-header">
                  <h3 id="notes-heading"><v-icon size="20" class="mr-1 white-icon">mdi-note-text</v-icon> Notes (Placeholder)</h3>
                  <p class="section-sub">Internal remarks & annotations (future)</p>
                </header>
                <div class="placeholder muted">Notes feature not yet implemented.</div>
              </section>
            </main>
        </div>
      </v-card>
    </v-dialog>

    <!-- Edit Employee Dialog -->
    <v-dialog v-model="showEditDialog" max-width="800px" scrollable>
      <v-card class="employee-edit-dialog">
        <v-card-title class="text-white">
          <v-icon left class="mr-2">mdi-account-edit</v-icon>
          Edit Employee - {{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}
        </v-card-title>
        
        <v-card-text class="pt-6">
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="selectedEmployee?.firstName"
                  label="First Name"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="selectedEmployee?.lastName"
                  label="Last Name"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="selectedEmployee?.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="selectedEmployee?.phoneNumber"
                  label="Phone Number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="selectedEmployee?.department"
                  label="Department"
                  variant="outlined"
                  density="compact"
                  placeholder="e.g., Engineering, Project Management, Finance"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="selectedEmployee?.position"
                  label="Position"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="selectedEmployee?.salary"
                  label="Salary (QAR)"
                  type="number"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  :model-value="selectedEmployee?.status"
                  :items="['Active', 'Inactive', 'On Leave']"
                  label="Status"
                  variant="outlined"
                  density="compact"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showEditDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="saveEmployeeChanges"
          >
            <v-icon left>mdi-content-save</v-icon>
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Documents Dialog -->
    <v-dialog v-model="showDocumentsDialog" max-width="900px" scrollable>
      <v-card class="employee-documents-dialog">
        <v-card-title class="text-white">
          <v-icon left class="mr-2">mdi-file-document-multiple</v-icon>
          Employee Documents - {{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}
        </v-card-title>
        
        <v-card-text class="pt-6">
          <v-row>
            <!-- Qatar ID Document -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-1 d-flex align-center">
                  <v-icon class="mr-2 text-primary">mdi-card-account-details</v-icon>
                  Qatar ID
                </v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <strong>Qatar ID:</strong> {{ selectedEmployee?.qatarId }}
                  </div>
                  <div class="mb-3" v-if="selectedEmployee?.qatarIdDocument">
                    <v-chip color="success" size="small">
                      <v-icon left size="small">mdi-check</v-icon>
                      Document Available
                    </v-chip>
                  </div>
                  <div class="mb-3" v-else>
                    <v-chip color="warning" size="small">
                      <v-icon left size="small">mdi-alert</v-icon>
                      Document Missing
                    </v-chip>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    v-if="selectedEmployee?.qatarIdDocument"
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="viewDocument(selectedEmployee.qatarIdDocument)"
                  >
                    <v-icon left>mdi-eye</v-icon>
                    View
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="uploadDocument('qatarId')"
                  >
                    <v-icon left>mdi-upload</v-icon>
                    {{ selectedEmployee?.qatarIdDocument ? 'Replace' : 'Upload' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Passport Document -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-1 d-flex align-center">
                  <v-icon class="mr-2 text-primary">mdi-passport</v-icon>
                  Passport
                </v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <strong>Passport No:</strong> {{ selectedEmployee?.passportNumber }}
                  </div>
                  <div class="mb-3" v-if="selectedEmployee?.passportDocument">
                    <v-chip color="success" size="small">
                      <v-icon left size="small">mdi-check</v-icon>
                      Document Available
                    </v-chip>
                  </div>
                  <div class="mb-3" v-else>
                    <v-chip color="warning" size="small">
                      <v-icon left size="small">mdi-alert</v-icon>
                      Document Missing
                    </v-chip>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    v-if="selectedEmployee?.passportDocument"
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="viewDocument(selectedEmployee.passportDocument)"
                  >
                    <v-icon left>mdi-eye</v-icon>
                    View
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="uploadDocument('passport')"
                  >
                    <v-icon left>mdi-upload</v-icon>
                    {{ selectedEmployee?.passportDocument ? 'Replace' : 'Upload' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Visa Document -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-1 d-flex align-center">
                  <v-icon class="mr-2 text-primary">mdi-passport-biometric</v-icon>
                  Visa/RP
                </v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <strong>Status:</strong> {{ selectedEmployee?.visaStatus }}
                  </div>
                  <div class="mb-3">
                    <strong>Expiry:</strong> {{ selectedEmployee?.visaExpiry }}
                  </div>
                  <div class="mb-3">
                    <v-chip 
                      :color="isVisaExpiringSoon(selectedEmployee?.visaExpiry) ? 'warning' : 'success'" 
                      size="small"
                    >
                      <v-icon left size="small">
                        {{ isVisaExpiringSoon(selectedEmployee?.visaExpiry) ? 'mdi-alert' : 'mdi-check' }}
                      </v-icon>
                      {{ isVisaExpiringSoon(selectedEmployee?.visaExpiry) ? 'Expiring Soon' : 'Valid' }}
                    </v-chip>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="uploadDocument('visa')"
                  >
                    <v-icon left>mdi-upload</v-icon>
                    Upload Visa
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Contract Document -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-1 d-flex align-center">
                  <v-icon class="mr-2 text-primary">mdi-file-document</v-icon>
                  Employment Contract
                </v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <strong>Join Date:</strong> {{ selectedEmployee?.joinDate }}
                  </div>
                  <div class="mb-3">
                    <strong>Position:</strong> {{ selectedEmployee?.position }}
                  </div>
                  <div class="mb-3">
                    <strong>Salary:</strong> {{ formatCurrency(selectedEmployee?.salary) }}
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="generateContract"
                  >
                    <v-icon left>mdi-file-document</v-icon>
                    Generate Contract
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            @click="showDocumentsDialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="downloadAllDocuments"
          >
            <v-icon left>mdi-download</v-icon>
            Download All
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Reactive state
const loading = ref(false)
const searchQuery = ref('')
const departmentFilter = ref('')
const visaStatusFilter = ref('')
const statusFilter = ref('')
// Advanced filter state
const showAdvanced = ref(true)
// Removed: minSalary, maxSalary, maxDaysRemaining, onlyIncompleteDocs
// Quick filter flags
const qfExpiringSoon = ref(false)
const qfIncomplete = ref(false)
const qfActive = ref(false)
const itemsPerPage = ref(10)
const currentPage = ref(1)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const showDocumentsDialog = ref(false)
const selectedEmployee = ref<any>(null)
// Old tab system replaced by section-based layout (activeTab removed)
const activeSection = ref('overview')
const contentArea = ref<HTMLElement | null>(null)
const opening = ref(false)

// Sidebar navigation sections
const sections = [
  { key: 'overview', label: 'Overview', icon: 'mdi-account-details' },
  { key: 'employment', label: 'Employment', icon: 'mdi-briefcase' },
  { key: 'documents', label: 'Documents', icon: 'mdi-file-document-multiple' },
  { key: 'visa', label: 'Visa', icon: 'mdi-passport' },
  { key: 'activity', label: 'Activity', icon: 'mdi-history' },
  { key: 'notes', label: 'Notes', icon: 'mdi-note-text' }
]

// Filter options
const visaStatuses = ['Valid', 'Expiring Soon', 'Renewal Required', 'Processing']
const statusOptions = [
  { title: 'Active', value: 'Active' },
  { title: 'Inactive', value: 'Inactive' },
  { title: 'On Leave', value: 'On Leave' }
]

// Firestore employees (permanent/sponsored) from store
import { useEmployeeStore } from '@/stores/employees-db'
import { useToastStore } from '@/stores/toasts'
const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const employeeStore = useEmployeeStore()
const toast = useToastStore()
// Initialize store (no company scoping yet)
employeeStore.initialize()

// Adapt legacy expectations: niponEmployees == permanent employees (type 'permanent')
const niponEmployees = computed(() => employeeStore.employees.filter(e => e.type === 'permanent'))

// Table headers
const headers = [
  { title: 'Employee', key: 'employee', sortable: false, width: '200px' },
  { title: 'ID', key: 'employeeId', width: '80px' },
  { title: 'Department', key: 'department', width: '120px' },
  { title: 'Position', key: 'position', width: '140px' },
  { title: 'Docs', key: 'documents', width: '90px', sortable: false },
  { title: 'Visa Status', key: 'visaStatus', width: '110px' },
  { title: 'Visa Expiry', key: 'visaExpiry', width: '120px' },
  { title: 'Salary', key: 'salary', width: '100px' },
  { title: 'Status', key: 'status', width: '80px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
]

// Pagination helpers
const pageStart = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const pageEnd = computed(() => pageStart.value + itemsPerPage.value)
let totalPages = computed<number>(() => 1)

// Computed properties
const filteredEmployees = computed(() => {
  let filtered = niponEmployees.value

  if (departmentFilter.value) {
    filtered = filtered.filter(emp => 
      emp.department.toLowerCase().includes(departmentFilter.value.toLowerCase())
    )
  }

  if (visaStatusFilter.value) {
    filtered = filtered.filter(emp => (emp.visa?.status || '') === visaStatusFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(emp => emp.status === statusFilter.value.toLowerCase())
  }

  // Quick filters
  if (qfActive.value) filtered = filtered.filter(emp => emp.status === 'Active')
  if (qfExpiringSoon.value) filtered = filtered.filter(emp => isVisaExpiringSoon(emp.visa?.expiryDate))
  if (qfIncomplete.value) filtered = filtered.filter(emp => !emp.qatarId || !emp.passportNumber)

  // Text search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(emp => [emp.firstName, emp.lastName, emp.employeeId, emp.position, emp.department].some(f => (f || '').toLowerCase().includes(q)))
  }

  return filtered
})

// Now define pagination derived from filteredEmployees
totalPages = computed<number>(() => Math.max(1, Math.ceil(filteredEmployees.value.length / itemsPerPage.value)))
const pagedEmployees = computed(() => filteredEmployees.value.slice(pageStart.value, pageEnd.value))
watch([itemsPerPage, filteredEmployees], () => { if (pageStart.value >= filteredEmployees.value.length) currentPage.value = 1 })

const totalEmployees = computed(() => niponEmployees.value.length)
const activeVisas = computed(() => niponEmployees.value.filter(emp => emp.visa?.status?.toLowerCase() === 'valid').length)
const expiringVisas = computed(() => niponEmployees.value.filter(emp => isVisaExpiringSoon(emp.visa?.expiryDate)).length)
const incompleteProfiles = computed(() => niponEmployees.value.filter(emp => !emp.qatarId || !emp.passportNumber).length)
const profileCompletionPct = computed(() => {
  if (!niponEmployees.value.length) return 0
  const docFields = ['qatarIdDocument','passportDocument'] as const
  const possible = niponEmployees.value.length * docFields.length
  const have = niponEmployees.value.reduce((sum, e: any) => sum + docFields.filter(f => !!e[f]).length, 0)
  return Math.round((have / possible) * 100)
})

// Quick filters meta
const quickFilters = computed(() => [
  { key: 'expiring', label: 'Expiring <90d', icon: 'mdi-timer-sand', isActive: qfExpiringSoon.value, badge: expiringVisas.value || 0, severity: expiringVisas.value ? 'warn' : undefined },
  { key: 'incomplete', label: 'Incomplete Docs', icon: 'mdi-file-alert', isActive: qfIncomplete.value, badge: incompleteProfiles.value || 0, severity: incompleteProfiles.value ? 'warn' : undefined },
  { key: 'active', label: 'Active Status', icon: 'mdi-badge-account', isActive: qfActive.value, badge: niponEmployees.value.filter(e => e.status === 'Active').length || 0 }
])

const toggleQuickFilter = (key: string) => {
  switch (key) {
    case 'expiring': qfExpiringSoon.value = !qfExpiringSoon.value; break
    case 'incomplete': qfIncomplete.value = !qfIncomplete.value; break
    case 'active': qfActive.value = !qfActive.value; break
  }
}

const hasAnyFilter = computed(() => !!(
  searchQuery.value || departmentFilter.value || visaStatusFilter.value || statusFilter.value ||
  // numeric salary/day filters & incomplete docs toggle removed
  qfExpiringSoon.value || qfIncomplete.value || qfActive.value
))

const resetAllFilters = () => {
  searchQuery.value = ''
  departmentFilter.value = ''
  visaStatusFilter.value = ''
  statusFilter.value = ''
  // removed numeric filter state resets
  qfExpiringSoon.value = false
  qfIncomplete.value = false
  qfActive.value = false
}

const toggleAdvanced = () => { showAdvanced.value = !showAdvanced.value }

// Active pills representation
const activePills = computed(() => {
  const pills: Array<{ key:string; label:string; icon:string; clear:() => void; type:string }> = []
  if (searchQuery.value) pills.push({ key:'search', label:`Search: ${searchQuery.value}`, icon:'mdi-magnify', clear:() => { searchQuery.value='' }, type:'text' })
  if (departmentFilter.value) pills.push({ key:'dept', label:departmentFilter.value, icon:'mdi-domain', clear:() => { departmentFilter.value='' }, type:'select' })
  if (visaStatusFilter.value) pills.push({ key:'visa', label:visaStatusFilter.value, icon:'mdi-passport', clear:() => { visaStatusFilter.value='' }, type:'select' })
  if (statusFilter.value) pills.push({ key:'status', label:statusFilter.value, icon:'mdi-badge-account', clear:() => { statusFilter.value='' }, type:'select' })
  // removed numeric & incomplete docs pills
  if (qfExpiringSoon.value) pills.push({ key:'qfExpiring', label:'Expiring <90d', icon:'mdi-timer-sand', clear:() => { qfExpiringSoon.value=false }, type:'quick' })
  if (qfIncomplete.value) pills.push({ key:'qfIncomplete', label:'Incomplete Docs', icon:'mdi-file-alert', clear:() => { qfIncomplete.value=false }, type:'quick' })
  if (qfActive.value) pills.push({ key:'qfActive', label:'Active Status', icon:'mdi-badge-account', clear:() => { qfActive.value=false }, type:'quick' })
  return pills
})

const activeFilterCount = computed(() => activePills.value.length)

// Methods
const addEmployee = () => {
  router.push('/employees/create?type=nipon')
}

const viewEmployee = (employee: any) => {
  selectedEmployee.value = employee
  activeSection.value = 'overview'
  showDetailDialog.value = true
  opening.value = true
  setTimeout(() => { opening.value = false }, 350)
  nextTick(() => {
    requestAnimationFrame(() => contentArea.value?.focus())
  })
}

const editEmployee = (employee: any) => {
  selectedEmployee.value = employee
  showEditDialog.value = true
  console.log('Opening edit dialog for:', employee.firstName, employee.lastName)
}

const viewDocuments = (employee: any) => {
  selectedEmployee.value = employee
  showDocumentsDialog.value = true
  console.log('Viewing documents for:', employee.firstName, employee.lastName)
}

const viewDocument = (documentPath: string) => {
  if (documentPath) {
  toast.push({ message: `Open doc: ${documentPath}`, type: 'info' })
  } else {
  toast.push({ message: 'No document available', type: 'warning' })
  }
}

const exportEmployees = () => {
  try {
    // Create CSV content for sponsored employees
    const headers = ['Employee ID', 'Full Name', 'Position', 'Department', 'Join Date', 'Salary', 'Status', 'Visa Status', 'Qatar ID', 'Passport Number']
    const csvContent = [
      headers.join(','),
      ...niponEmployees.value.map(emp => [
        emp.employeeId,
        `"${emp.firstName} ${emp.lastName}"`,
        emp.position,
        emp.department,
        emp.joinDate,
        emp.salary,
        emp.status,
        emp.visaStatus,
        emp.qatarId,
        emp.passportNumber
      ].join(','))
    ].join('\n')

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `sponsored_employees_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
  toast.push({ message: 'Employees exported (placeholder)', type: 'success' })
  } catch (error) {
    console.error('Export failed:', error)
  toast.push({ message: 'Export failed', type: 'error' })
  }
}

const generateReport = () => {
  try {
    // Generate comprehensive sponsored employee report
    const reportContent = `
NIPON SPONSORED EMPLOYEES REPORT
Generated on: ${new Date().toLocaleDateString()}

SUMMARY:
Total Sponsored Employees: ${niponEmployees.value.length}
Active Visas: ${activeVisas.value}
Expiring Visas (within 90 days): ${expiringVisas.value}
Incomplete Profiles: ${incompleteProfiles.value}

DETAILED LIST:
${niponEmployees.value.map(emp => 
  `${emp.firstName} ${emp.lastName} - ${emp.position} (${emp.status})`
).join('\n')}

VISA STATUS OVERVIEW:
Valid: ${niponEmployees.value.filter(emp => emp.visaStatus === 'Valid').length}
Expiring Soon: ${niponEmployees.value.filter(emp => emp.visaStatus === 'Expiring Soon').length}
Renewal Required: ${niponEmployees.value.filter(emp => emp.visaStatus === 'Renewal Required').length}
Processing: ${niponEmployees.value.filter(emp => emp.visaStatus === 'Processing').length}

DEPARTMENT BREAKDOWN:
${[...new Set(niponEmployees.value.map(emp => emp.department))].map(dept => 
  `${dept}: ${niponEmployees.value.filter(emp => emp.department === dept).length} employees`
).join('\n')}
    `
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `nipon_employees_report_${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    
  toast.push({ message: 'Report generated (placeholder)', type: 'success' })
  } catch (error) {
    console.error('Report generation failed:', error)
  toast.push({ message: 'Report generation failed', type: 'error' })
  }
}
// Document computed structures for redesigned modal
const documentItems = computed(() => {
  if (!selectedEmployee.value) return []
  return [
    { key: 'qatarIdDocument', label: 'Qatar ID Document', value: selectedEmployee.value.qatarIdDocument, present: !!selectedEmployee.value.qatarIdDocument, icon: 'mdi-card-account-details', color: 'primary' },
    { key: 'passportDocument', label: 'Passport Document', value: selectedEmployee.value.passportDocument, present: !!selectedEmployee.value.passportDocument, icon: 'mdi-passport', color: 'green' }
  ]
})
const documentCount = computed(() => documentItems.value.filter(d => d.present).length)

// Section helper
const setSection = (key: string) => {
  activeSection.value = key
  nextTick(() => contentArea.value?.scrollTo({ top: 0, behavior: 'smooth' }))
}
// Row class highlight
const rowClass = (item: any) => {
  if (!item) return ''
  if (isVisaExpiringSoon(item.visaExpiry)) return 'row-expiring'
  if (!item.qatarIdDocument || !item.passportDocument) return 'row-incomplete'
  return ''
}

// Keyboard navigation for quick filters (roving tabindex)
const quickFilterContainer = ref<HTMLElement | null>(null)
const setQuickFilterFocus = (index: number) => {
  const buttons = quickFilterContainer.value?.querySelectorAll<HTMLButtonElement>('.qf-btn')
  if (!buttons || !buttons.length) return
  const i = (index + buttons.length) % buttons.length
  buttons.forEach((b, idx) => b.tabIndex = idx === i ? 0 : -1)
  buttons[i].focus()
}
const handleQuickFilterKey = (e: KeyboardEvent) => {
  const buttons = quickFilterContainer.value?.querySelectorAll<HTMLButtonElement>('.qf-btn')
  if (!buttons || !buttons.length) return
  const currentIndex = Array.from(buttons).findIndex(b => b === document.activeElement)
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setQuickFilterFocus(currentIndex + 1) }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setQuickFilterFocus(currentIndex - 1) }
  else if (e.key === 'Home') { e.preventDefault(); setQuickFilterFocus(0) }
  else if (e.key === 'End') { e.preventDefault(); setQuickFilterFocus(buttons.length - 1) }
}

onMounted(() => {
  // Initialize roving tabindex for quick filters
  setTimeout(() => setQuickFilterFocus(0), 0)
})

// New dialog functions
const saveEmployeeChanges = () => {
  try {
    if (selectedEmployee.value) {
      // Find and update the employee in the list
      const index = niponEmployees.value.findIndex(emp => emp.employeeId === selectedEmployee.value.employeeId)
      if (index !== -1) {
        niponEmployees.value[index] = { ...selectedEmployee.value }
      }
      
      showEditDialog.value = false
  toast.push({ message: `Employee ${selectedEmployee.value.firstName} updated`, type: 'success' })
    }
  } catch (error) {
    console.error('Save failed:', error)
  toast.push({ message: 'Save failed', type: 'error' })
  }
}

const uploadDocument = (documentType: string) => {
  try {
    // Simulate file upload process
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.jpg,.jpeg,.png'
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        // Simulate upload delay
        setTimeout(() => {
          if (selectedEmployee.value) {
            // Update the document path in the employee record
            const documentPath = `/documents/${selectedEmployee.value.employeeId}_${documentType}_${Date.now()}.${file.name.split('.').pop()}`
            
            // Update the appropriate document field
            switch (documentType) {
              case 'qatarId':
                selectedEmployee.value.qatarIdDocument = documentPath
                break
              case 'passport':
                selectedEmployee.value.passportDocument = documentPath
                break
              case 'visa':
                selectedEmployee.value.visaDocument = documentPath
                break
            }
            
            toast.push({ message: `${documentType} uploaded`, type: 'success' })
          }
        }, 1000)
      }
    }
    
    input.click()
  } catch (error) {
    console.error('Upload failed:', error)
  toast.push({ message: 'Upload failed', type: 'error' })
  }
}

const generateContract = () => {
  if (selectedEmployee.value) {
    try {
      const contractContent = `
EMPLOYMENT CONTRACT - SPONSORED EMPLOYEE

Employee: ${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}
Employee ID: ${selectedEmployee.value.employeeId}
Position: ${selectedEmployee.value.position}
Department: ${selectedEmployee.value.department}

PERSONAL DETAILS:
Qatar ID: ${selectedEmployee.value.qatarId}
Passport: ${selectedEmployee.value.passportNumber}
Nationality: ${selectedEmployee.value.nationality}

EMPLOYMENT TERMS:
Join Date: ${selectedEmployee.value.joinDate}
Basic Salary: QAR ${selectedEmployee.value.salary.toLocaleString()}
Status: ${selectedEmployee.value.status}

SPONSORSHIP DETAILS:
Sponsor: Nipon Payroll Pro
Visa Status: ${selectedEmployee.value.visaStatus}

Generated on: ${new Date().toLocaleDateString()}
      `
      
      const blob = new Blob([contractContent], { type: 'text/plain;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `contract_${selectedEmployee.value.employeeId}_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
      
  toast.push({ message: 'Contract generated (placeholder)', type: 'success' })
    } catch (error) {
      console.error('Contract generation failed:', error)
  toast.push({ message: 'Contract generation failed', type: 'error' })
    }
  }
}

const downloadAllDocuments = () => {
  if (selectedEmployee.value) {
    try {
      // Create a comprehensive document package
      const documentSummary = `
DOCUMENT PACKAGE - ${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}

Employee ID: ${selectedEmployee.value.employeeId}
Generated on: ${new Date().toLocaleDateString()}

INCLUDED DOCUMENTS:
${selectedEmployee.value.qatarIdDocument ? '✓ Qatar ID Document' : '✗ Qatar ID Document (Not Available)'}
${selectedEmployee.value.passportDocument ? '✓ Passport Document' : '✗ Passport Document (Not Available)'}
${selectedEmployee.value.visaDocument ? '✓ Visa Document' : '✗ Visa Document (Not Available)'}

EMPLOYEE INFORMATION:
Name: ${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}
Position: ${selectedEmployee.value.position}
Department: ${selectedEmployee.value.department}
Qatar ID: ${selectedEmployee.value.qatarId}
Passport: ${selectedEmployee.value.passportNumber}
      `
      
      const blob = new Blob([documentSummary], { type: 'text/plain;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `all_documents_${selectedEmployee.value.employeeId}_${new Date().toISOString().split('T')[0]}.txt`
      link.click()
      
  toast.push({ message: 'Documents downloaded (placeholder)', type: 'success' })
    } catch (error) {
      console.error('Download failed:', error)
  toast.push({ message: 'Download failed', type: 'error' })
    }
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'error'
    case 'On Leave': return 'warning'
    default: return 'grey'
  }
}

const getVisaStatusColor = (status: string) => {
  switch (status) {
    case 'Valid': return 'success'
    case 'Expiring Soon': return 'warning'
    case 'Renewal Required': return 'error'
    case 'Processing': return 'info'
    default: return 'grey'
  }
}


const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB')
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(amount)
}

const isVisaExpiringSoon = (expiryDate: string) => {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 90 && diffDays > 0
}

// Lifecycle
onMounted(() => {
  // Load sponsored employees data
})
</script>

<style scoped>
.v-data-table :deep(.v-data-table__td) {
  padding: 6px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-data-table :deep(.v-data-table__th) {
  padding: 8px 8px !important;
  font-weight: 600;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #424242;
}

/* Sticky header */
.v-data-table :deep(thead) { position: sticky; top: 0; z-index: 5; box-shadow:0 1px 0 rgba(0,0,0,0.08); }

/* Row highlights */
.v-data-table :deep(.row-expiring) { background: linear-gradient(90deg, rgba(255,222,173,0.18), rgba(255,222,173,0)); }
.v-data-table :deep(.row-expiring:hover) { background: linear-gradient(90deg, rgba(255,222,173,0.32), rgba(255,222,173,0.04)); }
.v-data-table :deep(.row-incomplete) { background: linear-gradient(90deg, rgba(255,235,230,0.22), rgba(255,235,230,0)); }
.v-data-table :deep(.row-incomplete:hover) { background: linear-gradient(90deg, rgba(255,235,230,0.38), rgba(255,235,230,0.05)); }

/* Footer enhancements */
.table-footer-enhanced { background:#fafbfc; border-top:1px solid #e5e7eb; }
.summary-inline { font-size:11px; letter-spacing:.3px; opacity:.75; }
.rows-select :deep(.v-field__input) { padding:0 4px !important; }
.footer-controls { gap:4px; }

/* Accessibility utilities */
.visually-hidden-focusable {position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}
.visually-hidden-focusable:focus {position:static;width:auto;height:auto;margin:0;padding:8px 12px;background:#8B1538;color:#fff;border-radius:6px;box-shadow:0 0 0 3px rgba(255,255,255,0.6);} 
.qf-btn:focus-visible, .filter-pill:focus-visible, .af-field select:focus-visible, .af-field input:focus-visible {outline:2px solid #8B1538; outline-offset:2px;}

/* Advanced Filter Panel */
.adv-filter-panel {background:#ffffff; border:1px solid #e5e7eb; border-radius:22px; position:relative; box-shadow:0 4px 18px -4px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04); overflow:hidden;}
.adv-filter-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f8f9fa,#eef1f4);opacity:.85;}
.adv-filter-panel > * {position:relative; z-index:2;}
.af-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#fafbfc,#f0f3f6);} 
.af-title-group{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;}
.af-title{margin:0;font-size:16px;font-weight:600;letter-spacing:.5px;}
.af-header-actions{display:flex;align-items:center;gap:4px;}
.quick-filters{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 6px;}
.qf-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border:1px solid #d5d9de;border-radius:28px;background:#fff;color:#374151;cursor:pointer;transition:.28s background,.28s color,.28s border,.28s box-shadow;position:relative;}
.qf-btn:hover{background:#f0f2f4;}
.qf-btn.active{background:linear-gradient(135deg,#8B1538,#6B0F2A);color:#fff;border-color:#8B1538;box-shadow:0 4px 14px -4px rgba(139,21,56,.55);} 
.qf-btn .v-icon{color:inherit !important;}
.qf-badge{background:#e5e7eb;color:#333;font-size:10px;font-weight:600;line-height:1; padding:3px 6px; border-radius:10px; margin-left:4px; position:relative; top:-1px;}
.qf-badge[data-severity="warn"]{background:#fff3cd;color:#924c00;}
.active-pills{padding:0 16px 2px;}
.pill-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.filter-pill{display:inline-flex;align-items:center;max-width:220px;background:#fff;border:1px solid #d9dde2;border-radius:18px;padding:4px 8px 4px 10px;font-size:11px;font-weight:500;line-height:1; box-shadow:0 2px 4px rgba(0,0,0,.05); transition:.25s background,.25s border,.25s box-shadow;}
.filter-pill:hover{background:#f7f9fa;}
.filter-pill[data-type="quick"]{background:#8B1538;color:#fff;border-color:#8B1538;} 
.filter-pill[data-type="quick"] .v-icon{color:#fff !important;}
.filter-pill .v-icon{color:#657080 !important;}
.pill-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pill-clear{background:transparent;border:none;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;padding:2px;cursor:pointer;color:inherit;}
.pill-clear .v-icon{font-size:14px !important;}
.advanced-region{padding:12px 18px 20px;border-top:1px dashed #e2e5e9;animation:slideDown .35s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.af-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;}
.af-field{display:flex;flex-direction:column;gap:6px;}
.af-label{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#5a6472;}
.af-input-icon{position:relative;display:flex;align-items:center;gap:0;width:100%;}
.af-input-icon input,.af-input-icon select{width:100%;padding:9px 38px 9px 38px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;appearance:none;line-height:1.25;transition:.25s border,.25s box-shadow;}
.af-input-icon input:focus,.af-input-icon select:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-input-icon .v-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8B1538;pointer-events:none;}
.af-input-icon select{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);background-position:calc(100% - 20px) calc(50% - 4px),calc(100% - 15px) calc(50% - 4px);background-size:6px 6px,6px 6px;background-repeat:no-repeat;}
.af-input-icon select:focus{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);}
.af-input-icon.no-icon select{padding-left:12px;}
.clear-mini{position:absolute;right:6px;border:none;background:transparent;padding:2px;cursor:pointer;color:#6b7280;}
.clear-mini .v-icon{font-size:14px !important;color:#6b7280 !important;}
.af-input-icon input#emp-search{padding-left:40px;}
.af-input-icon button.clear-mini{top:50%;transform:translateY(-50%);} 
.af-field select, .af-field input[type=number], .af-field input[type=text]{padding:8px 12px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;transition:.25s;border:.25s box-shadow;}
.af-field select:focus, .af-field input[type=number]:focus, .af-field input[type=text]:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-toggle{display:flex;align-items:flex-start;justify-content:space-between;}
.af-toggle .v-switch{margin-top:2px;}
.pill-fade-enter-active,.pill-fade-leave-active{transition:all .25s ease;}
.pill-fade-enter-from{opacity:0;transform:translateY(-4px);} 
.pill-fade-leave-to{opacity:0;transform:translateY(-4px);} 
@media (max-width:780px){.af-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}}
@media (max-width:640px){.af-header{flex-wrap:wrap;gap:10px;}.quick-filters{padding-top:10px;}}

/* Hero KPI Styles */
.temp-hero {display:flex; flex-wrap:wrap; gap:30px; background:linear-gradient(135deg,#8B1538 0%,#6B0F2A 55%,#5a0d24 100%); padding:34px 40px 36px; border-radius:26px; position:relative; overflow:hidden;}
.temp-hero:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(255,255,255,0.25),transparent 60%);pointer-events:none;}
.hero-intro{flex:1 1 320px; min-width:260px; max-width:480px;}
.hero-title{margin:0  0 10px;font-size:30px;font-weight:700;letter-spacing:.5px;color:#fff;}
.hero-sub{margin:0 0 18px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);}
.hero-actions{display:flex;gap:8px;flex-wrap:wrap;}
.hero-kpis{flex:1 1 460px;min-width:340px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.kpi-card{background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:18px;padding:14px 16px 16px;position:relative;color:#fff;overflow:hidden;display:flex;flex-direction:column;transition:.35s transform,.35s box-shadow;}
.kpi-card:hover{transform:translateY(-3px); box-shadow:0 6px 24px -8px rgba(0,0,0,0.35);} 
.kpi-card:after{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0));opacity:0;transition:.35s;}
.kpi-card:hover:after{opacity:1;}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.65px;opacity:.8;font-weight:600;}
.kpi-value{font-size:30px;font-weight:700;line-height:1.05;margin:4px 0 4px;}
.kpi-value.warn{color:#ffcf5c;}
.kpi-foot{font-size:11px;letter-spacing:.5px;text-transform:uppercase;opacity:.75;font-weight:500;}
.kpi-foot.warn{color:#ffb347;opacity:1;}
.kpi-foot.success{color:#8ef0b2;opacity:1;}
/* Force white text for hero KPI labels/values/footers */
.temp-hero .kpi-label, .temp-hero .kpi-value, .temp-hero .kpi-foot { color:#ffffff !important; }
/* Warn/success variants retain semantic color accents via text-shadow if needed */
.temp-hero .kpi-foot.warn { color:#ffcf5c !important; }
.temp-hero .kpi-foot.success { color:#8ef0b2 !important; }
@media (max-width:960px){.temp-hero{padding:30px 28px 32px;}.hero-title{font-size:26px;}}
@media (max-width:640px){.hero-kpis{grid-template-columns:repeat(2,1fr);} }

/* Ensure white text on maroon gradients */
.temp-hero { color:#fff; }
.temp-hero .v-btn, .temp-hero .v-icon { color:#fff !important; }

.v-data-table :deep(.v-data-table__td) {
  padding: 6px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-data-table :deep(.v-data-table__th) {
  padding: 8px 8px !important;
  font-weight: 600;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #424242;
}

/* Sticky header */
.v-data-table :deep(thead) { position: sticky; top: 0; z-index: 5; box-shadow:0 1px 0 rgba(0,0,0,0.08); }

/* Row highlights */
.v-data-table :deep(.row-expiring) { background: linear-gradient(90deg, rgba(255,222,173,0.18), rgba(255,222,173,0)); }
.v-data-table :deep(.row-expiring:hover) { background: linear-gradient(90deg, rgba(255,222,173,0.32), rgba(255,222,173,0.04)); }
.v-data-table :deep(.row-incomplete) { background: linear-gradient(90deg, rgba(255,235,230,0.22), rgba(255,235,230,0)); }
.v-data-table :deep(.row-incomplete:hover) { background: linear-gradient(90deg, rgba(255,235,230,0.38), rgba(255,235,230,0.05)); }

/* Footer enhancements */
.table-footer-enhanced { background:#fafbfc; border-top:1px solid #e5e7eb; }
.summary-inline { font-size:11px; letter-spacing:.3px; opacity:.75; }
.rows-select :deep(.v-field__input) { padding:0 4px !important; }
.footer-controls { gap:4px; }

/* Accessibility utilities */
.visually-hidden-focusable {position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}
.visually-hidden-focusable:focus {position:static;width:auto;height:auto;margin:0;padding:8px 12px;background:#8B1538;color:#fff;border-radius:6px;box-shadow:0 0 0 3px rgba(255,255,255,0.6);} 
.qf-btn:focus-visible, .filter-pill:focus-visible, .af-field select:focus-visible, .af-field input:focus-visible {outline:2px solid #8B1538; outline-offset:2px;}

/* Advanced Filter Panel */
.adv-filter-panel {background:#ffffff; border:1px solid #e5e7eb; border-radius:22px; position:relative; box-shadow:0 4px 18px -4px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04); overflow:hidden;}
.adv-filter-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f8f9fa,#eef1f4);opacity:.85;}
.adv-filter-panel > * {position:relative; z-index:2;}
.af-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#fafbfc,#f0f3f6);} 
.af-title-group{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;}
.af-title{margin:0;font-size:16px;font-weight:600;letter-spacing:.5px;}
.af-header-actions{display:flex;align-items:center;gap:4px;}
.quick-filters{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 6px;}
.qf-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border:1px solid #d5d9de;border-radius:28px;background:#fff;color:#374151;cursor:pointer;transition:.28s background,.28s color,.28s border,.28s box-shadow;position:relative;}
.qf-btn:hover{background:#f0f2f4;}
.qf-btn.active{background:linear-gradient(135deg,#8B1538,#6B0F2A);color:#fff;border-color:#8B1538;box-shadow:0 4px 14px -4px rgba(139,21,56,.55);} 
.qf-btn .v-icon{color:inherit !important;}
.qf-badge{background:#e5e7eb;color:#333;font-size:10px;font-weight:600;line-height:1; padding:3px 6px; border-radius:10px; margin-left:4px; position:relative; top:-1px;}
.qf-badge[data-severity="warn"]{background:#fff3cd;color:#924c00;}
.active-pills{padding:0 16px 2px;}
.pill-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.filter-pill{display:inline-flex;align-items:center;max-width:220px;background:#fff;border:1px solid #d9dde2;border-radius:18px;padding:4px 8px 4px 10px;font-size:11px;font-weight:500;line-height:1; box-shadow:0 2px 4px rgba(0,0,0,.05); transition:.25s background,.25s border,.25s box-shadow;}
.filter-pill:hover{background:#f7f9fa;}
.filter-pill[data-type="quick"]{background:#8B1538;color:#fff;border-color:#8B1538;} 
.filter-pill[data-type="quick"] .v-icon{color:#fff !important;}
.filter-pill .v-icon{color:#657080 !important;}
.pill-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pill-clear{background:transparent;border:none;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;padding:2px;cursor:pointer;color:inherit;}
.pill-clear .v-icon{font-size:14px !important;}
.advanced-region{padding:12px 18px 20px;border-top:1px dashed #e2e5e9;animation:slideDown .35s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.af-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;}
.af-field{display:flex;flex-direction:column;gap:6px;}
.af-label{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#5a6472;}
.af-input-icon{position:relative;display:flex;align-items:center;gap:0;width:100%;}
.af-input-icon input,.af-input-icon select{width:100%;padding:9px 38px 9px 38px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;appearance:none;line-height:1.25;transition:.25s border,.25s box-shadow;}
.af-input-icon input:focus,.af-input-icon select:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-input-icon .v-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8B1538;pointer-events:none;}
.af-input-icon select{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);background-position:calc(100% - 20px) calc(50% - 4px),calc(100% - 15px) calc(50% - 4px);background-size:6px 6px,6px 6px;background-repeat:no-repeat;}
.af-input-icon select:focus{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);}
.af-input-icon.no-icon select{padding-left:12px;}
.clear-mini{position:absolute;right:6px;border:none;background:transparent;padding:2px;cursor:pointer;color:#6b7280;}
.clear-mini .v-icon{font-size:14px !important;color:#6b7280 !important;}
.af-input-icon input#emp-search{padding-left:40px;}
.af-input-icon button.clear-mini{top:50%;transform:translateY(-50%);} 
.af-field select, .af-field input[type=number], .af-field input[type=text]{padding:8px 12px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;transition:.25s;border:.25s box-shadow;}
.af-field select:focus, .af-field input[type=number]:focus, .af-field input[type=text]:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-toggle{display:flex;align-items:flex-start;justify-content:space-between;}
.af-toggle .v-switch{margin-top:2px;}
.pill-fade-enter-active,.pill-fade-leave-active{transition:all .25s ease;}
.pill-fade-enter-from{opacity:0;transform:translateY(-4px);} 
.pill-fade-leave-to{opacity:0;transform:translateY(-4px);} 
@media (max-width:780px){.af-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}}
@media (max-width:640px){.af-header{flex-wrap:wrap;gap:10px;}.quick-filters{padding-top:10px;}}

/* Hero KPI Styles */
.temp-hero {display:flex; flex-wrap:wrap; gap:30px; background:linear-gradient(135deg,#8B1538 0%,#6B0F2A 55%,#5a0d24 100%); padding:34px 40px 36px; border-radius:26px; position:relative; overflow:hidden;}
.temp-hero:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(255,255,255,0.25),transparent 60%);pointer-events:none;}
.hero-intro{flex:1 1 320px; min-width:260px; max-width:480px;}
.hero-title{margin:0 0 10px;font-size:30px;font-weight:700;letter-spacing:.5px;color:#fff;}
.hero-sub{margin:0 0 18px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);}
.hero-actions{display:flex;gap:8px;flex-wrap:wrap;}
.hero-kpis{flex:1 1 460px;min-width:340px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.kpi-card{background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:18px;padding:14px 16px 16px;position:relative;color:#fff;overflow:hidden;display:flex;flex-direction:column;transition:.35s transform,.35s box-shadow;}
.kpi-card:hover{transform:translateY(-3px); box-shadow:0 6px 24px -8px rgba(0,0,0,0.35);} 
.kpi-card:after{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0));opacity:0;transition:.35s;}
.kpi-card:hover:after{opacity:1;}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.65px;opacity:.8;font-weight:600;}
.kpi-value{font-size:30px;font-weight:700;line-height:1.05;margin:4px 0 4px;}
.kpi-value.warn{color:#ffcf5c;}
.kpi-foot{font-size:11px;letter-spacing:.5px;text-transform:uppercase;opacity:.75;font-weight:500;}
.kpi-foot.warn{color:#ffb347;opacity:1;}
.kpi-foot.success{color:#8ef0b2;opacity:1;}
/* Force white text for hero KPI labels/values/footers */
.temp-hero .kpi-label, .temp-hero .kpi-value, .temp-hero .kpi-foot { color:#ffffff !important; }
/* Warn/success variants retain semantic color accents via text-shadow if needed */
.temp-hero .kpi-foot.warn { color:#ffcf5c !important; }
.temp-hero .kpi-foot.success { color:#8ef0b2 !important; }
@media (max-width:960px){.temp-hero{padding:30px 28px 32px;}.hero-title{font-size:26px;}}
@media (max-width:640px){.hero-kpis{grid-template-columns:repeat(2,1fr);} }

/* Ensure white text on maroon gradients */
.temp-hero { color:#fff; }
.temp-hero .v-btn, .temp-hero .v-icon { color:#fff !important; }

.v-data-table :deep(.v-data-table__td) {
  padding: 6px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-data-table :deep(.v-data-table__th) {
  padding: 8px 8px !important;
  font-weight: 600;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #424242;
}

/* Sticky header */
.v-data-table :deep(thead) { position: sticky; top: 0; z-index: 5; box-shadow:0 1px 0 rgba(0,0,0,0.08); }

/* Row highlights */
.v-data-table :deep(.row-expiring) { background: linear-gradient(90deg, rgba(255,222,173,0.18), rgba(255,222,173,0)); }
.v-data-table :deep(.row-expiring:hover) { background: linear-gradient(90deg, rgba(255,222,173,0.32), rgba(255,222,173,0.04)); }
.v-data-table :deep(.row-incomplete) { background: linear-gradient(90deg, rgba(255,235,230,0.22), rgba(255,235,230,0)); }
.v-data-table :deep(.row-incomplete:hover) { background: linear-gradient(90deg, rgba(255,235,230,0.38), rgba(255,235,230,0.05)); }

/* Footer enhancements */
.table-footer-enhanced { background:#fafbfc; border-top:1px solid #e5e7eb; }
.summary-inline { font-size:11px; letter-spacing:.3px; opacity:.75; }
.rows-select :deep(.v-field__input) { padding:0 4px !important; }
.footer-controls { gap:4px; }

/* Accessibility utilities */
.visually-hidden-focusable {position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}
.visually-hidden-focusable:focus {position:static;width:auto;height:auto;margin:0;padding:8px 12px;background:#8B1538;color:#fff;border-radius:6px;box-shadow:0 0 0 3px rgba(255,255,255,0.6);} 
.qf-btn:focus-visible, .filter-pill:focus-visible, .af-field select:focus-visible, .af-field input:focus-visible {outline:2px solid #8B1538; outline-offset:2px;}

/* Advanced Filter Panel */
.adv-filter-panel {background:#ffffff; border:1px solid #e5e7eb; border-radius:22px; position:relative; box-shadow:0 4px 18px -4px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04); overflow:hidden;}
.adv-filter-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f8f9fa,#eef1f4);opacity:.85;}
.adv-filter-panel > * {position:relative; z-index:2;}
.af-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#fafbfc,#f0f3f6);} 
.af-title-group{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;}
.af-title{margin:0;font-size:16px;font-weight:600;letter-spacing:.5px;}
.af-header-actions{display:flex;align-items:center;gap:4px;}
.quick-filters{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 6px;}
.qf-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border:1px solid #d5d9de;border-radius:28px;background:#fff;color:#374151;cursor:pointer;transition:.28s background,.28s color,.28s border,.28s box-shadow;position:relative;}
.qf-btn:hover{background:#f0f2f4;}
.qf-btn.active{background:linear-gradient(135deg,#8B1538,#6B0F2A);color:#fff;border-color:#8B1538;box-shadow:0 4px 14px -4px rgba(139,21,56,.55);} 
.qf-btn .v-icon{color:inherit !important;}
.qf-badge{background:#e5e7eb;color:#333;font-size:10px;font-weight:600;line-height:1; padding:3px 6px; border-radius:10px; margin-left:4px; position:relative; top:-1px;}
.qf-badge[data-severity="warn"]{background:#fff3cd;color:#924c00;}
.active-pills{padding:0 16px 2px;}
.pill-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.filter-pill{display:inline-flex;align-items:center;max-width:220px;background:#fff;border:1px solid #d9dde2;border-radius:18px;padding:4px 8px 4px 10px;font-size:11px;font-weight:500;line-height:1; box-shadow:0 2px 4px rgba(0,0,0,.05); transition:.25s background,.25s border,.25s box-shadow;}
.filter-pill:hover{background:#f7f9fa;}
.filter-pill[data-type="quick"]{background:#8B1538;color:#fff;border-color:#8B1538;} 
.filter-pill[data-type="quick"] .v-icon{color:#fff !important;}
.filter-pill .v-icon{color:#657080 !important;}
.pill-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pill-clear{background:transparent;border:none;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;padding:2px;cursor:pointer;color:inherit;}
.pill-clear .v-icon{font-size:14px !important;}
.advanced-region{padding:12px 18px 20px;border-top:1px dashed #e2e5e9;animation:slideDown .35s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.af-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;}
.af-field{display:flex;flex-direction:column;gap:6px;}
.af-label{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#5a6472;}
.af-input-icon{position:relative;display:flex;align-items:center;gap:0;width:100%;}
.af-input-icon input,.af-input-icon select{width:100%;padding:9px 38px 9px 38px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;appearance:none;line-height:1.25;transition:.25s border,.25s box-shadow;}
.af-input-icon input:focus,.af-input-icon select:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-input-icon .v-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8B1538;pointer-events:none;}
.af-input-icon select{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);background-position:calc(100% - 20px) calc(50% - 4px),calc(100% - 15px) calc(50% - 4px);background-size:6px 6px,6px 6px;background-repeat:no-repeat;}
.af-input-icon select:focus{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);}
.af-input-icon.no-icon select{padding-left:12px;}
.clear-mini{position:absolute;right:6px;border:none;background:transparent;padding:2px;cursor:pointer;color:#6b7280;}
.clear-mini .v-icon{font-size:14px !important;color:#6b7280 !important;}
.af-input-icon input#emp-search{padding-left:40px;}
.af-input-icon button.clear-mini{top:50%;transform:translateY(-50%);} 
.af-field select, .af-field input[type=number], .af-field input[type=text]{padding:8px 12px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;transition:.25s;border:.25s box-shadow;}
.af-field select:focus, .af-field input[type=number]:focus, .af-field input[type=text]:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-toggle{display:flex;align-items:flex-start;justify-content:space-between;}
.af-toggle .v-switch{margin-top:2px;}
.pill-fade-enter-active,.pill-fade-leave-active{transition:all .25s ease;}
.pill-fade-enter-from{opacity:0;transform:translateY(-4px);} 
.pill-fade-leave-to{opacity:0;transform:translateY(-4px);} 
@media (max-width:780px){.af-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}}
@media (max-width:640px){.af-header{flex-wrap:wrap;gap:10px;}.quick-filters{padding-top:10px;}}

/* Hero KPI Styles */
.temp-hero {display:flex; flex-wrap:wrap; gap:30px; background:linear-gradient(135deg,#8B1538 0%,#6B0F2A 55%,#5a0d24 100%); padding:34px 40px 36px; border-radius:26px; position:relative; overflow:hidden;}
.temp-hero:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(255,255,255,0.25),transparent 60%);pointer-events:none;}
.hero-intro{flex:1 1 320px; min-width:260px; max-width:480px;}
.hero-title{margin:0 0 10px;font-size:30px;font-weight:700;letter-spacing:.5px;color:#fff;}
.hero-sub{margin:0 0 18px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);}
.hero-actions{display:flex;gap:8px;flex-wrap:wrap;}
.hero-kpis{flex:1 1 460px;min-width:340px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.kpi-card{background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:18px;padding:14px 16px 16px;position:relative;color:#fff;overflow:hidden;display:flex;flex-direction:column;transition:.35s transform,.35s box-shadow;}
.kpi-card:hover{transform:translateY(-3px); box-shadow:0 6px 24px -8px rgba(0,0,0,0.35);} 
.kpi-card:after{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0));opacity:0;transition:.35s;}
.kpi-card:hover:after{opacity:1;}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.65px;opacity:.8;font-weight:600;}
.kpi-value{font-size:30px;font-weight:700;line-height:1.05;margin:4px 0 4px;}
.kpi-value.warn{color:#ffcf5c;}
.kpi-foot{font-size:11px;letter-spacing:.5px;text-transform:uppercase;opacity:.75;font-weight:500;}
.kpi-foot.warn{color:#ffb347;opacity:1;}
.kpi-foot.success{color:#8ef0b2;opacity:1;}
/* Force white text for hero KPI labels/values/footers */
.temp-hero .kpi-label, .temp-hero .kpi-value, .temp-hero .kpi-foot { color:#ffffff !important; }
/* Warn/success variants retain semantic color accents via text-shadow if needed */
.temp-hero .kpi-foot.warn { color:#ffcf5c !important; }
.temp-hero .kpi-foot.success { color:#8ef0b2 !important; }
@media (max-width:960px){.temp-hero{padding:30px 28px 32px;}.hero-title{font-size:26px;}}
@media (max-width:640px){.hero-kpis{grid-template-columns:repeat(2,1fr);} }

/* Ensure white text on maroon gradients */
.temp-hero { color:#fff; }
.temp-hero .v-btn, .temp-hero .v-icon { color:#fff !important; }

.v-data-table :deep(.v-data-table__td) {
  padding: 6px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-data-table :deep(.v-data-table__th) {
  padding: 8px 8px !important;
  font-weight: 600;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #424242;
}

/* Sticky header */
.v-data-table :deep(thead) { position: sticky; top: 0; z-index: 5; box-shadow:0 1px 0 rgba(0,0,0,0.08); }

/* Row highlights */
.v-data-table :deep(.row-expiring) { background: linear-gradient(90deg, rgba(255,222,173,0.18), rgba(255,222,173,0)); }
.v-data-table :deep(.row-expiring:hover) { background: linear-gradient(90deg, rgba(255,222,173,0.32), rgba(255,222,173,0.04)); }
.v-data-table :deep(.row-incomplete) { background: linear-gradient(90deg, rgba(255,235,230,0.22), rgba(255,235,230,0)); }
.v-data-table :deep(.row-incomplete:hover) { background: linear-gradient(90deg, rgba(255,235,230,0.38), rgba(255,235,230,0.05)); }

/* Footer enhancements */
.table-footer-enhanced { background:#fafbfc; border-top:1px solid #e5e7eb; }
.summary-inline { font-size:11px; letter-spacing:.3px; opacity:.75; }
.rows-select :deep(.v-field__input) { padding:0 4px !important; }
.footer-controls { gap:4px; }

/* Accessibility utilities */
.visually-hidden-focusable {position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}
.visually-hidden-focusable:focus {position:static;width:auto;height:auto;margin:0;padding:8px 12px;background:#8B1538;color:#fff;border-radius:6px;box-shadow:0 0 0 3px rgba(255,255,255,0.6);} 
.qf-btn:focus-visible, .filter-pill:focus-visible, .af-field select:focus-visible, .af-field input:focus-visible {outline:2px solid #8B1538; outline-offset:2px;}

/* Advanced Filter Panel */
.adv-filter-panel {background:#ffffff; border:1px solid #e5e7eb; border-radius:22px; position:relative; box-shadow:0 4px 18px -4px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04); overflow:hidden;}
.adv-filter-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f8f9fa,#eef1f4);opacity:.85;}
.adv-filter-panel > * {position:relative; z-index:2;}
.af-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#fafbfc,#f0f3f6);} 
.af-title-group{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;}
.af-title{margin:0;font-size:16px;font-weight:600;letter-spacing:.5px;}
.af-header-actions{display:flex;align-items:center;gap:4px;}
.quick-filters{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 6px;}
.qf-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border:1px solid #d5d9de;border-radius:28px;background:#fff;color:#374151;cursor:pointer;transition:.28s background,.28s color,.28s border,.28s box-shadow;position:relative;}
.qf-btn:hover{background:#f0f2f4;}
.qf-btn.active{background:linear-gradient(135deg,#8B1538,#6B0F2A);color:#fff;border-color:#8B1538;box-shadow:0 4px 14px -4px rgba(139,21,56,.55);} 
.qf-btn .v-icon{color:inherit !important;}
.qf-badge{background:#e5e7eb;color:#333;font-size:10px;font-weight:600;line-height:1; padding:3px 6px; border-radius:10px; margin-left:4px; position:relative; top:-1px;}
.qf-badge[data-severity="warn"]{background:#fff3cd;color:#924c00;}
.active-pills{padding:0 16px 2px;}
.pill-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.filter-pill{display:inline-flex;align-items:center;max-width:220px;background:#fff;border:1px solid #d9dde2;border-radius:18px;padding:4px 8px 4px 10px;font-size:11px;font-weight:500;line-height:1; box-shadow:0 2px 4px rgba(0,0,0,.05); transition:.25s background,.25s border,.25s box-shadow;}
.filter-pill:hover{background:#f7f9fa;}
.filter-pill[data-type="quick"]{background:#8B1538;color:#fff;border-color:#8B1538;} 
.filter-pill[data-type="quick"] .v-icon{color:#fff !important;}
.filter-pill .v-icon{color:#657080 !important;}
.pill-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pill-clear{background:transparent;border:none;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;padding:2px;cursor:pointer;color:inherit;}
.pill-clear .v-icon{font-size:14px !important;}
.advanced-region{padding:12px 18px 20px;border-top:1px dashed #e2e5e9;animation:slideDown .35s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.af-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;}
.af-field{display:flex;flex-direction:column;gap:6px;}
.af-label{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#5a6472;}
.af-input-icon{position:relative;display:flex;align-items:center;gap:0;width:100%;}
.af-input-icon input,.af-input-icon select{width:100%;padding:9px 38px 9px 38px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;appearance:none;line-height:1.25;transition:.25s border,.25s box-shadow;}
.af-input-icon input:focus,.af-input-icon select:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-input-icon .v-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8B1538;pointer-events:none;}
.af-input-icon select{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);background-position:calc(100% - 20px) calc(50% - 4px),calc(100% - 15px) calc(50% - 4px);background-size:6px 6px,6px 6px;background-repeat:no-repeat;}
.af-input-icon select:focus{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);}
.af-input-icon.no-icon select{padding-left:12px;}
.clear-mini{position:absolute;right:6px;border:none;background:transparent;padding:2px;cursor:pointer;color:#6b7280;}
.clear-mini .v-icon{font-size:14px !important;color:#6b7280 !important;}
.af-input-icon input#emp-search{padding-left:40px;}
.af-input-icon button.clear-mini{top:50%;transform:translateY(-50%);} 
.af-field select, .af-field input[type=number], .af-field input[type=text]{padding:8px 12px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;transition:.25s;border:.25s box-shadow;}
.af-field select:focus, .af-field input[type=number]:focus, .af-field input[type=text]:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-toggle{display:flex;align-items:flex-start;justify-content:space-between;}
.af-toggle .v-switch{margin-top:2px;}
.pill-fade-enter-active,.pill-fade-leave-active{transition:all .25s ease;}
.pill-fade-enter-from{opacity:0;transform:translateY(-4px);} 
.pill-fade-leave-to{opacity:0;transform:translateY(-4px);} 
@media (max-width:780px){.af-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}}
@media (max-width:640px){.af-header{flex-wrap:wrap;gap:10px;}.quick-filters{padding-top:10px;}}

/* Hero KPI Styles */
.temp-hero {display:flex; flex-wrap:wrap; gap:30px; background:linear-gradient(135deg,#8B1538 0%,#6B0F2A 55%,#5a0d24 100%); padding:34px 40px 36px; border-radius:26px; position:relative; overflow:hidden;}
.temp-hero:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(255,255,255,0.25),transparent 60%);pointer-events:none;}
.hero-intro{flex:1 1 320px; min-width:260px; max-width:480px;}
.hero-title{margin:0 0 10px;font-size:30px;font-weight:700;letter-spacing:.5px;color:#fff;}
.hero-sub{margin:0 0 18px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);}
.hero-actions{display:flex;gap:8px;flex-wrap:wrap;}
.hero-kpis{flex:1 1 460px;min-width:340px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.kpi-card{background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:18px;padding:14px 16px 16px;position:relative;color:#fff;overflow:hidden;display:flex;flex-direction:column;transition:.35s transform,.35s box-shadow;}
.kpi-card:hover{transform:translateY(-3px); box-shadow:0 6px 24px -8px rgba(0,0,0,0.35);} 
.kpi-card:after{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0));opacity:0;transition:.35s;}
.kpi-card:hover:after{opacity:1;}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.65px;opacity:.8;font-weight:600;}
.kpi-value{font-size:30px;font-weight:700;line-height:1.05;margin:4px 0 4px;}
.kpi-value.warn{color:#ffcf5c;}
.kpi-foot{font-size:11px;letter-spacing:.5px;text-transform:uppercase;opacity:.75;font-weight:500;}
.kpi-foot.warn{color:#ffb347;opacity:1;}
.kpi-foot.success{color:#8ef0b2;opacity:1;}
/* Force white text for hero KPI labels/values/footers */
.temp-hero .kpi-label, .temp-hero .kpi-value, .temp-hero .kpi-foot { color:#ffffff !important; }
/* Warn/success variants retain semantic color accents via text-shadow if needed */
.temp-hero .kpi-foot.warn { color:#ffcf5c !important; }
.temp-hero .kpi-foot.success { color:#8ef0b2 !important; }
@media (max-width:960px){.temp-hero{padding:30px 28px 32px;}.hero-title{font-size:26px;}}
@media (max-width:640px){.hero-kpis{grid-template-columns:repeat(2,1fr);} }

/* Ensure white text on maroon gradients */
.temp-hero { color:#fff; }
.temp-hero .v-btn, .temp-hero .v-icon { color:#fff !important; }

.v-data-table :deep(.v-data-table__td) {
  padding: 6px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-data-table :deep(.v-data-table__th) {
  padding: 8px 8px !important;
  font-weight: 600;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #424242;
}

/* Sticky header */
.v-data-table :deep(thead) { position: sticky; top: 0; z-index: 5; box-shadow:0 1px 0 rgba(0,0,0,0.08); }

/* Row highlights */
.v-data-table :deep(.row-expiring) { background: linear-gradient(90deg, rgba(255,222,173,0.18), rgba(255,222,173,0)); }
.v-data-table :deep(.row-expiring:hover) { background: linear-gradient(90deg, rgba(255,222,173,0.32), rgba(255,222,173,0.04)); }
.v-data-table :deep(.row-incomplete) { background: linear-gradient(90deg, rgba(255,235,230,0.22), rgba(255,235,230,0)); }
.v-data-table :deep(.row-incomplete:hover) { background: linear-gradient(90deg, rgba(255,235,230,0.38), rgba(255,235,230,0.05)); }

/* Footer enhancements */
.table-footer-enhanced { background:#fafbfc; border-top:1px solid #e5e7eb; }
.summary-inline { font-size:11px; letter-spacing:.3px; opacity:.75; }
.rows-select :deep(.v-field__input) { padding:0 4px !important; }
.footer-controls { gap:4px; }

/* Accessibility utilities */
.visually-hidden-focusable {position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}
.visually-hidden-focusable:focus {position:static;width:auto;height:auto;margin:0;padding:8px 12px;background:#8B1538;color:#fff;border-radius:6px;box-shadow:0 0 0 3px rgba(255,255,255,0.6);} 
.qf-btn:focus-visible, .filter-pill:focus-visible, .af-field select:focus-visible, .af-field input:focus-visible {outline:2px solid #8B1538; outline-offset:2px;}

/* Advanced Filter Panel */
.adv-filter-panel {background:#ffffff; border:1px solid #e5e7eb; border-radius:22px; position:relative; box-shadow:0 4px 18px -4px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04); overflow:hidden;}
.adv-filter-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f8f9fa,#eef1f4);opacity:.85;}
.adv-filter-panel > * {position:relative; z-index:2;}
.af-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#fafbfc,#f0f3f6);} 
.af-title-group{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;}
.af-title{margin:0;font-size:16px;font-weight:600;letter-spacing:.5px;}
.af-header-actions{display:flex;align-items:center;gap:4px;}
.quick-filters{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 6px;}
.qf-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border:1px solid #d5d9de;border-radius:28px;background:#fff;color:#374151;cursor:pointer;transition:.28s background,.28s color,.28s border,.28s box-shadow;position:relative;}
.qf-btn:hover{background:#f0f2f4;}
.qf-btn.active{background:linear-gradient(135deg,#8B1538,#6B0F2A);color:#fff;border-color:#8B1538;box-shadow:0 4px 14px -4px rgba(139,21,56,.55);} 
.qf-btn .v-icon{color:inherit !important;}
.qf-badge{background:#e5e7eb;color:#333;font-size:10px;font-weight:600;line-height:1; padding:3px 6px; border-radius:10px; margin-left:4px; position:relative; top:-1px;}
.qf-badge[data-severity="warn"]{background:#fff3cd;color:#924c00;}
.active-pills{padding:0 16px 2px;}
.pill-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.filter-pill{display:inline-flex;align-items:center;max-width:220px;background:#fff;border:1px solid #d9dde2;border-radius:18px;padding:4px 8px 4px 10px;font-size:11px;font-weight:500;line-height:1; box-shadow:0 2px 4px rgba(0,0,0,.05); transition:.25s background,.25s border,.25s box-shadow;}
.filter-pill:hover{background:#f7f9fa;}
.filter-pill[data-type="quick"]{background:#8B1538;color:#fff;border-color:#8B1538;} 
.filter-pill[data-type="quick"] .v-icon{color:#fff !important;}
.filter-pill .v-icon{color:#657080 !important;}
.pill-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pill-clear{background:transparent;border:none;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;padding:2px;cursor:pointer;color:inherit;}
.pill-clear .v-icon{font-size:14px !important;}
.advanced-region{padding:12px 18px 20px;border-top:1px dashed #e2e5e9;animation:slideDown .35s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.af-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;}
.af-field{display:flex;flex-direction:column;gap:6px;}
.af-label{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#5a6472;}
.af-input-icon{position:relative;display:flex;align-items:center;gap:0;width:100%;}
.af-input-icon input,.af-input-icon select{width:100%;padding:9px 38px 9px 38px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;appearance:none;line-height:1.25;transition:.25s border,.25s box-shadow;}
.af-input-icon input:focus,.af-input-icon select:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-input-icon .v-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8B1538;pointer-events:none;}
.af-input-icon select{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);background-position:calc(100% - 20px) calc(50% - 4px),calc(100% - 15px) calc(50% - 4px);background-size:6px 6px,6px 6px;background-repeat:no-repeat;}
.af-input-icon select:focus{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);}
.af-input-icon.no-icon select{padding-left:12px;}
.clear-mini{position:absolute;right:6px;border:none;background:transparent;padding:2px;cursor:pointer;color:#6b7280;}
.clear-mini .v-icon{font-size:14px !important;color:#6b7280 !important;}
.af-input-icon input#emp-search{padding-left:40px;}
.af-input-icon button.clear-mini{top:50%;transform:translateY(-50%);} 
.af-field select, .af-field input[type=number], .af-field input[type=text]{padding:8px 12px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;transition:.25s;border:.25s box-shadow;}
.af-field select:focus, .af-field input[type=number]:focus, .af-field input[type=text]:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-toggle{display:flex;align-items:flex-start;justify-content:space-between;}
.af-toggle .v-switch{margin-top:2px;}
.pill-fade-enter-active,.pill-fade-leave-active{transition:all .25s ease;}
.pill-fade-enter-from{opacity:0;transform:translateY(-4px);} 
.pill-fade-leave-to{opacity:0;transform:translateY(-4px);} 
@media (max-width:780px){.af-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}}
@media (max-width:640px){.af-header{flex-wrap:wrap;gap:10px;}.quick-filters{padding-top:10px;}}

/* Hero KPI Styles */
.temp-hero {display:flex; flex-wrap:wrap; gap:30px; background:linear-gradient(135deg,#8B1538 0%,#6B0F2A 55%,#5a0d24 100%); padding:34px 40px 36px; border-radius:26px; position:relative; overflow:hidden;}
.temp-hero:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(255,255,255,0.25),transparent 60%);pointer-events:none;}
.hero-intro{flex:1 1 320px; min-width:260px; max-width:480px;}
.hero-title{margin:0 0 10px;font-size:30px;font-weight:700;letter-spacing:.5px;color:#fff;}
.hero-sub{margin:0 0 18px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);}
.hero-actions{display:flex;gap:8px;flex-wrap:wrap;}
.hero-kpis{flex:1 1 460px;min-width:340px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.kpi-card{background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:18px;padding:14px 16px 16px;position:relative;color:#fff;overflow:hidden;display:flex;flex-direction:column;transition:.35s transform,.35s box-shadow;}
.kpi-card:hover{transform:translateY(-3px); box-shadow:0 6px 24px -8px rgba(0,0,0,0.35);} 
.kpi-card:after{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0));opacity:0;transition:.35s;}
.kpi-card:hover:after{opacity:1;}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.65px;opacity:.8;font-weight:600;}
.kpi-value{font-size:30px;font-weight:700;line-height:1.05;margin:4px 0 4px;}
.kpi-value.warn{color:#ffcf5c;}
.kpi-foot{font-size:11px;letter-spacing:.5px;text-transform:uppercase;opacity:.75;font-weight:500;}
.kpi-foot.warn{color:#ffb347;opacity:1;}
.kpi-foot.success{color:#8ef0b2;opacity:1;}
/* Force white text for hero KPI labels/values/footers */
.temp-hero .kpi-label, .temp-hero .kpi-value, .temp-hero .kpi-foot { color:#ffffff !important; }
/* Warn/success variants retain semantic color accents via text-shadow if needed */
.temp-hero .kpi-foot.warn { color:#ffcf5c !important; }
.temp-hero .kpi-foot.success { color:#8ef0b2 !important; }
@media (max-width:960px){.temp-hero{padding:30px 28px 32px;}.hero-title{font-size:26px;}}
@media (max-width:640px){.hero-kpis{grid-template-columns:repeat(2,1fr);} }

/* Ensure white text on maroon gradients */
.temp-hero { color:#fff; }
.temp-hero .v-btn, .temp-hero .v-icon { color:#fff !important; }

.v-data-table :deep(.v-data-table__td) {
  padding: 6px 8px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-data-table :deep(.v-data-table__th) {
  padding: 8px 8px !important;
  font-weight: 600;
  font-size: 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 2px solid rgba(0, 0, 0, 0.12);
}

.v-data-table :deep(.v-data-table-header__content) {
  font-weight: 600;
  color: #424242;
}

/* Sticky header */
.v-data-table :deep(thead) { position: sticky; top: 0; z-index: 5; box-shadow:0 1px 0 rgba(0,0,0,0.08); }

/* Row highlights */
.v-data-table :deep(.row-expiring) { background: linear-gradient(90deg, rgba(255,222,173,0.18), rgba(255,222,173,0)); }
.v-data-table :deep(.row-expiring:hover) { background: linear-gradient(90deg, rgba(255,222,173,0.32), rgba(255,222,173,0.04)); }
.v-data-table :deep(.row-incomplete) { background: linear-gradient(90deg, rgba(255,235,230,0.22), rgba(255,235,230,0)); }
.v-data-table :deep(.row-incomplete:hover) { background: linear-gradient(90deg, rgba(255,235,230,0.38), rgba(255,235,230,0.05)); }

/* Footer enhancements */
.table-footer-enhanced { background:#fafbfc; border-top:1px solid #e5e7eb; }
.summary-inline { font-size:11px; letter-spacing:.3px; opacity:.75; }
.rows-select :deep(.v-field__input) { padding:0 4px !important; }
.footer-controls { gap:4px; }

/* Accessibility utilities */
.visually-hidden-focusable {position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;}
.visually-hidden-focusable:focus {position:static;width:auto;height:auto;margin:0;padding:8px 12px;background:#8B1538;color:#fff;border-radius:6px;box-shadow:0 0 0 3px rgba(255,255,255,0.6);} 
.qf-btn:focus-visible, .filter-pill:focus-visible, .af-field select:focus-visible, .af-field input:focus-visible {outline:2px solid #8B1538; outline-offset:2px;}

/* Advanced Filter Panel */
.adv-filter-panel {background:#ffffff; border:1px solid #e5e7eb; border-radius:22px; position:relative; box-shadow:0 4px 18px -4px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04); overflow:hidden;}
.adv-filter-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f8f9fa,#eef1f4);opacity:.85;}
.adv-filter-panel > * {position:relative; z-index:2;}
.af-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#fafbfc,#f0f3f6);} 
.af-title-group{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;}
.af-title{margin:0;font-size:16px;font-weight:600;letter-spacing:.5px;}
.af-header-actions{display:flex;align-items:center;gap:4px;}
.quick-filters{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 6px;}
.qf-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border:1px solid #d5d9de;border-radius:28px;background:#fff;color:#374151;cursor:pointer;transition:.28s background,.28s color,.28s border,.28s box-shadow;position:relative;}
.qf-btn:hover{background:#f0f2f4;}
.qf-btn.active{background:linear-gradient(135deg,#8B1538,#6B0F2A);color:#fff;border-color:#8B1538;box-shadow:0 4px 14px -4px rgba(139,21,56,.55);} 
.qf-btn .v-icon{color:inherit !important;}
.qf-badge{background:#e5e7eb;color:#333;font-size:10px;font-weight:600;line-height:1; padding:3px 6px; border-radius:10px; margin-left:4px; position:relative; top:-1px;}
.qf-badge[data-severity="warn"]{background:#fff3cd;color:#924c00;}
.active-pills{padding:0 16px 2px;}
.pill-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.filter-pill{display:inline-flex;align-items:center;max-width:220px;background:#fff;border:1px solid #d9dde2;border-radius:18px;padding:4px 8px 4px 10px;font-size:11px;font-weight:500;line-height:1; box-shadow:0 2px 4px rgba(0,0,0,.05); transition:.25s background,.25s border,.25s box-shadow;}
.filter-pill:hover{background:#f7f9fa;}
.filter-pill[data-type="quick"]{background:#8B1538;color:#fff;border-color:#8B1538;} 
.filter-pill[data-type="quick"] .v-icon{color:#fff !important;}
.filter-pill .v-icon{color:#657080 !important;}
.pill-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.pill-clear{background:transparent;border:none;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;padding:2px;cursor:pointer;color:inherit;}
.pill-clear .v-icon{font-size:14px !important;}
.advanced-region{padding:12px 18px 20px;border-top:1px dashed #e2e5e9;animation:slideDown .35s ease;}
@keyframes slideDown{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.af-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:18px;}
.af-field{display:flex;flex-direction:column;gap:6px;}
.af-label{font-size:11px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#5a6472;}
.af-input-icon{position:relative;display:flex;align-items:center;gap:0;width:100%;}
.af-input-icon input,.af-input-icon select{width:100%;padding:9px 38px 9px 38px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;appearance:none;line-height:1.25;transition:.25s border,.25s box-shadow;}
.af-input-icon input:focus,.af-input-icon select:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-input-icon .v-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8B1538;pointer-events:none;}
.af-input-icon select{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);background-position:calc(100% - 20px) calc(50% - 4px),calc(100% - 15px) calc(50% - 4px);background-size:6px 6px,6px 6px;background-repeat:no-repeat;}
.af-input-icon select:focus{background-image:linear-gradient(45deg,transparent 50%, #8B1538 50%),linear-gradient(135deg,#8B1538 50%,transparent 50%);}
.af-input-icon.no-icon select{padding-left:12px;}
.clear-mini{position:absolute;right:6px;border:none;background:transparent;padding:2px;cursor:pointer;color:#6b7280;}
.clear-mini .v-icon{font-size:14px !important;color:#6b7280 !important;}
.af-input-icon input#emp-search{padding-left:40px;}
.af-input-icon button.clear-mini{top:50%;transform:translateY(-50%);} 
.af-field select, .af-field input[type=number], .af-field input[type=text]{padding:8px 12px;font-size:13px;border:1px solid #cfd4da;border-radius:10px;background:#fff;transition:.25s;border:.25s box-shadow;}
.af-field select:focus, .af-field input[type=number]:focus, .af-field input[type=text]:focus{outline:none;border-color:#8B1538;box-shadow:0 0 0 3px rgba(139,21,56,.15);}
.af-toggle{display:flex;align-items:flex-start;justify-content:space-between;}
.af-toggle .v-switch{margin-top:2px;}
.pill-fade-enter-active,.pill-fade-leave-active{transition:all .25s ease;}
.pill-fade-enter-from{opacity:0;transform:translateY(-4px);} 
.pill-fade-leave-to{opacity:0;transform:translateY(-4px);} 
@media (max-width:780px){.af-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}}
@media (max-width:640px){.af-header{flex-wrap:wrap;gap:10px;}.quick-filters{padding-top:10px;}}

/* Hero KPI Styles */
.temp-hero {display:flex; flex-wrap:wrap; gap:30px; background:linear-gradient(135deg,#8B1538 0%,#6B0F2A 55%,#5a0d24 100%); padding:34px 40px 36px; border-radius:26px; position:relative; overflow:hidden;}
.temp-hero:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(255,255,255,0.25),transparent 60%);pointer-events:none;}
.hero-intro{flex:1 1 320px; min-width:260px; max-width:480px;}
.hero-title{margin:0 0 10px;font-size:30px;font-weight:700;letter-spacing:.5px;color:#fff;}
.hero-sub{margin:0 0 18px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);}
.hero-actions{display:flex;gap:8px;flex-wrap:wrap;}
.hero-kpis{flex:1 1 460px;min-width:340px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.kpi-card{background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:18px;padding:14px 16px 16px;position:relative;color:#fff;overflow:hidden;display:flex;flex-direction:column;transition:.35s transform,.35s box-shadow;}
.kpi-card:hover{transform:translateY(-3px); box-shadow:0 6px 24px -8px rgba(0,0,0,0.35);} 
.kpi-card:after{content:'';position:absolute;inset:0;background:linear-gradient(145deg,rgba(255,255,255,0.22),rgba(255,255,255,0));opacity:0;transition:.35s;}
.kpi-card:hover:after{opacity:1;}
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.65px;opacity:.8;font-weight:600;}
.input-icon {
  position: absolute;
  left: 16px;
  color: #6b7280;
  z-index: 1;
}

.clear-btn {
  position: absolute !important;
  right: 8px;
  color: #6b7280 !important;
}

/* Custom Select Styles */
.custom-select-wrapper {
  position: relative;
}

.custom-select {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
}

.custom-select:focus {
  outline: none;
  border-color: #8B1538;
  box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.1);
}

.select-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
}

/* Custom Action Buttons */
/* Remove old custom-filter-section rules (replaced by adv-filter-panel) */
</style>