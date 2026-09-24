<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Camera,
  CameraOff,
  CircleCheck,
  ScanFace,
  ScanLine,
  SunMedium,
  SwitchCamera,
} from '@lucide/vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import { useCamera, type FrameQuality } from '@/composables/useCamera'
import { useFaceAreaDetection } from '@/composables/useFaceAreaDetection'

const video = ref<HTMLVideoElement | null>(null)
const frame = ref<HTMLDivElement | null>(null)
const starting = ref(false)
const selectedDeviceId = ref('')
const quality = ref<FrameQuality | null>(null)
const {
  stream,
  devices,
  isReady,
  mirrored,
  error,
  refreshDevices,
  startCamera,
  analyzeFrame,
  captureFrame,
} = useCamera()
const {
  result: faceArea,
  error: faceDetectionError,
  initialize: initializeFaceDetector,
  detect: detectFace,
  reset: resetFaceArea,
} = useFaceAreaDetection()
let qualityTimer: ReturnType<typeof setInterval> | undefined

const qualityMessage = computed(() => {
  if (!quality.value) return 'Menilai kualitas gambar...'
  if (quality.value.brightnessStatus === 'dark') return 'Pencahayaan terlalu gelap'
  if (quality.value.brightnessStatus === 'bright') return 'Pencahayaan terlalu terang'
  if (quality.value.blurStatus === 'blurry') return 'Gambar kurang tajam, tahan perangkat'
  return 'Kualitas gambar baik'
})
const faceMessage = computed(() => {
  if (faceDetectionError.value) return 'Detector wajah tidak tersedia'
  if (faceArea.value.status === 'loading') return 'Menyiapkan deteksi wajah...'
  if (faceArea.value.status === 'no-face') return 'Wajah belum terdeteksi'
  if (faceArea.value.status === 'multiple') return 'Pastikan hanya satu wajah terlihat'
  if (faceArea.value.status === 'too-small') return 'Dekatkan wajah ke kamera'
  if (faceArea.value.status === 'outside') return 'Arahkan wajah ke tengah bingkai'
  if (faceArea.value.status === 'unavailable') return 'Deteksi wajah gagal dimuat'
  return 'Posisi wajah sudah tepat'
})
const faceBoxStyle = computed(() => {
  const box = faceArea.value.boundingBox
  if (!box || !video.value || !frame.value) return undefined
  const videoWidth = video.value.videoWidth
  const videoHeight = video.value.videoHeight
  const frameWidth = frame.value.clientWidth
  const frameHeight = frame.value.clientHeight
  if (!videoWidth || !videoHeight || !frameWidth || !frameHeight) return undefined

  const scale = Math.max(frameWidth / videoWidth, frameHeight / videoHeight)
  const renderedWidth = videoWidth * scale
  const renderedHeight = videoHeight * scale
  const offsetX = (frameWidth - renderedWidth) / 2
  const offsetY = (frameHeight - renderedHeight) / 2
  const width = box.width * scale
  const height = box.height * scale
  const sourceLeft = box.originX * scale + offsetX
  const left = mirrored.value ? frameWidth - sourceLeft - width : sourceLeft

  return {
    left: `${left}px`,
    top: `${box.originY * scale + offsetY}px`,
    width: `${width}px`,
    height: `${height}px`,
  }
})

function updateQuality() {
  if (!video.value || !isReady.value) return
  try {
    quality.value = analyzeFrame(video.value)
    detectFace(video.value)
  } catch {
    quality.value = null
  }
}

function startQualityMonitor() {
  if (qualityTimer) clearInterval(qualityTimer)
  updateQuality()
  qualityTimer = setInterval(updateQuality, 600)
}

async function start(deviceId = selectedDeviceId.value) {
  if (!video.value) return
  if (qualityTimer) clearInterval(qualityTimer)
  starting.value = true
  quality.value = null
  resetFaceArea()
  try {
    await startCamera(video.value, deviceId || undefined)
    selectedDeviceId.value = stream.value?.getVideoTracks()[0]?.getSettings().deviceId || deviceId
    try {
      await initializeFaceDetector()
    } catch {
      /* Detector error is shown separately while the camera remains usable. */
    }
    startQualityMonitor()
  } catch {
    /* Error is exposed by the composable. */
  } finally {
    starting.value = false
  }
}
async function changeCamera() {
  await start(selectedDeviceId.value)
}
function capture() {
  if (!video.value) throw new Error('Kamera belum tersedia.')
  const currentQuality = analyzeFrame(video.value)
  const currentFaceArea = detectFace(video.value)
  quality.value = currentQuality
  if (!currentFaceArea.passed) throw new Error(faceMessage.value)
  if (currentQuality.brightnessStatus === 'dark')
    throw new Error('Pencahayaan terlalu gelap. Cari tempat yang lebih terang.')
  if (currentQuality.brightnessStatus === 'bright')
    throw new Error('Pencahayaan terlalu terang. Hindari cahaya langsung ke kamera.')
  if (currentQuality.blurStatus === 'blurry')
    throw new Error('Gambar kurang tajam. Tahan perangkat dan coba kembali.')
  return captureFrame(video.value)
}
defineExpose({ capture, start, isReady, quality, faceArea })
onMounted(() => {
  navigator.mediaDevices?.addEventListener('devicechange', refreshDevices)
})
onBeforeUnmount(() => {
  if (qualityTimer) clearInterval(qualityTimer)
  navigator.mediaDevices?.removeEventListener('devicechange', refreshDevices)
})
</script>

<template>
  <div class="space-y-3">
    <div
      ref="frame"
      class="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-ink-950 sm:aspect-4/3"
    >
      <video
        ref="video"
        class="size-full object-cover"
        :class="{ 'scale-x-[-1]': mirrored }"
        muted
        playsinline
      />
      <div v-if="isReady && devices.length > 1" class="absolute left-3 top-3 z-10">
        <label class="relative block">
          <SwitchCamera
            :size="16"
            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white"
          />
          <select
            v-model="selectedDeviceId"
            class="focus-ring max-w-48 appearance-none rounded-lg border border-white/20 bg-ink-950/75 py-2 pl-9 pr-3 text-xs font-bold text-white backdrop-blur"
            aria-label="Pilih kamera"
            :disabled="starting"
            @change="changeCamera"
          >
            <option v-for="device in devices" :key="device.deviceId" :value="device.deviceId">
              {{ device.label }}
            </option>
          </select>
        </label>
      </div>
      <div v-if="isReady" class="pointer-events-none absolute inset-0 grid place-items-center">
        <div
          class="relative h-[55%] w-[68%] rounded-[48%] border-2 shadow-[0_0_0_999px_rgba(18,32,28,0.28)] transition-colors"
          :class="faceArea.passed ? 'border-mint-500' : 'border-white/80'"
        >
          <span
            class="absolute -left-1 -top-1 size-7 rounded-tl-lg border-l-4 border-t-4 border-mint-500"
          />
          <span
            class="absolute -right-1 -top-1 size-7 rounded-tr-lg border-r-4 border-t-4 border-mint-500"
          />
          <span
            class="absolute -bottom-1 -left-1 size-7 rounded-bl-lg border-b-4 border-l-4 border-mint-500"
          />
          <span
            class="absolute -bottom-1 -right-1 size-7 rounded-br-lg border-b-4 border-r-4 border-mint-500"
          />
        </div>
        <div
          v-if="faceBoxStyle"
          class="absolute rounded-lg border-2 transition-all"
          :class="faceArea.passed ? 'border-mint-500' : 'border-sun-400'"
          :style="faceBoxStyle"
        />
        <p
          class="absolute bottom-5 rounded-full px-3 py-1.5 text-xs font-bold text-white"
          :class="faceArea.passed ? 'bg-mint-600/90' : 'bg-ink-950/75'"
        >
          {{ faceMessage }}
        </p>
      </div>
      <div
        v-else
        class="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white"
      >
        <div class="grid size-16 place-items-center rounded-full bg-white/10">
          <CameraOff :size="28" />
        </div>
        <p class="mt-4 font-display text-lg font-bold">Kamera belum aktif</p>
        <p class="mt-2 max-w-xs text-sm leading-6 text-white/60">
          Izinkan akses kamera depan untuk memindai wajah Anda.
        </p>
        <BaseButton
          class="mt-5 bg-white text-ink-950! hover:bg-mint-100"
          :loading="starting"
          @click="start"
          ><Camera :size="18" /> Aktifkan kamera</BaseButton
        >
      </div>
      <div
        v-if="error"
        class="absolute inset-x-3 bottom-3 rounded-lg bg-coral-500 p-3 text-sm font-semibold text-white"
      >
        <ScanFace :size="17" class="mr-2 inline" />{{ error }}
      </div>
    </div>
    <div v-if="isReady" class="grid grid-cols-2 gap-2">
      <div
        class="flex items-center gap-2 rounded-lg border p-2.5"
        :class="
          quality?.brightnessStatus === 'good'
            ? 'border-mint-500/20 bg-mint-100 text-mint-600'
            : 'border-sun-400/30 bg-sun-400/15 text-[#80620f]'
        "
      >
        <SunMedium :size="18" class="shrink-0" />
        <div>
          <p class="text-xs font-extrabold">Cahaya</p>
          <p class="text-[11px]">{{ quality?.brightness ?? '...' }} / 255</p>
        </div>
      </div>
      <div
        class="flex items-center gap-2 rounded-lg border p-2.5"
        :class="
          quality?.blurStatus === 'good'
            ? 'border-mint-500/20 bg-mint-100 text-mint-600'
            : 'border-sun-400/30 bg-sun-400/15 text-[#80620f]'
        "
      >
        <ScanLine :size="18" class="shrink-0" />
        <div>
          <p class="text-xs font-extrabold">Ketajaman</p>
          <p class="text-[11px]">{{ quality?.blur ?? '...' }} skor</p>
        </div>
      </div>
      <div
        class="col-span-2 flex items-center gap-2 rounded-lg border p-2.5"
        :class="
          faceArea.passed
            ? 'border-mint-500/20 bg-mint-100 text-mint-600'
            : 'border-sun-400/30 bg-sun-400/15 text-[#80620f]'
        "
      >
        <CircleCheck v-if="faceArea.passed" :size="18" class="shrink-0" /><ScanFace
          v-else
          :size="18"
          class="shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-extrabold">Area wajah</p>
          <p class="truncate text-[11px]">
            {{ faceMessage
            }}<template v-if="faceArea.confidence">
              · {{ Math.round(faceArea.confidence * 100) }}%</template
            >
          </p>
        </div>
      </div>
    </div>
    <p
      v-if="isReady"
      class="text-center text-xs font-bold"
      :class="quality?.passed ? 'text-mint-600' : 'text-[#80620f]'"
    >
      {{ qualityMessage }}
    </p>
  </div>
</template>
