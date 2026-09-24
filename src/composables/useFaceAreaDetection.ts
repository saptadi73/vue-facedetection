import { onBeforeUnmount, ref } from 'vue'
import {
  FaceDetector,
  FilesetResolver,
  type BoundingBox,
  type FaceDetectorResult,
} from '@mediapipe/tasks-vision'

export type FaceAreaStatus =
  'loading' | 'ready' | 'no-face' | 'multiple' | 'too-small' | 'outside' | 'unavailable'

export interface FaceAreaResult {
  status: FaceAreaStatus
  faceCount: number
  confidence: number
  boundingBox: BoundingBox | null
  passed: boolean
}

const emptyResult = (status: FaceAreaStatus): FaceAreaResult => ({
  status,
  faceCount: 0,
  confidence: 0,
  boundingBox: null,
  passed: false,
})

export function useFaceAreaDetection() {
  const result = ref<FaceAreaResult>(emptyResult('loading'))
  const error = ref('')
  let detector: FaceDetector | null = null
  let initializing: Promise<void> | null = null

  async function initialize() {
    if (detector) return
    if (initializing) return initializing

    initializing = (async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL
        const vision = await FilesetResolver.forVisionTasks(`${baseUrl}mediapipe/wasm`)
        detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `${baseUrl}mediapipe/blaze_face_short_range.tflite`,
          },
          runningMode: 'VIDEO',
          minDetectionConfidence: Number(import.meta.env.VITE_FACE_MIN_CONFIDENCE || 0.6),
          minSuppressionThreshold: 0.3,
        })
        result.value = emptyResult('no-face')
      } catch (reason) {
        error.value = reason instanceof Error ? reason.message : 'Detector wajah gagal dimuat.'
        result.value = emptyResult('unavailable')
        throw reason
      } finally {
        initializing = null
      }
    })()

    return initializing
  }

  function detect(video: HTMLVideoElement) {
    if (!detector || !video.videoWidth || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return result.value
    }

    let detectionResult: FaceDetectorResult
    try {
      detectionResult = detector.detectForVideo(video, performance.now())
    } catch {
      return result.value
    }

    const detections = detectionResult.detections.filter((detection) => detection.boundingBox)
    if (!detections.length) {
      result.value = emptyResult('no-face')
      return result.value
    }
    if (detections.length > 1) {
      result.value = { ...emptyResult('multiple'), faceCount: detections.length }
      return result.value
    }

    const detection = detections[0]!
    const box = detection.boundingBox!
    const normalized = {
      left: box.originX / video.videoWidth,
      top: box.originY / video.videoHeight,
      width: box.width / video.videoWidth,
      height: box.height / video.videoHeight,
    }
    const centerX = normalized.left + normalized.width / 2
    const centerY = normalized.top + normalized.height / 2
    const minimumWidth = Number(import.meta.env.VITE_FACE_MIN_WIDTH_RATIO || 0.24)
    const minimumHeight = Number(import.meta.env.VITE_FACE_MIN_HEIGHT_RATIO || 0.28)
    const guide = { left: 0.16, right: 0.84, top: 0.225, bottom: 0.775 }
    const confidence = detection.categories[0]?.score ?? 0
    const tooSmall = normalized.width < minimumWidth || normalized.height < minimumHeight
    const outside =
      centerX < guide.left || centerX > guide.right || centerY < guide.top || centerY > guide.bottom
    const status: FaceAreaStatus = tooSmall ? 'too-small' : outside ? 'outside' : 'ready'

    result.value = {
      status,
      faceCount: 1,
      confidence,
      boundingBox: box,
      passed: status === 'ready',
    }
    return result.value
  }

  function reset() {
    result.value = emptyResult(detector ? 'no-face' : 'loading')
    error.value = ''
  }

  onBeforeUnmount(() => {
    detector?.close()
    detector = null
  })

  return { result, error, initialize, detect, reset }
}
