<template>
  <div class="nav-bottom">
    <div 
      v-for="item in navItems" 
      :key="item.path" 
      class="nav-item"
      :class="{ active: isActive(item.path) }"
      @click="navigateTo(item.path)"
    >
      <div class="nav-icon">
        <component :is="item.icon" />
      </div>
      <div class="nav-text">{{ item.name }}</div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, ShoppingCart, Document, User } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const navItems = [
  { path: '/', name: '首页', icon: HomeFilled },
  { path: '/orders', name: '订单', icon: Document },
  { path: '/cart', name: '购物车', icon: ShoppingCart },
  { path: '/profile', name: '我的', icon: User }
]

const isActive = (path) => {
  return route.path === path
}

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.nav-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  z-index: 1000;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  cursor: pointer;
}

.nav-item.active {
  color: #ff6b00;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-text {
  font-size: 11px;
}
</style>