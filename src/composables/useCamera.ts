import { onBeforeUnmount, ref } from 'vue'

export interface CameraDevice {
  deviceId: string
  label: string
}

export interface FrameQuality {
  brightness: number
  blur: number
  brightnessStatus: 'good' | 'dark' | 'bright'
  blurStatus: 'good' | 'blurry'
  passed: boolean
}

export function useCamera() {
  const stream = ref<MediaStream | null>(null)
  const devices = ref<CameraDevice[]>([])
  const isReady = ref(false)
  const mirrored = ref(true)
  const error = ref('')

  async function refreshDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return devices.value
    const mediaDevices = await navigator.mediaDevices.enumerateDevices()
    devices.value = mediaDevices
      .filter((device) => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Kamera ${index + 1}`,
      }))
    return devices.value
  }

  async function startCamera(video: HTMLVideoElement, deviceId?: string) {
    stopCamera()
    error.value = ''

    if (!window.isSecureContext) {
      error.value = 'Kamera hanya dapat digunakan melalui HTTPS.'
      throw new Error(error.value)
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'Browser ini tidak mendukung akses kamera. Gunakan Chrome versi terbaru.'
      throw new Error(error.value)
    }

    try {
      const preferredConstraints: MediaStreamConstraints = {
        audio: false,
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'user' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      }
      const fallbackConstraints: MediaStreamConstraints = {
        audio: false,
        video: true,
      }
      let lastError: unknown
      for (const constraints of [preferredConstraints, fallbackConstraints]) {
        try {
          stream.value = await navigator.mediaDevices.getUserMedia(constraints)
          break
        } catch (reason) {
          lastError = reason
          if (reason instanceof DOMException && reason.name === 'NotAllowedError') throw reason
        }
      }
      if (!stream.value) throw lastError ?? new Error('Kamera tidak tersedia.')
      video.srcObject = stream.value
      video.playsInline = true
      await video.play()
      mirrored.value = stream.value.getVideoTracks()[0]?.getSettings().facingMode !== 'environment'
      isReady.value = true
      try {
        await refreshDevices()
      } catch {
        // Some mobile browsers allow the stream but restrict device enumeration.
      }
    } catch (reason) {
      const name = reason instanceof DOMException ? reason.name : ''
      const messages: Record<string, string> = {
        NotAllowedError: 'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini dan Chrome.',
        NotReadableError: 'Kamera sedang dipakai aplikasi lain atau diblokir sistem Android.',
        OverconstrainedError: 'Kamera HP tidak mendukung mode yang diminta. Coba kamera lain.',
        NotFoundError: 'Kamera tidak ditemukan pada perangkat ini.',
        SecurityError: 'Akses kamera diblokir oleh pengaturan keamanan browser/perangkat.',
      }
      error.value = messages[name] ?? 'Kamera tidak dapat digunakan. Tutup aplikasi lain yang memakai kamera lalu coba lagi.'
      stream.value?.getTracks().forEach((track) => track.stop())
      stream.value = null
      isReady.value = false
      throw reason
    }
  }

  function analyzeFrame(video: HTMLVideoElement): FrameQuality {
    if (!isReady.value || !video.videoWidth) throw new Error('Kamera belum siap.')
    const width = 160
    const height = Math.max(90, Math.round((video.videoHeight / video.videoWidth) * width))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Gagal menganalisis kualitas gambar.')
    context.drawImage(video, 0, 0, width, height)
    const pixels = context.getImageData(0, 0, width, height).data
    const grayscale = new Float32Array(width * height)
    let brightnessTotal = 0

    for (let pixel = 0, index = 0; pixel < pixels.length; pixel += 4, index += 1) {
      const luminance =
        pixels[pixel]! * 0.299 + pixels[pixel + 1]! * 0.587 + pixels[pixel + 2]! * 0.114
      grayscale[index] = luminance
      brightnessTotal += luminance
    }

    let laplacianTotal = 0
    let laplacianSquaredTotal = 0
    let sampleCount = 0
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = y * width + x
        const laplacian =
          4 * grayscale[index]! -
          grayscale[index - 1]! -
          grayscale[index + 1]! -
          grayscale[index - width]! -
          grayscale[index + width]!
        laplacianTotal += laplacian
        laplacianSquaredTotal += laplacian * laplacian
        sampleCount += 1
      }
    }

    const brightness = brightnessTotal / grayscale.length
    const laplacianMean = laplacianTotal / sampleCount
    const blur = laplacianSquaredTotal / sampleCount - laplacianMean * laplacianMean
    const minimumBrightness = Number(import.meta.env.VITE_PRECHECK_MIN_BRIGHTNESS || 40)
    const maximumBrightness = Number(import.meta.env.VITE_PRECHECK_MAX_BRIGHTNESS || 220)
    const minimumBlur = Number(import.meta.env.VITE_PRECHECK_MIN_BLUR || 35)
    const brightnessStatus =
      brightness < minimumBrightness ? 'dark' : brightness > maximumBrightness ? 'bright' : 'good'
    const blurStatus = blur < minimumBlur ? 'blurry' : 'good'

    return {
      brightness: Math.round(brightness),
      blur: Math.round(blur),
      brightnessStatus,
      blurStatus,
      passed: brightnessStatus === 'good' && blurStatus === 'good',
    }
  }

  function captureFrame(video: HTMLVideoElement) {
    if (!isReady.value || !video.videoWidth) throw new Error('Kamera belum siap.')
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Gagal menyiapkan gambar.')
    if (mirrored.value) {
      context.translate(canvas.width, 0)
      context.scale(-1, 1)
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL(
      import.meta.env.VITE_CAPTURE_FORMAT || 'image/jpeg',
      Number(import.meta.env.VITE_CAPTURE_QUALITY || 0.88),
    )
  }

  function stopCamera() {
    stream.value?.getTracks().forEach((track) => track.stop())
    stream.value = null
    isReady.value = false
    mirrored.value = true
  }

  onBeforeUnmount(stopCamera)
  return {
    stream,
    devices,
    isReady,
    mirrored,
    error,
    refreshDevices,
    startCamera,
    analyzeFrame,
    captureFrame,
    stopCamera,
  }
}
