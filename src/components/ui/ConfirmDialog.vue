<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { AlertTriangle } from '@lucide/vue'

import AppModal from './AppModal.vue'
import BaseButton from './BaseButton.vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmationText?: string
    loading?: boolean
  }>(),
  { confirmationText: 'BATALKAN' },
)
const emit = defineEmits<{ close: []; confirm: [] }>()
const typed = ref('')
const valid = computed(
  () => typed.value.trim().toUpperCase() === props.confirmationText.toUpperCase(),
)
watch(
  () => props.open,
  (open) => {
    if (open) typed.value = ''
  },
)
</script>

<template>
  <AppModal :open="open" :title="title" @close="emit('close')">
    <div class="flex gap-3 rounded-lg border border-coral-500/20 bg-coral-500/[0.07] p-3.5">
      <AlertTriangle :size="20" class="mt-0.5 shrink-0 text-coral-500" />
      <p class="text-sm leading-6 text-ink-800">{{ message }}</p>
    </div>
    <label class="mt-5 block text-sm font-semibold text-ink-800">
      Ketik <strong>{{ confirmationText }}</strong> untuk melanjutkan
      <input v-model="typed" class="field mt-2 uppercase" autocomplete="off" />
    </label>
    <div class="mt-5 flex justify-end gap-2">
      <BaseButton variant="secondary" @click="emit('close')">Kembali</BaseButton>
      <BaseButton variant="danger" :disabled="!valid" :loading="loading" @click="emit('confirm')"
        >Konfirmasi</BaseButton
      >
    </div>
  </AppModal>
</template>
