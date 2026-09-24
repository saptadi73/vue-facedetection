<script setup lang="ts">
import { Inbox } from '@lucide/vue'

withDefaults(
  defineProps<{
    title?: string
    message?: string
    compact?: boolean
  }>(),
  {
    title: 'Belum ada data',
    message: 'Data akan muncul di sini setelah tersedia.',
    compact: false,
  },
)
</script>

<template>
  <div
    class="flex flex-col items-center justify-center text-center"
    :class="compact ? 'px-4 py-8' : 'px-5 py-12'"
  >
    <div class="grid size-12 place-items-center rounded-lg bg-mint-100 text-mint-600">
      <slot name="icon"><Inbox :size="23" /></slot>
    </div>
    <h3 class="mt-3 font-display text-base font-extrabold text-ink-950">{{ title }}</h3>
    <p v-if="message" class="mt-1 max-w-sm text-sm leading-6 text-ink-600">{{ message }}</p>
    <div v-if="$slots.action" class="mt-4"><slot name="action" /></div>
  </div>
</template>
