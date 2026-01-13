<template>
  <div class="welcome-page">
    <!-- 欢迎动画 -->
    <div class="welcome-animation">
      <div class="confetti"></div>
      <div class="confetti"></div>
      <div class="confetti"></div>
      <div class="confetti"></div>
      <div class="confetti"></div>
    </div>

    <!-- 欢迎内容 -->
    <div class="welcome-content">
      <div class="welcome-icon">
        <el-icon><CircleCheck /></el-icon>
      </div>
      <h1 class="welcome-title">注册成功！</h1>
      <p class="welcome-subtitle">欢迎加入外卖平台</p>

      <!-- 新用户福利 -->
      <div class="welcome-benefits">
        <div class="benefit-item">
          <div class="benefit-icon">
            <el-icon><Discount /></el-icon>
          </div>
          <div class="benefit-content">
            <div class="benefit-title">新人专属优惠券</div>
            <div class="benefit-desc">¥20无门槛优惠券已到账</div>
          </div>
        </div>

        <div class="benefit-item">
          <div class="benefit-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="benefit-content">
            <div class="benefit-title">会员成长体系</div>
            <div class="benefit-desc">下单积分，升级享更多权益</div>
          </div>
        </div>

        <div class="benefit-item">
          <div class="benefit-icon">
            <el-icon><Gift /></el-icon>
          </div>
          <div class="benefit-content">
            <div class="benefit-title">生日特权</div>
            <div class="benefit-desc">生日月享专属礼包</div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="welcome-actions">
        <el-button
          type="primary"
          size="large"
          @click="goToHome"
          class="start-btn"
        >
          开始点餐
        </el-button>
      </div>

      <!-- 提示 -->
      <div class="welcome-tips">
        <div class="tip-item">
          <el-icon><InfoFilled /></el-icon>
          <span>完善个人信息可享更多优惠</span>
        </div>
        <div class="tip-item">
          <el-icon><InfoFilled /></el-icon>
          <span>首次下单可享新人专享价</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  CircleCheck, Discount, Star, InfoFilled 
} from '@element-plus/icons-vue'

const router = useRouter()

// 跳转到首页
const goToHome = () => {
  router.push('/')
}
// 自动跳转（可选）
onMounted(() => {
  setTimeout(() => {
    router.push('/')
  }, 5000)
})
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.welcome-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #ff6b00;
  animation: confetti-fall 3s linear infinite;
}

.confetti:nth-child(1) {
  left: 10%;
  animation-delay: 0s;
  background: #ff6b00;
}

.confetti:nth-child(2) {
  left: 20%;
  animation-delay: 0.5s;
  background: #52c41a;
}

.confetti:nth-child(3) {
  left: 30%;
  animation-delay: 1s;
  background: #1890ff;
}

.confetti:nth-child(4) {
  left: 40%;
  animation-delay: 1.5s;
  background: #faad14;
}

.confetti:nth-child(5) {
  left: 50%;
  animation-delay: 2s;
  background: #722ed1;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.welcome-content {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
}

.welcome-title {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.welcome-subtitle {
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #666;
}

.welcome-benefits {
  margin: 30px 0;
  text-align: left;
}

.benefit-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #ff6b00;
}

.benefit-item:last-child {
  margin-bottom: 0;
}

.benefit-icon {
  width: 40px;
  height: 40px;
  margin-right: 15px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b00;
  font-size: 20px;
  flex-shrink: 0;
}

.benefit-content {
  flex: 1;
}

.benefit-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.benefit-desc {
  font-size: 14px;
  color: #666;
}

.welcome-actions {
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.start-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
  border: none;
}

.benefits-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #dcdcdc;
}

.welcome-tips {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.tip-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.tip-item:last-child {
  margin-bottom: 0;
}

.tip-item .el-icon {
  margin-right: 8px;
  font-size: 12px;
  color: #ff6b00;
}
</style>