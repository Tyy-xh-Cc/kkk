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
      <div class="nav-indicator"></div>
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
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  padding: 4px 0;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  color: #999;
}

.nav-item:hover {
  color: #ff6b00;
  transform: translateY(-2px);
}

.nav-item.active {
  color: #ff6b00;
}

.nav-icon {
  font-size: 26px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(255, 107, 0, 0.3));
}

.nav-text {
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-item.active .nav-text {
  font-weight: 600;
}

/* 添加底部指示器 */
.nav-indicator {
  position: absolute;
  bottom: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #FF9500 0%, #FF6B00 100%);
  border-radius: 3px 3px 0 0;
  opacity: 0;
  transition: all 0.3s ease;
  transform: scaleX(0);
}

.nav-item.active .nav-indicator {
  opacity: 1;
  transform: scaleX(1);
}

/* 购物车图标特殊处理 */
.nav-item:nth-child(3) .nav-icon {
  position: relative;
}

/* 添加脉冲效果 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.nav-item.active .nav-icon {
  animation: pulse 0.3s ease;
}
</style>