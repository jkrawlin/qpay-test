<template>
  <div class="enhanced-icon-showcase">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h1 class="text-h3 mb-6 text-center">🎨 Enhanced Icon Showcase</h1>
          <p class="text-center text-subtitle-1 mb-8">Demonstrating the new icon libraries in your Nipon Payroll Pro app</p>
        </v-col>
      </v-row>

      <!-- Iconify Examples -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="text-h4 mb-4">Iconify Icons (130,000+ available)</h2>
          <v-card class="pa-4">
            <v-row>
              <v-col cols="12" md="3" class="text-center">
                <Icon icon="material-symbols:payments" :width="48" :height="48" color="primary" />
                <p class="mt-2">Payments</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <Icon icon="material-symbols:group" :width="48" :height="48" color="success" />
                <p class="mt-2">Group</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <Icon icon="material-symbols:analytics" :width="48" :height="48" color="info" />
                <p class="mt-2">Analytics</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <Icon icon="material-symbols:schedule" :width="48" :height="48" color="warning" />
                <p class="mt-2">Schedule</p>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Lucide Icons Examples -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="text-h4 mb-4">Lucide Icons (Beautiful & Consistent)</h2>
          <v-card class="pa-4">
            <v-row>
              <v-col cols="12" md="3" class="text-center">
                <LucideUsers :size="48" color="rgb(25, 118, 210)" />
                <p class="mt-2">Users</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <LucideDollarSign :size="48" color="rgb(76, 175, 80)" />
                <p class="mt-2">Dollar Sign</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <LucideCalendar :size="48" color="rgb(33, 150, 243)" />
                <p class="mt-2">Calendar</p>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <LucideTrendingUp :size="48" color="rgb(255, 193, 7)" />
                <p class="mt-2">Trending Up</p>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Action Icons -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="text-h4 mb-4">Action Icons with Buttons</h2>
          <v-card class="pa-4">
            <v-row>
              <v-col cols="12" md="3">
                <v-btn color="primary" block>
                  <LucideEye :size="20" class="mr-2" />
                  View Details
                </v-btn>
              </v-col>
              <v-col cols="12" md="3">
                <v-btn color="success" block>
                  <LucideEdit3 :size="20" class="mr-2" />
                  Edit
                </v-btn>
              </v-col>
              <v-col cols="12" md="3">
                <v-btn color="error" block>
                  <LucideTrash2 :size="20" class="mr-2" />
                  Delete
                </v-btn>
              </v-col>
              <v-col cols="12" md="3">
                <v-btn color="info" block>
                  <LucideDownload :size="20" class="mr-2" />
                  Export
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Status Icons -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="text-h4 mb-4">Status & Alert Icons</h2>
          <v-card class="pa-4">
            <v-row>
              <v-col cols="12" md="3" class="text-center">
                <v-chip color="success" variant="tonal" size="large">
                  <LucideCheckCircle :size="20" class="mr-2" />
                  Success
                </v-chip>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <v-chip color="warning" variant="tonal" size="large">
                  <LucideAlertTriangle :size="20" class="mr-2" />
                  Warning
                </v-chip>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <v-chip color="error" variant="tonal" size="large">
                  <LucideAlertCircle :size="20" class="mr-2" />
                  Error
                </v-chip>
              </v-col>
              <v-col cols="12" md="3" class="text-center">
                <v-chip color="info" variant="tonal" size="large">
                  <LucideInfo :size="20" class="mr-2" />
                  Info
                </v-chip>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Form Icons -->
      <v-row class="mb-8">
        <v-col cols="12">
          <h2 class="text-h4 mb-4">Form Field Icons</h2>
          <v-card class="pa-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Search Employees"
                  variant="outlined"
                  density="compact"
                >
                  <template #prepend-inner>
                    <LucideSearch :size="20" />
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Phone Number"
                  variant="outlined"
                  density="compact"
                >
                  <template #prepend-inner>
                    <LucidePhone :size="20" />
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Email Address"
                  variant="outlined"
                  density="compact"
                >
                  <template #prepend-inner>
                    <LucideMail :size="20" />
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  label="Location"
                  variant="outlined"
                  density="compact"
                >
                  <template #prepend-inner>
                    <LucideMapPin :size="20" />
                  </template>
                </v-text-field>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Code Examples -->
      <v-row>
        <v-col cols="12">
          <h2 class="text-h4 mb-4">Usage Examples</h2>
          <v-card class="pa-4">
            <v-code class="language-vue">
{{ `<!-- Iconify Icon -->
<Icon icon="material-symbols:payments" :width="24" :height="24" color="primary" />

<!-- Lucide Icon -->
<LucideUsers :size="24" color="rgb(25, 118, 210)" />

<!-- In Button -->
<v-btn color="primary">
  <LucideEye :size="20" class="mr-2" />
  View Details
</v-btn>

<!-- In Text Field -->
<v-text-field label="Search">
  <template #prepend-inner>
    <LucideSearch :size="20" />
  </template>
</v-text-field>` }}
            </v-code>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// This component demonstrates the enhanced icons
// No additional logic needed as icons are globally registered
</script>

<style scoped>
.enhanced-icon-showcase {
  padding: 20px;
}

.v-code {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  overflow-x: auto;
}
</style>