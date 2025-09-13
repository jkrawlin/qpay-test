<template>
  <div class="skeleton-loader" :class="[variant, size]">
    <div class="skeleton-item" v-for="n in lines" :key="n" :class="{ 'last-line': n === lines && lastLineWidth }">
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  lines?: number
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'image'
  size?: 'small' | 'medium' | 'large'
  lastLineWidth?: boolean
}

withDefaults(defineProps<Props>(), {
  lines: 3,
  variant: 'text',
  size: 'medium',
  lastLineWidth: true
})
</script>

<style scoped>
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
}

.skeleton-item {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: var(--border-radius-sm);
}

/* Variants */
.skeleton-loader.text .skeleton-item {
  height: 16px;
  width: 100%;
}

.skeleton-loader.text .skeleton-item.last-line {
  width: 75%;
}

.skeleton-loader.card .skeleton-item {
  height: 120px;
  width: 100%;
  border-radius: var(--border-radius-lg);
}

.skeleton-loader.avatar .skeleton-item {
  height: 40px;
  width: 40px;
  border-radius: 50%;
}

.skeleton-loader.button .skeleton-item {
  height: 36px;
  width: 120px;
  border-radius: var(--border-radius-md);
}

.skeleton-loader.image .skeleton-item {
  height: 200px;
  width: 100%;
  border-radius: var(--border-radius-md);
}

/* Sizes */
.skeleton-loader.small .skeleton-item {
  height: 12px;
}

.skeleton-loader.small.avatar .skeleton-item {
  height: 32px;
  width: 32px;
}

.skeleton-loader.small.button .skeleton-item {
  height: 28px;
  width: 80px;
}

.skeleton-loader.large .skeleton-item {
  height: 20px;
}

.skeleton-loader.large.avatar .skeleton-item {
  height: 56px;
  width: 56px;
}

.skeleton-loader.large.button .skeleton-item {
  height: 44px;
  width: 160px;
}

.skeleton-loader.large.image .skeleton-item {
  height: 300px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Dark theme */
.v-theme--dark .skeleton-item {
  background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
  background-size: 200% 100%;
}

/* Responsive */
@media (max-width: 600px) {
  .skeleton-loader {
    gap: var(--spacing-xs);
    padding: var(--spacing-xs);
  }
}
</style>