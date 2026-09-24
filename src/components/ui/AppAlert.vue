<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from '@lucide/vue'

import type { ToastVariant } from '@/stores/toast'

withDefaults(
  defineProps<{
    title?: string
    message: string
    variant?: ToastVariant
    dismissible?: boolean
  }>(),
  { variant: 'info', dismissible: false },
)

const emit = defineEmits<{ dismiss: [] }>()
const icons = { success: CircleCheck, error: CircleAlert, warning: TriangleAlert, info: Info }
const styles: Record<ToastVariant, string> = {
  success: 'border-mint-500/20 bg-mint-100 text-mint-600',
  error: 'border-coral-500/20 bg-coral-500/10 text-coral-500',
  warning: 'border-sun-400/35 bg-sun-400/15 text-[#80620f]',
  info: 'border-ink-600/15 bg-black/[0.04] text-ink-800',
}
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-lg border p-3.5"
    :class="styles[variant]"
    role="status"
  >
    <component :is="icons[variant]" :size="19" class="mt-0.5 shrink-0" />
    <div class="min-w-0 flex-1">
      <p v-if="title" class="text-sm font-extrabold">{{ title }}</p>
      <p class="text-sm leading-6" :class="{ 'mt-0.5': title }">{{ message }}</p>
    </div>
    <button
      v-if="dismissible"
      class="focus-ring grid size-8 shrink-0 place-items-center rounded-lg hover:bg-black/5"
      title="Tutup"
      @click="emit('dismiss')"
    >
      <X :size="16" />
    </button>
  </div>
</template>
