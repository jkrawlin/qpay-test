<template>
  <v-card
    :elevation="elevation"
    :variant="variant"
    :color="color"
    :class="cardClasses"
    v-bind="$attrs"
  >
    <!-- Header Section -->
    <v-card-title 
      v-if="title || subtitle || $slots.title || $slots.actions"
      class="enhanced-card-header"
      :class="{ 'pb-2': !subtitle && !$slots.subtitle }"
    >
      <div class="d-flex align-center justify-space-between w-100">
        <div class="enhanced-card-title-section">
          <!-- Icon -->
          <v-avatar
            v-if="icon"
            :color="iconColor || 'primary'"
            :size="iconSize"
            class="mr-3"
          >
            <Icon :icon="icon" :width="iconWidth" :height="iconHeight" />
          </v-avatar>

          <!-- Title Content -->
          <div>
            <slot name="title">
              <h3 class="text-h6 font-weight-medium mb-0">
                {{ title }}
              </h3>
            </slot>
            
            <slot name="subtitle">
              <p v-if="subtitle" class="text-caption text-grey-darken-1 mb-0 mt-1">
                {{ subtitle }}
              </p>
            </slot>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="$slots.actions" class="enhanced-card-actions">
          <slot name="actions" />
        </div>
      </div>
    </v-card-title>

    <!-- Loading State -->
    <div v-if="loading" class="enhanced-card-loading">
      <v-progress-linear
        :indeterminate="!progress"
        :model-value="progress"
        :color="loadingColor"
        height="4"
      />
      <div class="pa-6 text-center">
        <v-progress-circular
          v-if="!progress"
          :color="loadingColor"
          indeterminate
          :size="32"
        />
        <div class="text-subtitle-2 mt-3 text-grey-darken-1">
          {{ loadingMessage || 'Loading...' }}
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="enhanced-card-error pa-6 text-center">
      <v-icon color="error" size="48" class="mb-3">
        mdi-alert-circle-outline
      </v-icon>
      <div class="text-subtitle-1 font-weight-medium mb-2">
        {{ errorTitle || 'Something went wrong' }}
      </div>
      <div class="text-body-2 text-grey-darken-1 mb-4">
        {{ errorMessage || 'Please try again later' }}
      </div>
      <v-btn
        v-if="showRetry"
        color="primary"
        variant="outlined"
        @click="$emit('retry')"
      >
        <Icon icon="material-symbols:refresh" class="mr-2" />
        Retry
      </v-btn>
    </div>

    <!-- Empty State -->
    <div v-else-if="empty" class="enhanced-card-empty pa-6 text-center">
      <v-icon :color="emptyIconColor" :size="emptyIconSize" class="mb-3">
        {{ emptyIcon }}
      </v-icon>
      <div class="text-subtitle-1 font-weight-medium mb-2">
        {{ emptyTitle || 'No data available' }}
      </div>
      <div class="text-body-2 text-grey-darken-1 mb-4">
        {{ emptyMessage || 'There is no data to display' }}
      </div>
      <slot name="empty-actions" />
    </div>

    <!-- Content -->
    <div v-else-if="$slots.default" :class="contentClasses">
      <slot />
    </div>

    <!-- Footer -->
    <v-card-actions v-if="$slots.footer" class="enhanced-card-footer">
      <slot name="footer" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  icon?: string
  iconColor?: string
  iconSize?: number
  iconWidth?: number
  iconHeight?: number
  loading?: boolean
  loadingMessage?: string
  loadingColor?: string
  progress?: number
  error?: boolean
  errorTitle?: string
  errorMessage?: string
  showRetry?: boolean
  empty?: boolean
  emptyTitle?: string
  emptyMessage?: string
  emptyIcon?: string
  emptyIconColor?: string
  emptyIconSize?: number
  elevation?: number | string
  variant?: 'elevated' | 'flat' | 'tonal' | 'outlined' | 'text' | 'plain'
  color?: string
  hover?: boolean
  clickable?: boolean
  padding?: boolean
  dense?: boolean
  fullHeight?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconSize: 40,
  iconWidth: 20,
  iconHeight: 20,
  loadingColor: 'primary',
  showRetry: true,
  emptyIcon: 'mdi-inbox-outline',
  emptyIconColor: 'grey-lighten-1',
  emptyIconSize: 48,
  elevation: 2,
  variant: 'elevated',
  padding: true,
  dense: false,
  fullHeight: false
})

defineEmits<{
  retry: []
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => [
  'enhanced-card',
  {
    'enhanced-card--hover': props.hover,
    'enhanced-card--clickable': props.clickable,
    'enhanced-card--dense': props.dense,
    'enhanced-card--full-height': props.fullHeight
  }
])

const contentClasses = computed(() => [
  {
    'pa-0': !props.padding,
    'pa-2': props.padding && props.dense,
    'pa-4': props.padding && !props.dense
  }
])
</script>

<style scoped>
.enhanced-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.enhanced-card--hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.enhanced-card--clickable {
  cursor: pointer;
}

.enhanced-card--full-height {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.enhanced-card--full-height .v-card-text {
  flex: 1;
}

.enhanced-card-header {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), 0.5);
}

.enhanced-card-title-section {
  display: flex;
  align-items: center;
  flex: 1;
}

.enhanced-card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.enhanced-card-loading {
  position: relative;
}

.enhanced-card-footer {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), 0.5);
}

@media (max-width: 768px) {
  .enhanced-card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .enhanced-card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>