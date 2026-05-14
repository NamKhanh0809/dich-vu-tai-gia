import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ComplaintView from '@/pages/ComplaintView.vue'
import WorkerRegisterView from '@/pages/WorkerRegisterView.vue';
const routes = [
  { path: '/', name: 'Home', component: () => import('@/pages/HomeView.vue') },
  { path: '/services', name: 'Services', component: () => import('@/pages/ServicesView.vue') },
  { path: '/services/:id', name: 'ServiceDetail', component: () => import('@/pages/ServiceDetailView.vue') },
  { path: '/price', name: 'Price', component: () => import('@/pages/PriceView.vue') },
  { path: '/login', name: 'Login', component: () => import('@/pages/LoginView.vue') },
  { path: '/register', name: 'Register', component: () => import('@/pages/RegisterView.vue') },
  { path: '/worker-register', name: 'WorkerRegister', component: () => import('@/pages/WorkerRegisterView.vue') },
  { path: '/apply', name: 'WorkerApply', component: () => import('@/pages/WorkerApplyView.vue') },
  
  {
  path: '/worker-register',
  name: 'WorkerRegister',
  component: WorkerRegisterView
},
  // Complaint route (thêm vào)
  { path: '/complaint', name: 'Complaint', component: ComplaintView, meta: { requiresAuth: true } },

  // Customer area
  {
    path: '/booking',
    name: 'Booking',
    component: () => import('@/pages/BookingView.vue'),
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/my-orders',
    name: 'MyOrders',
    component: () => import('@/pages/customer/MyOrders.vue'),
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/my-orders/:id',
    name: 'OrderDetail',
    component: () => import('@/pages/customer/OrderDetail.vue'),
    meta: { requiresAuth: true, role: 'customer' },
  },
  {
    path: '/address-book',
    name: 'AddressBook',
    component: () => import('@/pages/customer/AddressBook.vue'),
    meta: { requiresAuth: true, role: 'customer' },
  },

  // Worker area
  {
    path: '/worker/incoming',
    name: 'IncomingJobs',
    component: () => import('@/pages/worker/IncomingJobs.vue'),
    meta: { requiresAuth: true, role: 'worker' },
  },
  {
    path: '/worker/history',
    name: 'WorkHistory',
    component: () => import('@/pages/worker/WorkHistory.vue'),
    meta: { requiresAuth: true, role: 'worker' },
  },

  // Admin area
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/pages/admin/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/pages/admin/Users.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/worker-approvals',
    name: 'WorkerApprovals',
    component: () => import('@/pages/admin/WorkerApprovals.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/services',
    name: 'AdminServices',
    component: () => import('@/pages/admin/ServicesManage.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/orders/pending',
    name: 'OrdersPending',
    component: () => import('@/pages/admin/OrdersPending.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/complaints',
    name: 'Complaints',
    component: () => import('@/pages/admin/Complaints.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/reports',
    name: 'Reports',
    component: () => import('@/pages/admin/Reports.vue'),
    meta: { requiresAuth: true, role: 'admin' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = !!authStore.token
  const userRole = authStore.user?.role

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.meta.role && userRole !== to.meta.role) {
    next({ path: '/' })
  } else {
    next()
  }
})

export default router