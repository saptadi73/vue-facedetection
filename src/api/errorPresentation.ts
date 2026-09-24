import { ApiError } from './client'
import type { ToastVariant } from '@/stores/toast'

export type ApiErrorKind = 'validation' | 'not-found' | 'conflict' | 'server' | 'network' | 'local'

export interface ApiErrorPresentation {
  kind: ApiErrorKind
  title: string
  message: string
  variant: ToastVariant
  retryable: boolean
  showHistory: boolean
  requestId?: string
}

const attendanceMessages: Record<string, string> = {
  INVALID_FACE_COUNT: 'Pastikan hanya wajah Anda yang terlihat di kamera.',
  LOW_DETECTION_CONFIDENCE: 'Wajah belum terlihat jelas. Hadap kamera dan coba kembali.',
  YAW_OUT_OF_RANGE: 'Posisi wajah terlalu menoleh. Hadapkan wajah lurus ke kamera.',
  PITCH_OUT_OF_RANGE: 'Posisi wajah terlalu menunduk atau mendongak.',
  ROLL_OUT_OF_RANGE: 'Kepala terlalu miring. Tegakkan kepala lalu coba kembali.',
  BLUR_TOO_LOW: 'Foto kurang tajam. Tahan perangkat agar tidak bergerak.',
  IMAGE_TOO_DARK: 'Pencahayaan terlalu gelap. Cari tempat yang lebih terang.',
  IMAGE_TOO_BRIGHT: 'Pencahayaan terlalu terang. Hindari cahaya langsung.',
  VALIDATION_ERROR: 'Data presensi belum lengkap atau formatnya tidak sesuai.',
  EMPLOYEE_NOT_FOUND: 'Data employee tidak ditemukan. Hubungi HR untuk memeriksa akun Anda.',
  ATTENDANCE_DUPLICATE: 'Presensi serupa sudah tercatat. Periksa riwayat sebelum mencoba lagi.',
  ATTENDANCE_EVENT_ACTION_MISMATCH:
    'Permintaan ini sudah dipakai untuk aktivitas berbeda. Muat ulang halaman sebelum mencoba lagi.',
}

export function presentAttendanceError(reason: unknown): ApiErrorPresentation {
  if (!(reason instanceof ApiError)) {
    return {
      kind: 'local',
      title: 'Periksa kamera dan lokasi',
      message: reason instanceof Error ? reason.message : 'Data presensi belum siap.',
      variant: 'warning',
      retryable: false,
      showHistory: false,
    }
  }

  const mappedMessage = (reason.code && attendanceMessages[reason.code]) || reason.message
  if (reason.retriable) {
    return {
      kind: 'network',
      title: 'Koneksi terputus',
      message:
        'Permintaan belum mendapat jawaban setelah dua kali percobaan. Periksa koneksi lalu coba lagi.',
      variant: 'error',
      retryable: true,
      showHistory: false,
      requestId: reason.requestId,
    }
  }
  if (reason.status === 422) {
    return {
      kind: 'validation',
      title: 'Foto belum memenuhi syarat',
      message: mappedMessage,
      variant: 'warning',
      retryable: false,
      showHistory: false,
      requestId: reason.requestId,
    }
  }
  if (reason.status === 404) {
    return {
      kind: 'not-found',
      title: 'Data tidak ditemukan',
      message: mappedMessage,
      variant: 'warning',
      retryable: false,
      showHistory: false,
      requestId: reason.requestId,
    }
  }
  if (reason.status === 409) {
    return {
      kind: 'conflict',
      title: 'Presensi sudah tercatat',
      message: mappedMessage,
      variant: 'info',
      retryable: false,
      showHistory: true,
      requestId: reason.requestId,
    }
  }
  if (reason.status && reason.status >= 500) {
    return {
      kind: 'server',
      title: 'Layanan sedang bermasalah',
      message: 'Server belum dapat memproses presensi. Coba kembali dengan Event ID yang sama.',
      variant: 'error',
      retryable: true,
      showHistory: false,
      requestId: reason.requestId,
    }
  }
  return {
    kind: 'server',
    title: 'Presensi belum dapat diproses',
    message: mappedMessage,
    variant: 'error',
    retryable: false,
    showHistory: false,
    requestId: reason.requestId,
  }
}
