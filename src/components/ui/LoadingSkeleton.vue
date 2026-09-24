<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 3 })
</script>

<template>
  <div class="animate-pulse space-y-3" aria-label="Memuat data">
    <div v-for="row in rows" :key="row" class="h-16 rounded-lg bg-black/[0.06]" />
  </div>
</template>
