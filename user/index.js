import { createRouter, createWebHistory } from 'vue-router'

import Home from './views/home.vue'
import Login from './views/LoginView.vue'
import Register from './views/RegisterView.vue'
import ForgotPassword from './views/ForgotPasswordView.vue'
import Welcome from './views/WelcomeView.vue'
import Cart from './views/CartView.vue'
import Orders from './views/OrderListView.vue'
import Profile from './views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { } // 只有未登录用户才能访问
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { guestOnly: true }
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome,
    meta: { requiresAuth: true } // 需要登录才能访问
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isGuest = localStorage.getItem('is_guest') === 'true'

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (!token && !isGuest) {
      // 未登录，重定向到登录页
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
  // 只有未登录用户才能访问的页面
  else if (to.meta.guestOnly) {
    if (token || isGuest) {
      // 已登录，重定向到首页
      next({ path: '/' })
    } else {
      next()
    }
  }
  // 其他页面
  else {
    next()
  }
})

export default router