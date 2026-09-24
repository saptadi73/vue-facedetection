import { apiClient, unwrap, withNetworkRetry } from './client'
import type {
  ApiEnvelope,
  AttendanceRequest,
  AttendanceResult,
  EnrollmentSample,
  EnrollmentStatus,
  ListData,
  LoginData,
  OvertimeItem,
  PayslipItem,
  TimeOffItem,
  TimeOffType,
} from '@/types/api'

export const authApi = {
  login: (payload: {
    username: string
    password: string
    odoo_base_url?: string
    odoo_db?: string
  }) => unwrap<LoginData>(apiClient.post('/api/v1/auth/login', payload)),
}

export const attendanceApi = {
  submit: (action: 'checkin' | 'checkout', payload: AttendanceRequest) =>
    unwrap<AttendanceResult>(
      withNetworkRetry(() => apiClient.post(`/api/v1/attendance/${action}`, payload)),
    ),
  history: (employeeId?: string, limit = 30) =>
    unwrap<ListData<AttendanceResult>>(
      apiClient.get('/api/v1/attendance/history', {
        params: { employee_id: employeeId || undefined, limit },
      }),
    ),
}

export const enrollmentApi = {
  status: (employeeId: string) =>
    unwrap<EnrollmentStatus>(apiClient.get(`/api/v1/face/enroll/${employeeId}`)),
  start: (payload: { employee_id: string; employee_name: string; employee_code?: string }) =>
    unwrap<EnrollmentStatus>(apiClient.post('/api/v1/face/enroll/start', payload)),
  sample: (employeeId: string, imageBase64: string) =>
    unwrap<EnrollmentSample>(
      withNetworkRetry(() =>
        apiClient.post('/api/v1/face/enroll/sample', {
          employee_id: employeeId,
          image_base64: imageBase64,
        }),
      ),
    ),
  finish: (employeeId: string) =>
    unwrap<EnrollmentStatus & { templates_created: number; embedding_provider: string }>(
      apiClient.post('/api/v1/face/enroll/finish', { employee_id: employeeId }),
    ),
}

export const hrApi = {
  timeOffTypes: () => unwrap<ListData<TimeOffType>>(apiClient.get('/api/v1/hr/timeoff/types')),
  timeOff: (employeeId: number) =>
    unwrap<ListData<TimeOffItem>>(
      apiClient.get('/api/v1/hr/timeoff', { params: { employee_id: employeeId } }),
    ),
  createTimeOff: (payload: Record<string, unknown>) =>
    unwrap<TimeOffItem>(apiClient.post('/api/v1/hr/timeoff', payload)),
  cancelTimeOff: (id: number) =>
    unwrap<TimeOffItem>(apiClient.post(`/api/v1/hr/timeoff/${id}/cancel`)),
  overtime: (employeeId: number) =>
    unwrap<ListData<OvertimeItem>>(
      apiClient.get('/api/v1/hr/overtime', { params: { employee_id: employeeId } }),
    ),
  createOvertime: (payload: Record<string, unknown>) =>
    unwrap<OvertimeItem>(apiClient.post('/api/v1/hr/overtime', payload)),
  payslips: (employeeId: number) =>
    unwrap<ListData<PayslipItem>>(
      apiClient.get('/api/v1/hr/payroll/payslips', { params: { employee_id: employeeId } }),
    ),
  payslipPdf: async (id: number) => {
    const response = await apiClient.get<Blob>(`/api/v1/hr/payroll/payslips/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },
}

export type { ApiEnvelope }
