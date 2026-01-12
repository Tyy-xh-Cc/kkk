<template>
  <div class="nav-side">
    <div class="nav-header">
      <div class="logo">
        <el-icon class="logo-icon"><Shop /></el-icon>
        <span class="logo-text">蛋糕配送</span>
      </div>
    </div>
    
    <div class="nav-content">
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
    
    <div class="nav-footer">
      <div class="version-info">v1.0.0</div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, ShoppingCart, Document, User, Shop } from '@element-plus/icons-vue'

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
.nav-side {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  background: linear-gradient(180deg, #FF9500 0%, #FF6B00 100%);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.nav-header {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
}

.nav-content {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 15px 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 0 20px 20px 0;
  margin-right: 10px;
}

.nav-item:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.nav-item.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-icon {
  font-size: 22px;
  margin-right: 15px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3));
}

.nav-text {
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-item.active .nav-text {
  font-weight: 600;
}

/* 添加左侧指示器 */
.nav-indicator {
  position: absolute;
  left: 0;
  width: 4px;
  height: 60%;
  background: white;
  border-radius: 0 4px 4px 0;
  opacity: 0;
  transition: all 0.3s ease;
  transform: scaleY(0);
}

.nav-item.active .nav-indicator {
  opacity: 1;
  transform: scaleY(1);
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

.nav-footer {
  padding: 20px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-side {
    width: 200px;
  }
  
  .logo-text {
    font-size: 16px;
  }
  
  .nav-text {
    font-size: 14px;
  }
}
</style>