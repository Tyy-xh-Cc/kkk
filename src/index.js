// src/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 导入组件
import Dashboard from './Dashboard.vue'
import Login from './Login.vue'
import Layout from './Layout.vue'
import Index from './Index.vue' // 配送员管理
import Restaurant from './Restaurant.vue' // 餐厅管理
import Product from './Product.vue' // 商品管理
import Order from './Order.vue' // 订单管理
import User from './User.vue' // 用户管理

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表盘' }
      },
      {
        path: 'delivery',
        name: 'DeliveryManagement',
        component: Index,
        meta: { title: '配送员管理' }
      },
      {
        path: 'restaurant',
        name: 'RestaurantManagement',
        component: Restaurant,
        meta: { title: '餐厅管理' }
      },
      {
        path: 'product',
        name: 'ProductManagement',
        component: Product,
        meta: { title: '商品管理' }
      },
      {
        path: 'order',
        name: 'OrderManagement',
        component: Order,
        meta: { title: '订单管理' }
      },
      {
        path: 'user',
        name: 'UserManagement',
        component: User,
        meta: { title: '用户管理' }
      }
    ]
  },
  // 404 路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: Index,
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !token) {
    ElMessage.warning('请先登录')
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router