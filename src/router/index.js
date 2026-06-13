/***
 * Application router with authentication and role-based guards.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { layout: 'public' }
  },
  {
    path: '/rulebook',
    name: 'rulebook',
    component: () => import('@/views/RulebookView.vue'),
    meta: { layout: 'public' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { layout: 'auth', guestOnly: true }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/views/SignupView.vue'),
    meta: { layout: 'auth', guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard-government',
    component: () => import('@/views/DashboardGovernmentView.vue'),
    meta: { layout: 'dashboard', requiresAuth: true, roles: ['government', 'admin'] }
  },
  {
    path: '/dashboard/activity',
    name: 'dashboard-activity',
    component: () => import('@/views/DashboardActivityView.vue'),
    meta: { layout: 'dashboard', requiresAuth: true, roles: ['activity'] }
  },
  {
    path: '/dashboard/users',
    name: 'admin-users',
    component: () => import('@/views/AdminUsersView.vue'),
    meta: { layout: 'dashboard', requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/categories/:id',
    name: 'category-detail',
    component: () => import('@/views/CategoryDetailView.vue'),
    meta: { layout: 'dashboard', requiresAuth: true, roles: ['government', 'admin'] }
  },
  {
    path: '/activities/:id',
    name: 'activity-detail',
    component: () => import('@/views/ActivityDetailView.vue'),
    meta: { layout: 'dashboard', requiresAuth: true }
  },
  {
    path: '/users/:username',
    name: 'user-detail',
    component: () => import('@/views/UserDetailView.vue'),
    meta: { layout: 'dashboard', requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: { name: 'home' }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.guestOnly && auth.isAuthenticated) {
    if (auth.role === 'activity') return { name: 'dashboard-activity' }
    return { name: 'dashboard-government' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.roles && Array.isArray(to.meta.roles) && auth.role) {
    if (!to.meta.roles.includes(auth.role)) {
      if (auth.role === 'activity') return { name: 'dashboard-activity' }
      return { name: 'dashboard-government' }
    }
  }

  return true
})
