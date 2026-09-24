# MediaPipe Face Detector Assets

Runtime WASM berasal dari package `@mediapipe/tasks-vision` versi yang dikunci di
`package-lock.json`.

Model `blaze_face_short_range.tflite` berasal dari MediaPipe Models:

`https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite`

Asset disimpan lokal agar face-area precheck tidak bergantung pada CDN saat runtime.
Quality gate final tetap dilakukan oleh backend.
