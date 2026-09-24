<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Check, CircleCheck, Fingerprint, ScanFace, Sparkles } from '@lucide/vue'

import { enrollmentApi } from '@/api/services'
import CameraPreview from '@/components/camera/CameraPreview.vue'
import CaptureAngleGuide from '@/components/camera/CaptureAngleGuide.vue'
import EnrollmentSampleMetrics from '@/components/camera/EnrollmentSampleMetrics.vue'
import AppAlert from '@/components/ui/AppAlert.vue'
import AppCard from '@/components/ui/AppCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton.vue'
import { useAuthStore } from '@/stores/auth'
import type { EnrollmentSample, EnrollmentStatus } from '@/types/api'

const auth = useAuthStore()
const camera = ref<InstanceType<typeof CameraPreview> | null>(null)
const status = ref<EnrollmentStatus | null>(null)
const samples = ref<EnrollmentSample[]>([])
const loading = ref(true)
const working = ref(false)
const message = ref('')
const embeddingProvider = ref<string | null>(null)
const employeeId = computed(() => String(auth.employee?.id || ''))
const accepted = computed(
  () =>
    samples.value.filter((sample) => sample.accepted).length +
    (status.value?.accepted_samples || 0),
)
const progress = computed(() => Math.min(100, (accepted.value / 5) * 100))

async function loadStatus() {
  if (!employeeId.value) {
    loading.value = false
    return
  }
  try {
    status.value = await enrollmentApi.status(employeeId.value)
  } catch {
    status.value = { employee_id: employeeId.value, status: 'pending', is_enrolled: false }
  } finally {
    loading.value = false
  }
}
async function start() {
  if (!auth.employee) return
  working.value = true
  message.value = ''
  try {
    status.value = await enrollmentApi.start({
      employee_id: employeeId.value,
      employee_name: auth.employee.name,
      employee_code: auth.employee.barcode || undefined,
    })
    await camera.value?.start()
  } catch (reason) {
    message.value = reason instanceof Error ? reason.message : 'Enrollment tidak dapat dimulai.'
  } finally {
    working.value = false
  }
}
async function captureSample() {
  working.value = true
  message.value = ''
  let imageBase64: string | null = null
  try {
    imageBase64 = camera.value?.capture() ?? null
    if (!imageBase64) throw new Error('Aktifkan kamera terlebih dahulu.')
    const sample = await enrollmentApi.sample(employeeId.value, imageBase64)
    samples.value.push(sample)
    message.value = sample.accepted
      ? 'Sampel diterima. Ubah sedikit sudut wajah.'
      : `Sampel ditolak: ${sample.reason_codes.join(', ')}`
  } catch (reason) {
    message.value = reason instanceof Error ? reason.message : 'Sampel gagal dikirim.'
  } finally {
    imageBase64 = null
    working.value = false
  }
}
async function finish() {
  working.value = true
  message.value = ''
  try {
    const completed = await enrollmentApi.finish(employeeId.value)
    status.value = completed
    embeddingProvider.value = completed.embedding_provider
    message.value = `Template wajah berhasil dibuat dengan provider ${completed.embedding_provider.toUpperCase()}.`
  } catch (reason) {
    message.value =
      reason instanceof Error ? reason.message : 'Enrollment belum dapat diselesaikan.'
  } finally {
    working.value = false
  }
}
onMounted(loadStatus)
</script>

<template>
  <div>
    <header class="mb-5">
      <p class="text-sm font-bold text-mint-600">Identitas biometrik</p>
      <h1 class="mt-1 font-display text-2xl font-extrabold sm:text-3xl">Daftarkan wajah</h1>
      <p class="mt-1 text-sm text-ink-600">
        Ambil minimal lima foto dengan sudut yang sedikit berbeda.
      </p>
    </header>
    <LoadingSkeleton v-if="loading" :rows="4" />
    <div
      v-else-if="!auth.employee"
      class="rounded-lg bg-coral-500/10 p-5 text-sm font-semibold text-coral-500"
    >
      Akun ini belum terhubung dengan employee Odoo.
    </div>
    <div v-else class="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
      <CameraPreview ref="camera" />
      <div class="space-y-4">
        <AppCard>
          <div class="flex items-center gap-3">
            <div class="grid size-11 place-items-center rounded-lg bg-mint-100 text-mint-600">
              <Fingerprint :size="22" />
            </div>
            <div>
              <p class="font-bold">{{ auth.employee.name }}</p>
              <p class="text-xs text-ink-600">
                {{ auth.employee.barcode || `Employee #${auth.employee.id}` }}
              </p>
            </div>
            <span
              v-if="status?.is_enrolled || status?.status === 'completed'"
              class="ml-auto inline-flex items-center gap-1 rounded-full bg-mint-100 px-2.5 py-1 text-xs font-bold text-mint-600"
              ><CircleCheck :size="14" /> Terdaftar</span
            >
          </div>
        </AppCard>
        <CaptureAngleGuide v-if="status?.status === 'in_progress'" :accepted-count="accepted" />
        <AppCard>
          <div class="flex items-end justify-between">
            <div>
              <p class="text-sm font-bold">Progres sampel</p>
              <p class="mt-1 text-xs text-ink-600">{{ accepted }} dari 5 foto berkualitas</p>
            </div>
            <span class="font-display text-2xl font-extrabold">{{ Math.round(progress) }}%</span>
          </div>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.07]">
            <div
              class="h-full rounded-full bg-mint-500 transition-all"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <div class="mt-4 grid grid-cols-5 gap-2">
            <div
              v-for="index in 5"
              :key="index"
              class="grid aspect-square place-items-center rounded-lg border"
              :class="
                index <= accepted
                  ? 'border-mint-500 bg-mint-100 text-mint-600'
                  : 'border-dashed border-black/15 text-ink-600/50'
              "
            >
              <Check v-if="index <= accepted" :size="18" /><span v-else class="text-xs font-bold">{{
                index
              }}</span>
            </div>
          </div>
        </AppCard>
        <AppAlert
          v-if="message"
          :variant="message.includes('ditolak') || message.includes('gagal') ? 'error' : 'success'"
          :message="message"
          dismissible
          @dismiss="message = ''"
        />
        <BaseButton
          v-if="status?.status === 'pending' || !status"
          class="w-full"
          :loading="working"
          @click="start"
          ><Sparkles :size="18" /> Mulai enrollment</BaseButton
        >
        <template v-else-if="status.status !== 'completed'">
          <BaseButton class="w-full" :loading="working" @click="captureSample"
            ><ScanFace :size="18" /> Ambil sampel</BaseButton
          >
          <BaseButton
            variant="secondary"
            class="w-full"
            :disabled="accepted < 5"
            :loading="working"
            @click="finish"
            >Selesaikan enrollment</BaseButton
          >
        </template>
        <div v-else class="rounded-lg border border-mint-500/20 bg-mint-100 p-4 text-center">
          <CircleCheck :size="28" class="mx-auto text-mint-600" />
          <p class="mt-2 font-bold">Wajah sudah terdaftar</p>
          <p class="mt-1 text-xs text-ink-600">
            Anda siap menggunakan presensi wajah.
            <span v-if="embeddingProvider" class="font-bold uppercase"
              >Provider: {{ embeddingProvider }}</span
            >
          </p>
        </div>
        <EnrollmentSampleMetrics :samples="samples" />
      </div>
    </div>
  </div>
</template>
