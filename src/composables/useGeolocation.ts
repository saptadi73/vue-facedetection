import { computed, ref } from 'vue'

export interface LocationCoords {
  latitude: number
  longitude: number
  accuracy: number
}

export function useGeolocation() {
  const coords = ref<LocationCoords | null>(null)
  const loading = ref(false)
  const error = ref('')

  const quality = computed(() => {
    if (!coords.value) return 'unknown'
    if (coords.value.accuracy <= 20) return 'good'
    if (coords.value.accuracy <= 50) return 'fair'
    return 'poor'
  })

  function requestLocation() {
    loading.value = true
    error.value = ''
    return new Promise<LocationCoords>((resolve, reject) => {
      if (!navigator.geolocation) {
        const reason = new Error('Browser ini tidak mendukung GPS.')
        error.value = reason.message
        loading.value = false
        reject(reason)
        return
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          coords.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          loading.value = false
          resolve(coords.value)
        },
        (reason) => {
          error.value =
            reason.code === reason.PERMISSION_DENIED
              ? 'Izin lokasi ditolak. Aktifkan lokasi untuk melakukan presensi.'
              : reason.code === reason.TIMEOUT
                ? 'GPS belum mendapat lokasi. Coba lagi di area terbuka.'
                : 'Lokasi tidak dapat diperoleh.'
          loading.value = false
          reject(new Error(error.value))
        },
        {
          enableHighAccuracy:
            String(import.meta.env.VITE_GEOLOCATION_ENABLE_HIGH_ACCURACY) !== 'false',
          timeout: Number(import.meta.env.VITE_GEOLOCATION_TIMEOUT_MS || 10000),
          maximumAge: 0,
        },
      )
    })
  }

  function clearLocation() {
    coords.value = null
    error.value = ''
  }

  return { coords, loading, error, quality, requestLocation, clearLocation }
}
