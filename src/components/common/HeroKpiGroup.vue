<template>
  <section class="hero-surface" :aria-label="ariaLabel">
    <div class="hero-intro">
      <h1 class="hero-title"><slot name="title">Title</slot></h1>
      <p v-if="$slots.subtitle" class="hero-sub"><slot name="subtitle" /></p>
      <div class="hero-actions"><slot name="actions" /></div>
    </div>
    <div class="hero-kpis" role="list" aria-label="Key performance indicators">
      <div v-for="k in kpis" :key="k.key" class="kpi-card" role="listitem">
        <div class="kpi-label">{{ k.label }}</div>
        <div class="kpi-value" :class="{ warn: k.warn, success: k.success }">{{ k.value }}</div>
        <div class="kpi-foot" :class="{ warn: k.warn, success: k.success }">{{ k.foot }}</div>
      </div>
      <slot name="extra" />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Kpi { key: string; label: string; value: string | number; foot?: string; warn?: boolean; success?: boolean }
defineProps<{ kpis: Kpi[]; ariaLabel?: string }>()
</script>

<style scoped>
.hero-surface{display:flex;flex-wrap:wrap;gap:30px;background:linear-gradient(135deg,#8B1538 0%,#6B0F2A 55%,#5a0d24 100%);padding:34px 40px 36px;border-radius:26px;position:relative;overflow:hidden;color:#fff;}
.hero-surface:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(255,255,255,0.25),transparent 60%);pointer-events:none;}
.hero-intro{flex:1 1 320px;min-width:260px;max-width:480px;}
.hero-title{margin:0 0 10px;font-size:30px;font-weight:700;letter-spacing:.5px;}
.hero-sub{margin:0 0 18px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.88);}
.hero-actions{display:flex;gap:8px;flex-wrap:wrap;}
.hero-kpis{flex:1 1 460px;min-width:340px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));}
.kpi-card{background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,0.25);border-radius:18px;padding:14px 16px 16px;display:flex;flex-direction:column;transition:.35s transform,.35s box-shadow;}
.kpi-card:hover{transform:translateY(-3px);box-shadow:0 6px 24px -8px rgba(0,0,0,0.35);} 
.kpi-label{font-size:11px;text-transform:uppercase;letter-spacing:.65px;opacity:.8;font-weight:600;}
.kpi-value{font-size:30px;font-weight:700;line-height:1.05;margin:4px 0 4px;}
.kpi-foot{font-size:11px;letter-spacing:.5px;text-transform:uppercase;opacity:.75;font-weight:500;}
.kpi-value.warn,.kpi-foot.warn{color:#ffcf5c;opacity:1;}
.kpi-value.success,.kpi-foot.success{color:#8ef0b2;opacity:1;}
@media (max-width:960px){.hero-surface{padding:30px 28px 32px;}.hero-title{font-size:26px;}}
@media (max-width:640px){.hero-kpis{grid-template-columns:repeat(2,1fr);} }
</style>