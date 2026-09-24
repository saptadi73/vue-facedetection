<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Check,
  LocateFixed,
  LogIn,
  LogOut,
  MapPin,
  RefreshCw,
  ScanFace,
  ShieldCheck,
} from '@lucide/vue'

import { attendanceApi } from '@/api/services'
import CameraPreview from '@/components/camera/CameraPreview.vue'
import AppCard from '@/components/ui/AppCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useGeolocation } from '@/composables/useGeolocation'
import type { AttendanceResult } from '@/types/api'

const camera = ref<InstanceType<typeof CameraPreview> | null>(null)
const action = ref<'checkin' | 'checkout'>('checkin')
const submitting = ref(false)
const submitError = ref('')
const result = ref<AttendanceResult | null>(null)
const eventId = ref(crypto.randomUUID())
const {
  coords,
  loading: locating,
  error: locationError,
  quality,
  requestLocation,
} = useGeolocation()
const locationLabel = computed(() =>
  quality.value === 'good'
    ? 'Akurasi sangat baik'
    : quality.value === 'fair'
      ? 'Akurasi cukup'
      : quality.value === 'poor'
        ? 'Akurasi rendah'
        : 'Lokasi belum tersedia',
)
const canSubmit = computed(() => Boolean(coords.value && quality.value !== 'poor'))

async function locate() {
  try {
    await requestLocation()
  } catch {
    /* Error is exposed by the composable. */
  }
}
async function submit() {
  submitError.value = ''
  result.value = null
  if (!coords.value) {
    submitError.value = 'Ambil lokasi terlebih dahulu.'
    return
  }
  if (quality.value === 'poor') {
    submitError.value = 'Akurasi GPS lebih dari 50 meter. Ambil ulang lokasi.'
    return
  }
  submitting.value = true
  try {
    const imageBase64 = camera.value?.capture()
    if (!imageBase64) throw new Error('Aktifkan kamera terlebih dahulu.')
    result.value = await attendanceApi.submit(action.value, {
      event_id: eventId.value,
      image_base64: imageBase64,
      latitude: coords.value.latitude,
      longitude: coords.value.longitude,
      gps_accuracy_meters: coords.value.accuracy,
      gps_provider: 'browser',
    })
    eventId.value = crypto.randomUUID()
  } catch (reason) {
    submitError.value = reason instanceof Error ? reason.message : 'Presensi gagal dikirim.'
  } finally {
    submitting.value = false
  }
}
onMounted(locate)
</script>

<template>
  <div>
    <header class="mb-5">
      <p class="text-sm font-bold text-mint-600">Presensi wajah</p>
      <h1 class="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Catat kehadiran</h1>
      <p class="mt-1 text-sm text-ink-600">Pastikan wajah terlihat jelas dan GPS akurat.</p>
    </header>
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
      <CameraPreview ref="camera" />
      <div class="space-y-4">
        <AppCard>
          <p class="mb-3 text-sm font-bold text-ink-800">Pilih aktivitas</p>
          <div class="grid grid-cols-2 rounded-lg bg-black/[0.05] p-1">
            <button
              v-for="option in [
                { value: 'checkin', label: 'Masuk', icon: LogIn },
                { value: 'checkout', label: 'Pulang', icon: LogOut },
              ]"
              :key="option.value"
              class="focus-ring flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold transition"
              :class="action === option.value ? 'bg-white text-ink-950 shadow-sm' : 'text-ink-600'"
              @click="action = option.value as typeof action"
            >
              <component :is="option.icon" :size="18" />{{ option.label }}
            </button>
          </div>
        </AppCard>
        <AppCard>
          <div class="flex items-start gap-3">
            <div
              class="grid size-11 shrink-0 place-items-center rounded-lg"
              :class="
                coords
                  ? quality === 'good'
                    ? 'bg-mint-100 text-mint-600'
                    : quality === 'fair'
                      ? 'bg-sun-400/20 text-[#987518]'
                      : 'bg-coral-500/10 text-coral-500'
                  : 'bg-black/[0.05] text-ink-600'
              "
            >
              <MapPin :size="21" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-bold">{{ locationLabel }}</p>
              <p v-if="coords" class="mt-1 text-xs text-ink-600">
                ±{{ Math.round(coords.accuracy) }} m · {{ coords.latitude.toFixed(5) }},
                {{ coords.longitude.toFixed(5) }}
              </p>
              <p v-else class="mt-1 text-xs text-ink-600">GPS wajib untuk validasi area kerja.</p>
            </div>
            <button
              class="focus-ring grid size-10 place-items-center rounded-lg border border-black/10"
              title="Ambil ulang lokasi"
              :disabled="locating"
              @click="locate"
            >
              <RefreshCw :size="17" :class="{ 'animate-spin': locating }" />
            </button>
          </div>
          <p v-if="locationError" class="mt-3 text-xs font-semibold text-coral-500">
            {{ locationError }}
          </p>
        </AppCard>
        <div class="flex items-center gap-2 px-1 text-xs text-ink-600">
          <ShieldCheck :size="16" class="text-mint-600" /> Foto hanya diproses untuk verifikasi
          kehadiran.
        </div>
        <p
          v-if="submitError"
          class="rounded-lg bg-coral-500/10 p-3 text-sm font-semibold text-coral-500"
        >
          {{ submitError }}
        </p>
        <BaseButton class="w-full" :loading="submitting" :disabled="!canSubmit" @click="submit"
          ><ScanFace :size="19" /> Verifikasi &
          {{ action === 'checkin' ? 'masuk' : 'pulang' }}</BaseButton
        >
      </div>
    </div>

    <AppCard v-if="result" class="mt-4"
      ><div class="flex items-start gap-3">
        <div
          class="grid size-12 shrink-0 place-items-center rounded-full"
          :class="result.matched ? 'bg-mint-100 text-mint-600' : 'bg-coral-500/10 text-coral-500'"
        >
          <Check v-if="result.matched" :size="24" /><LocateFixed v-else :size="24" />
        </div>
        <div>
          <p class="font-display text-lg font-extrabold">
            {{ result.matched ? 'Presensi berhasil' : 'Wajah tidak dikenali' }}
          </p>
          <p class="mt-1 text-sm text-ink-600">
            Status {{ result.status }} · kecocokan {{ Math.round((result.similarity || 0) * 100) }}%
            · GPS ±{{ Math.round(result.gps_accuracy_meters || 0) }} m
          </p>
          <p v-if="result.odoo_sync_status" class="mt-2 text-xs font-bold uppercase text-mint-600">
            Odoo: {{ result.odoo_sync_status }}
          </p>
        </div>
      </div></AppCard
    >
  </div>
</template>
