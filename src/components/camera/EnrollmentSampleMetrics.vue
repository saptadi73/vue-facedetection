<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheck, CircleX, ScanLine, ShieldCheck, SunMedium } from '@lucide/vue'

import type { EnrollmentSample } from '@/types/api'

const props = defineProps<{ samples: EnrollmentSample[] }>()
const orderedSamples = computed(() => [...props.samples].reverse())
const reasonLabels: Record<string, string> = {
  INVALID_FACE_COUNT: 'Jumlah wajah tidak valid',
  LOW_DETECTION_CONFIDENCE: 'Keyakinan deteksi rendah',
  YAW_OUT_OF_RANGE: 'Sudut kiri/kanan terlalu jauh',
  PITCH_OUT_OF_RANGE: 'Sudut atas/bawah terlalu jauh',
  ROLL_OUT_OF_RANGE: 'Kemiringan kepala terlalu jauh',
  BLUR_TOO_LOW: 'Foto kurang tajam',
  IMAGE_TOO_DARK: 'Foto terlalu gelap',
  IMAGE_TOO_BRIGHT: 'Foto terlalu terang',
}
</script>

<template>
  <section
    v-if="samples.length"
    class="rounded-lg border border-black/[0.07] bg-white p-4 shadow-[0_12px_35px_rgba(18,32,28,0.06)]"
  >
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="font-display text-base font-extrabold">Hasil setiap sampel</p>
        <p class="mt-1 text-xs text-ink-600">Nilai final dari pemeriksaan backend.</p>
      </div>
      <span class="text-xs font-bold text-ink-600">{{ samples.length }} percobaan</span>
    </div>
    <div class="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
      <article
        v-for="(sample, reverseIndex) in orderedSamples"
        :key="sample.sample_id"
        class="rounded-lg border p-3"
        :class="
          sample.accepted ? 'border-mint-500/20 bg-mint-50' : 'border-coral-500/20 bg-coral-500/4'
        "
      >
        <div class="flex items-center justify-between gap-2">
          <span
            class="inline-flex items-center gap-1.5 text-xs font-extrabold"
            :class="sample.accepted ? 'text-mint-600' : 'text-coral-500'"
            ><CircleCheck v-if="sample.accepted" :size="15" /><CircleX v-else :size="15" />Sampel
            {{ samples.length - reverseIndex }} ·
            {{ sample.accepted ? 'Diterima' : 'Ditolak' }}</span
          >
          <span class="text-[11px] text-ink-600">ID #{{ sample.sample_id }}</span>
        </div>
        <div class="mt-3 grid grid-cols-3 gap-2">
          <div class="rounded-lg bg-white/80 p-2">
            <SunMedium :size="15" class="text-[#987518]" />
            <p class="mt-1 text-[10px] text-ink-600">Brightness</p>
            <p class="text-sm font-extrabold">{{ sample.brightness_score.toFixed(1) }}</p>
          </div>
          <div class="rounded-lg bg-white/80 p-2">
            <ScanLine :size="15" class="text-mint-600" />
            <p class="mt-1 text-[10px] text-ink-600">Blur score</p>
            <p class="text-sm font-extrabold">{{ sample.blur_score.toFixed(1) }}</p>
          </div>
          <div class="rounded-lg bg-white/80 p-2">
            <ShieldCheck :size="15" class="text-ink-600" />
            <p class="mt-1 text-[10px] text-ink-600">Confidence</p>
            <p class="text-sm font-extrabold">
              {{ Math.round(sample.detector_confidence * 100) }}%
            </p>
          </div>
        </div>
        <p v-if="sample.reason_codes.length" class="mt-2 text-[11px] leading-5 text-coral-500">
          {{ sample.reason_codes.map((reason) => reasonLabels[reason] || reason).join(' · ') }}
        </p>
      </article>
    </div>
  </section>
</template>
