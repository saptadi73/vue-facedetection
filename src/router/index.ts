import { createRouter, createWebHistory } from 'vue-router'
import { AUTH_TOKEN_KEY } from '@/api/client'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppShell.vue'),
      children: [
        { path: '', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
        {
          path: 'attendance',
          name: 'attendance',
          component: () => import('@/views/AttendanceView.vue'),
        },
        {
          path: 'enrollment',
          name: 'enrollment',
          component: () => import('@/views/EnrollmentView.vue'),
        },
        { path: 'history', name: 'history', component: () => import('@/views/HistoryView.vue') },
        { path: 'time-off', name: 'time-off', component: () => import('@/views/TimeOffView.vue') },
        { path: 'overtime', name: 'overtime', component: () => import('@/views/OvertimeView.vue') },
        { path: 'payslips', name: 'payslips', component: () => import('@/views/PayslipsView.vue') },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const authenticated = Boolean(sessionStorage.getItem(AUTH_TOKEN_KEY))
  if (!to.meta.public && !authenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.name === 'login' && authenticated) return { name: 'dashboard' }
})

export default router
