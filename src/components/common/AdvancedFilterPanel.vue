<template>
  <section class="adv-filter-panel" :class="panelClass" :aria-label="ariaLabel">
    <header class="af-header">
      <div class="af-title-group">
        <v-icon size="18" class="mr-2">mdi-filter-variant</v-icon>
        <h2 class="af-title">{{ title }}</h2>
        <v-chip size="x-small" variant="tonal" color="primary" v-if="activeCount">{{ activeCount }}</v-chip>
      </div>
      <div class="af-header-actions">
        <v-btn v-if="showClear && activeCount" variant="text" size="x-small" prepend-icon="mdi-close-circle" @click="$emit('clear')" class="mr-1">Clear All</v-btn>
        <v-btn v-if="showAdvancedToggle" variant="text" size="x-small" :prepend-icon="internalShowAdvanced ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="toggle" :aria-expanded="internalShowAdvanced" aria-controls="advanced-filter-region">
          {{ internalShowAdvanced ? hideAdvancedLabel : advancedLabel }}
        </v-btn>
      </div>
    </header>

    <!-- Quick Filters -->
    <div v-if="$slots.quick" class="quick-filters" role="toolbar" aria-label="Quick filters" ref="quickFilterContainer" @keydown="handleQuickFilterKey">
      <slot name="quick" />
    </div>

    <!-- Active Pills -->
    <div v-if="activePills && activePills.length" class="active-pills" aria-label="Active filters">
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
      v-show="internalShowAdvanced"
      id="advanced-filter-region"
      class="advanced-region"
      role="region"
      aria-label="Advanced filters"
    >
      <div class="af-grid">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from 'vue'

interface ActivePill { key:string; label:string; icon:string; clear:() => void; type:string }

const props = defineProps<{ 
  title?: string;
  ariaLabel?: string;
  activePills?: ActivePill[];
  activeCount?: number;
  modelValue?: boolean; // advanced open state
  showAdvancedToggle?: boolean;
  showClear?: boolean;
  panelClass?: string;
  advancedLabel?: string;
  hideAdvancedLabel?: string;
}>()
const emit = defineEmits(['update:modelValue','clear'])

const internalShowAdvanced = ref(props.modelValue ?? true)
watch(() => props.modelValue, v => { if (v !== undefined) internalShowAdvanced.value = v as boolean })
const toggle = () => { internalShowAdvanced.value = !internalShowAdvanced.value; emit('update:modelValue', internalShowAdvanced.value) }

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
onMounted(() => setTimeout(() => setQuickFilterFocus(0), 0))
</script>

<style scoped>
.adv-filter-panel {background:#ffffff;border:1px solid #e5e7eb;border-radius:22px;position:relative;box-shadow:0 4px 18px -4px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.04);overflow:hidden;margin-bottom:1.5rem;}
.adv-filter-panel:before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#f8f9fa,#eef1f4);opacity:.85;}
.adv-filter-panel > * {position:relative;z-index:2;}
.af-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px 12px;border-bottom:1px solid #e5e7eb;background:linear-gradient(135deg,#fafbfc,#f0f3f6);} 
.af-title-group{display:flex;align-items:center;gap:6px;font-weight:600;font-size:15px;}
.af-title{margin:0;font-size:16px;font-weight:600;letter-spacing:.5px;}
.af-header-actions{display:flex;align-items:center;gap:4px;}
.quick-filters{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 6px;}
.qf-btn{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:500;letter-spacing:.3px;padding:6px 12px;border:1px solid #d5d9de;border-radius:28px;background:#fff;color:#374151;cursor:pointer;transition:.28s background,.28s color,.28s border,.28s box-shadow;position:relative;}
.qf-btn:hover{background:#f0f2f4;}
.qf-btn.active{background:linear-gradient(135deg,#8B1538,#6B0F2A);color:#fff;border-color:#8B1538;box-shadow:0 4px 14px -4px rgba(139,21,56,.55);} 
.qf-btn .v-icon{color:inherit !important;}
.qf-badge{background:#e5e7eb;color:#333;font-size:10px;font-weight:600;line-height:1;padding:3px 6px;border-radius:10px;margin-left:4px;position:relative;top:-1px;}
.qf-badge[data-severity="warn"]{background:#fff3cd;color:#924c00;}
.active-pills{padding:0 16px 2px;}
.pill-wrap{display:flex;flex-wrap:wrap;gap:8px;}
.filter-pill{display:inline-flex;align-items:center;max-width:220px;background:#fff;border:1px solid #d9dde2;border-radius:18px;padding:4px 8px 4px 10px;font-size:11px;font-weight:500;line-height:1;box-shadow:0 2px 4px rgba(0,0,0,.05);transition:.25s background,.25s border,.25s box-shadow;}
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
.pill-fade-enter-active,.pill-fade-leave-active{transition:all .25s ease;}
.pill-fade-enter-from{opacity:0;transform:translateY(-4px);} 
.pill-fade-leave-to{opacity:0;transform:translateY(-4px);} 
@media (max-width:780px){.af-grid{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));}}
@media (max-width:640px){.af-header{flex-wrap:wrap;gap:10px;}.quick-filters{padding-top:10px;}}
</style>