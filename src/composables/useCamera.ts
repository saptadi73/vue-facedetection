import { onBeforeUnmount, ref } from 'vue'

export function useCamera() {
  const stream = ref<MediaStream | null>(null)
  const isReady = ref(false)
  const error = ref('')

  async function startCamera(video: HTMLVideoElement, deviceId?: string) {
    stopCamera()
    error.value = ''
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          facingMode: deviceId ? undefined : { ideal: 'user' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      video.srcObject = stream.value
      video.playsInline = true
      await video.play()
      isReady.value = true
    } catch (reason) {
      error.value =
        reason instanceof DOMException && reason.name === 'NotAllowedError'
          ? 'Izin kamera ditolak. Aktifkan kamera dari pengaturan browser.'
          : 'Kamera tidak dapat digunakan. Pastikan tidak dipakai aplikasi lain.'
      throw reason
    }
  }

  function captureFrame(video: HTMLVideoElement) {
    if (!isReady.value || !video.videoWidth) throw new Error('Kamera belum siap.')
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Gagal menyiapkan gambar.')
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
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
  }

  onBeforeUnmount(stopCamera)
  return { stream, isReady, error, startCamera, captureFrame, stopCamera }
}
