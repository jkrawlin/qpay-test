<template>
  <div class="loading-spinner-container" :class="{ 'overlay': overlay }">
    <div class="loading-spinner" :class="size">
      <div class="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div v-if="text" class="loading-text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  text?: string
  overlay?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  text: '',
  overlay: false
})
</script>

<style scoped>
.loading-spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.loading-spinner-container.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.spinner-ring {
  position: relative;
  width: 40px;
  height: 40px;
}

.loading-spinner.small .spinner-ring {
  width: 24px;
  height: 24px;
}

.loading-spinner.large .spinner-ring {
  width: 60px;
  height: 60px;
}

.spinner-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spinner-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: var(--color-primary) transparent transparent transparent;
}

.spinner-ring div:nth-child(1) { animation-delay: -0.45s; }
.spinner-ring div:nth-child(2) { animation-delay: -0.3s; }
.spinner-ring div:nth-child(3) { animation-delay: -0.15s; }

.loading-text {
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  animation: loading-pulse 1.5s ease-in-out infinite;
}

.loading-spinner.small .loading-text {
  font-size: 12px;
}

.loading-spinner.large .loading-text {
  font-size: 16px;
}

@keyframes spinner-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Dark theme */
.v-theme--dark .loading-spinner-container.overlay {
  background: rgba(18, 18, 18, 0.9);
}

.v-theme--dark .spinner-ring div {
  border-color: var(--color-primary) transparent transparent transparent;
}

.v-theme--dark .loading-text {
  color: rgba(255, 255, 255, 0.7);
}
</style>