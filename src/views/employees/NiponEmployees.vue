<template>
  <v-container fluid class="pa-4">
    <!-- Header Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">Nipon Sponsored Employees</h1>
            <p class="text-body-1 text-medium-emphasis">
              Manage employees under Nipon sponsorship with comprehensive visa and document tracking
            </p>
          </div>
          <v-btn
            color="primary"
            size="large"
            :prepend-icon="'mdi-plus'"
            @click="addEmployee"
            elevation="2"
          >
            Add Sponsored Employee
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="48" class="mr-4">
              <v-icon color="white">mdi-office-building</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ niponEmployees.length }}</div>
              <div class="text-body-2 text-medium-emphasis">Total Sponsored</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="success" size="48" class="mr-4">
              <v-icon color="white">mdi-passport</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ activeVisas }}</div>
              <div class="text-body-2 text-medium-emphasis">Active Visas</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="warning" size="48" class="mr-4">
              <v-icon color="white">mdi-clock-alert</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ expiringVisas }}</div>
              <div class="text-body-2 text-medium-emphasis">Expiring Soon</div>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" variant="elevated" elevation="2">
          <div class="d-flex align-center">
            <v-avatar color="info" size="48" class="mr-4">
              <v-icon color="white">mdi-card-account-details</v-icon>
            </v-avatar>
            <div>
              <div class="text-h4 font-weight-bold">{{ completeProfiles }}</div>
              <div class="text-body-2 text-medium-emphasis">Complete Profiles</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters and Search -->
    <v-card class="mb-6" variant="outlined">
      <v-card-text class="pb-2">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Search employees..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="departmentFilter"
              label="Department"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              placeholder="Filter by department"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="visaStatusFilter"
              :items="visaStatuses"
              label="Visa Status"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="outlined"
              block
              @click="exportEmployees"
              :prepend-icon="'mdi-download'"
            >
              Export
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Employee Table -->
    <v-card variant="outlined">
      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="filteredEmployees"
        :loading="loading"
        :search="searchQuery"
        class="elevation-0"
        density="comfortable"
        item-value="id"
        hide-default-footer
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

        <!-- Visa Status -->
        <template v-slot:item.visaStatus="{ item }">
          <v-chip
            :color="getVisaStatusColor(item.visaStatus)"
            variant="tonal"
            size="x-small"
            density="compact"
          >
            {{ item.visaStatus }}
          </v-chip>
        </template>

        <!-- Visa Expiry -->
        <template v-slot:item.visaExpiry="{ item }">
          <div class="text-caption">
            {{ formatDate(item.visaExpiry) }}
            <v-icon
              v-if="isVisaExpiringSoon(item.visaExpiry)"
              color="warning"
              size="x-small"
              class="ml-1"
            >
              mdi-alert
            </v-icon>
          </div>
        </template>

        <!-- Salary -->
        <template v-slot:item.salary="{ item }">
          <span class="text-caption font-weight-medium">{{ formatCurrency(item.salary) }}</span>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="tonal"
            size="x-small"
            density="compact"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex align-center">
            <v-btn
              icon="fa:fas fa-eye"
              variant="text"
              size="x-small"
              density="compact"
              color="primary"
              class="action-btn"
              @click.stop="viewEmployee(item)"
              title="View Employee"
            />
            <v-btn
              icon="fa:fas fa-edit"
              variant="text"
              size="x-small"
              density="compact"
              color="primary"
              class="action-btn"
              @click.stop="editEmployee(item)"
              title="Edit Employee"
            />
            <v-btn
              icon="fa:fas fa-file-alt"
              variant="text"
              size="x-small"
              density="compact"
              color="primary"
              class="action-btn"
              @click.stop="viewDocuments(item)"
              title="View Documents"
            />
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
      <div class="d-flex align-center justify-space-between pa-3">
        <div class="text-body-2 text-medium-emphasis">
          Showing {{ filteredEmployees.length }} of {{ niponEmployees.length }} employees
        </div>
        <div class="d-flex align-center">
          <v-select
            v-model="itemsPerPage"
            :items="[10, 25, 50, 100]"
            label="Rows per page"
            variant="outlined"
            density="compact"
            hide-details
            class="mr-4"
            style="width: 120px;"
          />
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(filteredEmployees.length / itemsPerPage)"
            :total-visible="5"
            size="small"
            density="compact"
          />
        </div>
      </div>
    </v-card>

    <!-- Employee Detail Dialog -->
    <v-dialog v-model="showDetailDialog" max-width="900px" scrollable>
      <v-card v-if="selectedEmployee" class="employee-detail-dialog">
        <!-- Header -->
        <v-card-title class="px-4 py-3 bg-primary">
          <div class="d-flex align-center justify-space-between w-100">
            <div class="d-flex align-center text-white">
              <v-avatar
                :image="`https://i.pravatar.cc/80?u=${selectedEmployee.email}`"
                size="48"
                class="mr-3"
              />
              <div>
                <div class="text-h6 font-weight-bold">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</div>
                <div class="text-body-2 opacity-90">{{ selectedEmployee.position }}</div>
                <div class="d-flex align-center mt-1">
                  <v-chip
                    :color="getStatusColor(selectedEmployee.status)"
                    variant="elevated"
                    size="x-small"
                    density="compact"
                    class="mr-2"
                  >
                    {{ selectedEmployee.status }}
                  </v-chip>
                  <v-chip
                    color="white"
                    variant="outlined"
                    size="x-small"
                    density="compact"
                    text-color="white"
                  >
                    {{ selectedEmployee.employeeId }}
                  </v-chip>
                </div>
              </div>
            </div>
            <v-btn 
              icon="mdi-close" 
              variant="text" 
              color="white"
              size="small"
              density="compact"
              @click="showDetailDialog = false" 
            />
          </div>
        </v-card-title>

        <!-- Content Tabs -->
        <v-card-text class="pa-0">
          <v-tabs v-model="activeTab" color="primary" align-tabs="start" density="compact">
            <v-tab value="overview" class="text-none">
              <v-icon class="mr-1" size="small">mdi-account-details</v-icon>
              <span class="text-caption">Overview</span>
            </v-tab>
            <v-tab value="employment" class="text-none">
              <v-icon class="mr-1" size="small">mdi-briefcase</v-icon>
              <span class="text-caption">Employment</span>
            </v-tab>
            <v-tab value="documents" class="text-none">
              <v-icon class="mr-1" size="small">mdi-file-document-multiple</v-icon>
              <span class="text-caption">Documents</span>
            </v-tab>
            <v-tab value="banking" class="text-none">
              <v-icon class="mr-1" size="small">mdi-bank</v-icon>
              <span class="text-caption">Banking</span>
            </v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="activeTab" class="pa-4">
            <!-- Overview Tab -->
            <v-window-item value="overview">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact" class="h-100">
                    <v-card-title class="text-subtitle-2 py-2 bg-grey-lighten-5">
                      <v-icon class="mr-1" color="primary" size="small">mdi-account</v-icon>
                      Personal Information
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <v-row dense>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Full Name</div>
                          <div class="text-body-2 font-weight-medium">{{ selectedEmployee.firstName }} {{ selectedEmployee.lastName }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Email</div>
                          <div class="text-body-2">{{ selectedEmployee.email }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Phone</div>
                          <div class="text-body-2">{{ selectedEmployee.phoneNumber || 'Not provided' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Date of Birth</div>
                          <div class="text-body-2">{{ formatDate(selectedEmployee.dateOfBirth) || 'Not provided' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Nationality</div>
                          <div class="text-body-2">{{ selectedEmployee.nationality || 'Not provided' }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Qatar ID</div>
                          <div class="text-body-2">{{ selectedEmployee.qatarId || 'Not provided' }}</div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact" class="h-100">
                    <v-card-title class="text-subtitle-2 py-2 bg-grey-lighten-5">
                      <v-icon class="mr-1" color="primary" size="small">mdi-passport</v-icon>
                      Visa & Sponsorship
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <v-row dense>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Sponsor</div>
                          <div class="text-body-2 font-weight-medium">Nipon Engineering</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Work Permit</div>
                          <v-chip color="success" variant="tonal" size="x-small" density="compact">Valid</v-chip>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Visa Status</div>
                          <v-chip
                            :color="getVisaStatusColor(selectedEmployee.visaStatus)"
                            variant="tonal"
                            size="x-small"
                            density="compact"
                          >
                            {{ selectedEmployee.visaStatus }}
                          </v-chip>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Visa Expiry</div>
                          <div class="text-body-2">
                            {{ formatDate(selectedEmployee.visaExpiry) }}
                            <v-chip
                              v-if="isVisaExpiringSoon(selectedEmployee.visaExpiry)"
                              color="warning"
                              variant="text"
                              size="x-small"
                              density="compact"
                              class="ml-1"
                            >
                              Expiring
                            </v-chip>
                          </div>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Employment Tab -->
            <v-window-item value="employment">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="text-subtitle-2 py-2 bg-grey-lighten-5">
                      <v-icon class="mr-1" color="primary" size="small">mdi-briefcase</v-icon>
                      Employment Details
                    </v-card-title>
                    <v-card-text class="pa-3">
                      <v-row dense>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Employee ID</div>
                          <div class="text-body-2 font-weight-medium">{{ selectedEmployee.employeeId }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Department</div>
                          <v-chip color="blue" variant="tonal" size="x-small" density="compact">{{ selectedEmployee.department }}</v-chip>
                        </v-col>
                        <v-col cols="12">
                          <div class="text-caption text-medium-emphasis mb-1">Position</div>
                          <div class="text-body-2">{{ selectedEmployee.position }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Join Date</div>
                          <div class="text-body-2">{{ formatDate(selectedEmployee.joinDate) }}</div>
                        </v-col>
                        <v-col cols="6">
                          <div class="text-caption text-medium-emphasis mb-1">Status</div>
                          <v-chip
                            :color="getStatusColor(selectedEmployee.status)"
                            variant="tonal"
                            size="x-small"
                            density="compact"
                          >
                            {{ selectedEmployee.status }}
                          </v-chip>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined" density="compact">
                    <v-card-title class="text-subtitle-2 py-2 bg-grey-lighten-5">
                      <v-icon class="mr-1" color="green" size="small">mdi-cash</v-icon>
                      Compensation
                    </v-card-title>
                    <v-card-text class="pa-3 text-center">
                      <div class="text-caption text-medium-emphasis mb-1">Monthly Salary</div>
                      <div class="text-h6 font-weight-bold text-green">{{ formatCurrency(selectedEmployee.salary) }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Documents Tab -->
            <v-window-item value="documents">
              <v-card variant="outlined" density="compact">
                <v-card-title class="text-subtitle-2 py-2 bg-grey-lighten-5">
                  <v-icon class="mr-1" color="primary" size="small">mdi-file-document</v-icon>
                  Identity Documents
                </v-card-title>
                <v-card-text class="pa-0">
                  <v-list density="compact">
                    <v-list-item density="compact">
                      <template v-slot:prepend>
                        <v-icon color="blue" size="small">mdi-card-account-details</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">Qatar ID Document</v-list-item-title>
                      <template v-slot:append>
                        <v-btn
                          v-if="selectedEmployee.qatarIdDocument"
                          variant="outlined"
                          size="x-small"
                          density="compact"
                          color="primary"
                          @click="viewDocument(selectedEmployee.qatarIdDocument)"
                        >
                          View
                        </v-btn>
                        <v-chip v-else color="grey" variant="outlined" size="x-small" density="compact">
                          Not uploaded
                        </v-chip>
                      </template>
                    </v-list-item>
                    
                    <v-list-item density="compact">
                      <template v-slot:prepend>
                        <v-icon color="green" size="small">mdi-passport</v-icon>
                      </template>
                      <v-list-item-title class="text-body-2">Passport Document</v-list-item-title>
                      <template v-slot:append>
                        <v-btn
                          v-if="selectedEmployee.passportDocument"
                          variant="outlined"
                          size="x-small"
                          density="compact"
                          color="primary"
                          @click="viewDocument(selectedEmployee.passportDocument)"
                        >
                          View
                        </v-btn>
                        <v-chip v-else color="grey" variant="outlined" size="x-small" density="compact">
                          Not uploaded
                        </v-chip>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-window-item>

            <!-- Banking Tab -->
            <v-window-item value="banking">
              <v-card variant="outlined" density="compact">
                <v-card-title class="text-subtitle-2 py-2 bg-grey-lighten-5">
                  <v-icon class="mr-1" color="primary" size="small">mdi-bank</v-icon>
                  Banking Information
                </v-card-title>
                <v-card-text class="pa-3">
                  <v-row dense>
                    <v-col cols="12">
                      <div class="text-caption text-medium-emphasis mb-1">Bank Name</div>
                      <div class="text-body-2 font-weight-medium">{{ selectedEmployee.bankName || 'Not provided' }}</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-medium-emphasis mb-1">Account Number</div>
                      <div class="text-body-2">{{ selectedEmployee.accountNumber || 'Not provided' }}</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-medium-emphasis mb-1">IBAN</div>
                      <div class="text-body-2">{{ selectedEmployee.iban || 'Not provided' }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-window-item>
          </v-window>
        </v-card-text>

        <!-- Footer Actions -->
        <v-divider />
        <v-card-actions class="pa-3">
          <v-spacer />
          <v-btn 
            variant="outlined" 
            size="small"
            density="compact"
            @click="showDetailDialog = false"
            class="mr-2"
          >
            Close
          </v-btn>
          <v-btn 
            color="primary" 
            size="small"
            density="compact"
            @click="editEmployee(selectedEmployee)"
            class="mr-2"
          >
            Edit
          </v-btn>
          <v-btn 
            color="blue" 
            variant="outlined"
            size="small"
            density="compact"
            @click="viewDocuments(selectedEmployee)"
          >
            Documents
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Employee Dialog -->
    <v-dialog v-model="showEditDialog" max-width="800px" scrollable>
      <v-card class="employee-edit-dialog">
        <v-card-title class="text-white">
          <v-icon left class="mr-2">fa:fas fa-user-edit</v-icon>
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
            <v-icon left>fa:fas fa-save</v-icon>
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Documents Dialog -->
    <v-dialog v-model="showDocumentsDialog" max-width="900px" scrollable>
      <v-card class="employee-documents-dialog">
        <v-card-title class="text-white">
          <v-icon left class="mr-2">fa:fas fa-file-alt</v-icon>
          Employee Documents - {{ selectedEmployee?.firstName }} {{ selectedEmployee?.lastName }}
        </v-card-title>
        
        <v-card-text class="pt-6">
          <v-row>
            <!-- Qatar ID Document -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-1 d-flex align-center">
                  <v-icon class="mr-2 text-primary">fa:fas fa-id-card</v-icon>
                  Qatar ID
                </v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <strong>Qatar ID:</strong> {{ selectedEmployee?.qatarId }}
                  </div>
                  <div class="mb-3" v-if="selectedEmployee?.qatarIdDocument">
                    <v-chip color="success" size="small">
                      <v-icon left size="small">fa:fas fa-check</v-icon>
                      Document Available
                    </v-chip>
                  </div>
                  <div class="mb-3" v-else>
                    <v-chip color="warning" size="small">
                      <v-icon left size="small">fa:fas fa-exclamation</v-icon>
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
                    <v-icon left>fa:fas fa-eye</v-icon>
                    View
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="uploadDocument('qatarId')"
                  >
                    <v-icon left>fa:fas fa-upload</v-icon>
                    {{ selectedEmployee?.qatarIdDocument ? 'Replace' : 'Upload' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Passport Document -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-1 d-flex align-center">
                  <v-icon class="mr-2 text-primary">fa:fas fa-passport</v-icon>
                  Passport
                </v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <strong>Passport No:</strong> {{ selectedEmployee?.passportNumber }}
                  </div>
                  <div class="mb-3" v-if="selectedEmployee?.passportDocument">
                    <v-chip color="success" size="small">
                      <v-icon left size="small">fa:fas fa-check</v-icon>
                      Document Available
                    </v-chip>
                  </div>
                  <div class="mb-3" v-else>
                    <v-chip color="warning" size="small">
                      <v-icon left size="small">fa:fas fa-exclamation</v-icon>
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
                    <v-icon left>fa:fas fa-eye</v-icon>
                    View
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="uploadDocument('passport')"
                  >
                    <v-icon left>fa:fas fa-upload</v-icon>
                    {{ selectedEmployee?.passportDocument ? 'Replace' : 'Upload' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Visa Document -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-1 d-flex align-center">
                  <v-icon class="mr-2 text-primary">fa:fas fa-stamp</v-icon>
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
                        {{ isVisaExpiringSoon(selectedEmployee?.visaExpiry) ? 'fa:fas fa-exclamation' : 'fa:fas fa-check' }}
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
                    <v-icon left>fa:fas fa-upload</v-icon>
                    Upload Visa
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>

            <!-- Contract Document -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="h-100">
                <v-card-title class="text-subtitle-1 d-flex align-center">
                  <v-icon class="mr-2 text-primary">fa:fas fa-file-contract</v-icon>
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
                    <v-icon left>fa:fas fa-file-contract</v-icon>
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
            <v-icon left>fa:fas fa-download</v-icon>
            Download All
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Reactive state
const loading = ref(false)
const searchQuery = ref('')
const departmentFilter = ref('')
const visaStatusFilter = ref('')
const itemsPerPage = ref(10)
const currentPage = ref(1)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const showDocumentsDialog = ref(false)
const selectedEmployee = ref<any>(null)
const activeTab = ref('overview')

// Sample data for Nipon sponsored employees
const niponEmployees = ref([
  {
    id: 1,
    employeeId: 'NIP001',
    firstName: 'Ahmed',
    lastName: 'Al-Rashid',
    email: 'ahmed.rashid@nipon.qa',
    phoneNumber: '+974 5555 1234',
    department: 'Engineering',
    position: 'Senior Civil Engineer',
    joinDate: '2023-01-15',
    salary: 18000,
    status: 'Active',
    visaStatus: 'Valid',
    visaExpiry: '2025-01-15',
    dateOfBirth: '1985-03-20',
    nationality: 'Egyptian',
    qatarId: '12345678901',
    passportNumber: 'EG1234567',
    bankName: 'Qatar National Bank',
    accountNumber: '1234567890',
    iban: 'QA58QNBA000000000000693123456',
    qatarIdDocument: 'qatar-id-001.pdf',
    passportDocument: 'passport-001.pdf'
  },
  {
    id: 2,
    employeeId: 'NIP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@nipon.qa',
    phoneNumber: '+974 5555 5678',
    department: 'Project Management',
    position: 'Project Manager',
    joinDate: '2022-08-20',
    salary: 22000,
    status: 'Active',
    visaStatus: 'Valid',
    visaExpiry: '2024-08-20',
    dateOfBirth: '1988-07-12',
    nationality: 'British',
    qatarId: '23456789012',
    passportNumber: 'GB9876543',
    bankName: 'Commercial Bank of Qatar',
    accountNumber: '2345678901',
    iban: 'QA54CBQA000000000000456789123',
    qatarIdDocument: 'qatar-id-002.pdf',
    passportDocument: 'passport-002.pdf'
  },
  {
    id: 3,
    employeeId: 'NIP003',
    firstName: 'Mohammad',
    lastName: 'Hassan',
    email: 'mohammad.hassan@nipon.qa',
    phoneNumber: '+974 5555 9012',
    department: 'Operations',
    position: 'Operations Supervisor',
    joinDate: '2023-05-10',
    salary: 15000,
    status: 'Active',
    visaStatus: 'Renewal Required',
    visaExpiry: '2024-01-10',
    dateOfBirth: '1982-11-30',
    nationality: 'Pakistani',
    qatarId: '34567890123',
    passportNumber: 'PK1357924',
    bankName: 'Doha Bank',
    accountNumber: '3456789012',
    iban: 'QA76DOHB00001234567890123456',
    qatarIdDocument: 'qatar-id-003.pdf',
    passportDocument: null
  }
])

// Table headers
const headers = [
  { title: 'Employee', key: 'employee', sortable: false, width: '200px' },
  { title: 'ID', key: 'employeeId', width: '80px' },
  { title: 'Department', key: 'department', width: '120px' },
  { title: 'Position', key: 'position', width: '140px' },
  { title: 'Visa Status', key: 'visaStatus', width: '110px' },
  { title: 'Visa Expiry', key: 'visaExpiry', width: '120px' },
  { title: 'Salary', key: 'salary', width: '100px' },
  { title: 'Status', key: 'status', width: '80px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
]

// Filter options
const visaStatuses = ['Valid', 'Expiring Soon', 'Renewal Required', 'Processing']

// Computed properties
const filteredEmployees = computed(() => {
  let filtered = niponEmployees.value

  if (departmentFilter.value) {
    filtered = filtered.filter(emp => 
      emp.department.toLowerCase().includes(departmentFilter.value.toLowerCase())
    )
  }

  if (visaStatusFilter.value) {
    filtered = filtered.filter(emp => emp.visaStatus === visaStatusFilter.value)
  }

  return filtered
})

const activeVisas = computed(() => 
  niponEmployees.value.filter(emp => emp.visaStatus === 'Valid').length
)

const expiringVisas = computed(() => 
  niponEmployees.value.filter(emp => isVisaExpiringSoon(emp.visaExpiry)).length
)

const completeProfiles = computed(() => 
  niponEmployees.value.filter(emp => 
    emp.qatarIdDocument && emp.passportDocument && emp.bankName && emp.accountNumber
  ).length
)

// Methods
const addEmployee = () => {
  router.push('/employees/create?type=nipon')
}

const viewEmployee = (employee: any) => {
  selectedEmployee.value = employee
  showDetailDialog.value = true
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
    alert(`Opening document: ${documentPath}\n\nIn a real application, this would open the document in a new tab or modal viewer.`)
  } else {
    alert('No document available to view.')
  }
}

const exportEmployees = () => {
  try {
    // Create CSV content for sponsored employees
    const headers = ['Employee ID', 'Full Name', 'Position', 'Department', 'Join Date', 'Basic Salary', 'Status', 'Visa Status', 'Qatar ID', 'Passport Number']
    const csvContent = [
      headers.join(','),
      ...sponsoredEmployees.value.map(emp => [
        emp.employeeId,
        `"${emp.firstName} ${emp.lastName}"`,
        emp.position,
        emp.department,
        emp.joinDate,
        emp.basicSalary,
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
    
    alert('Sponsored employees data exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export data. Please try again.')
  }
}

// New dialog functions
const saveEmployeeChanges = () => {
  try {
    if (selectedEmployee.value) {
      // Find and update the employee in the list
      const index = sponsoredEmployees.value.findIndex(emp => emp.employeeId === selectedEmployee.value.employeeId)
      if (index !== -1) {
        sponsoredEmployees.value[index] = { ...selectedEmployee.value }
      }
      
      showEditDialog.value = false
      alert(`Employee information updated successfully for ${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}!`)
    }
  } catch (error) {
    console.error('Save failed:', error)
    alert('Failed to save employee changes. Please try again.')
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
            
            alert(`${documentType} document uploaded successfully!`)
          }
        }, 1000)
      }
    }
    
    input.click()
  } catch (error) {
    console.error('Upload failed:', error)
    alert('Failed to upload document. Please try again.')
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
Basic Salary: QAR ${selectedEmployee.value.basicSalary.toLocaleString()}
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
      
      alert(`Employment contract generated for ${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}!`)
    } catch (error) {
      console.error('Contract generation failed:', error)
      alert('Failed to generate contract. Please try again.')
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
      
      alert(`Document package downloaded for ${selectedEmployee.value.firstName} ${selectedEmployee.value.lastName}!`)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download documents. Please try again.')
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

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: rgba(25, 118, 210, 0.04);
}

.employee-detail-dialog .v-card-title {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.employee-detail-dialog .v-window-item {
  min-height: 400px;
}

.employee-detail-dialog .v-tabs {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.employee-detail-dialog .v-tab {
  font-weight: 500;
  text-transform: none;
}

.action-btn {
  border-radius: 50% !important;
  transition: all 0.2s ease-in-out !important;
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.04) !important;
  transform: scale(1.1) !important;
}

.employee-detail-dialog .v-card {
  border-radius: 8px;
}

.employee-detail-dialog .v-card-title {
  border-radius: 8px 8px 0 0;
}
</style>