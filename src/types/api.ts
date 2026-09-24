export interface ApiEnvelope<T> {
  success: boolean
  code: string
  message: string
  data: T
  errors: unknown
  meta: Record<string, unknown> | null
  timestamp_utc: string
}

export interface Employee {
  id: number
  name: string
  barcode?: string | null
  work_email?: string | null
  user_id?: number | null
}

export interface LoginData {
  uid: number
  username: string
  name: string
  access_token: string
  token_type: string
  expires_in: number
  odoo_base_url: string
  odoo_db: string
  employee_resolved: boolean
  employee_map_id: number | null
  employee: Employee | null
  user_context?: { lang?: string; tz?: string }
  is_hr_admin?: boolean
  employee_error?: string | null
}

export interface AttendanceRequest {
  event_id: string
  device_code?: string
  image_base64: string
  latitude: number
  longitude: number
  gps_accuracy_meters: number
  gps_provider: 'browser'
}

export interface AttendanceResult {
  attempt_id: number
  event_id?: string
  action: 'checkin' | 'checkout'
  matched: boolean
  employee_id: string | null
  similarity: number
  quality_score: number
  embedding_provider: 'visual' | 'onnx'
  odoo_sync_status: string | null
  odoo_attendance_id: string | null
  status: string
  latitude: number | null
  longitude: number | null
  gps_accuracy_meters: number | null
  created_at?: string
}

export interface EnrollmentStatus {
  enrollment_id?: number
  employee_id: string
  employee_name?: string
  status: 'pending' | 'in_progress' | 'completed'
  total_samples?: number
  accepted_samples?: number
  is_enrolled?: boolean
}

export interface EnrollmentSample {
  sample_id: number
  accepted: boolean
  reason_codes: string[]
  blur_score: number
  brightness_score: number
  face_count: number
  detector_confidence: number
}

export interface ListData<T> {
  items: T[]
  total: number
}

export interface TimeOffType {
  id: number
  name: string
  requires_allocation?: boolean
}

export interface TimeOffItem {
  id: number
  name?: string
  leave_type?: string
  holiday_status_id?: number | [number, string]
  date_from: string
  date_to: string
  state: string
  number_of_days?: number
  description?: string
}

export interface OvertimeItem {
  id: number
  date: string
  duration_hours: number
  state?: string
  description?: string
}

export interface PayslipItem {
  id: number
  name: string
  date_from: string
  date_to: string
  state: string
  net_wage?: number
}
