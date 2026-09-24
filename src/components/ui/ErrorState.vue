<script setup lang="ts">
import { RefreshCw, WifiOff } from '@lucide/vue'

import BaseButton from './BaseButton.vue'

withDefaults(
  defineProps<{
    title?: string
    message?: string
    retryable?: boolean
    loading?: boolean
  }>(),
  {
    title: 'Data tidak dapat dimuat',
    message: 'Periksa koneksi Anda lalu coba kembali.',
    retryable: true,
  },
)

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-5 py-12 text-center" role="alert">
    <div class="grid size-12 place-items-center rounded-lg bg-coral-500/10 text-coral-500">
      <WifiOff :size="23" />
    </div>
    <h3 class="mt-3 font-display text-base font-extrabold text-ink-950">{{ title }}</h3>
    <p class="mt-1 max-w-md text-sm leading-6 text-ink-600">{{ message }}</p>
    <BaseButton
      v-if="retryable"
      variant="secondary"
      class="mt-4"
      :loading="loading"
      @click="emit('retry')"
      ><RefreshCw :size="16" /> Coba lagi</BaseButton
    >
  </div>
</template>
