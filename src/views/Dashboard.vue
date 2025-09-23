<template>
  <v-container fluid class="pa-6">
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between flex-wrap">
          <div>
            <h1 class="text-h4 font-weight-bold text-grey-darken-3">
              Dashboard Overview
            </h1>
            <p class="text-body-1 text-grey-darken-1 mt-1">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              color="white"
              variant="elevated"
              prepend-icon="mdi-calendar"
              class="text-grey-darken-2"
            >
              {{ currentDate }}
            </v-btn>
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-download"
              class="btn-gradient"
            >
              Export Report
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="2" class="card-gradient">
          <v-card-title class="text-h6 font-weight-medium text-grey-darken-3">
            <v-icon left color="primary" class="mr-2">mdi-lightning-bolt</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="action in quickActions"
                :key="action.title"
                cols="6"
                sm="4"
                md="3"
                lg="2"
              >
                <v-btn
                  block
                  variant="outlined"
                  :color="action.color"
                  class="py-6"
                  @click="action.action"
                >
                  <div class="text-center">
                    <v-icon size="32" class="mb-2">{{ action.icon }}</v-icon>
                    <div class="text-caption">{{ action.title }}</div>
                  </div>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'

const currentDate = computed(() => format(new Date(), 'EEEE, MMMM d, yyyy'))

const stats = ref([
  {
    title: 'Total Employees',
    value: '156',
    trend: 5.2,
    icon: 'mdi-account-group',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: 'Monthly Payroll',
    value: 'QAR 450K',
    trend: 3.8,
    icon: 'mdi-cash-multiple',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: 'Documents Expiring',
    value: '12',
    trend: -15,
    icon: 'mdi-file-alert',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    title: 'Active Contracts',
    value: '24',
    trend: 8.3,
    icon: 'mdi-file-document-check',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
])

const quickActions = ref([
  {
    title: 'Add Employee',
    icon: 'mdi-account-plus',
    color: 'primary',
    action: () => console.log('Add employee')
  },
  {
    title: 'Process Payroll',
    icon: 'mdi-cash-sync',
    color: 'success',
    action: () => console.log('Process payroll')
  },
  {
    title: 'Generate Report',
    icon: 'mdi-file-chart',
    color: 'info',
    action: () => console.log('Generate report')
  },
  {
    title: 'Upload Document',
    icon: 'mdi-file-upload',
    color: 'warning',
    action: () => console.log('Upload document')
  },
  {
    title: 'Create Invoice',
    icon: 'mdi-receipt',
    color: 'secondary',
    action: () => console.log('Create invoice')
  },
  {
    title: 'View Calendar',
    icon: 'mdi-calendar',
    color: 'accent',
    action: () => console.log('View calendar')
  }
])
</script>
