<template>
  <div class="payment-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <h1>订单支付</h1>
    </div>

    <!-- 订单信息 -->
    <div class="order-info-section">
      <div class="section-title">订单信息</div>
      <div class="order-info">
        <div class="info-item">
          <span class="label">订单编号:</span>
          <span class="value">{{ order.orderId }}</span>
        </div>
        <div class="info-item">
          <span class="label">餐厅名称:</span>
          <span class="value">{{ order.restaurantName }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付金额:</span>
          <span class="value amount">¥{{ (order.finalAmount || 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- 支付方式选择 -->
    <div class="payment-methods-section">
      <div class="section-title">选择支付方式</div>
      <div class="payment-methods">
        <div 
          v-for="method in paymentMethods" 
          :key="method.id" 
          class="payment-method-item"
          :class="{ active: selectedPaymentMethod === method.id }"
          @click="selectPaymentMethod(method.id)"
        >
          <div class="method-content">
            <div class="method-icon">
              <el-icon><component :is="method.icon" /></el-icon>
            </div>
            <div class="method-info">
              <div class="method-name">{{ method.name }}</div>
              <div class="method-desc">{{ method.description }}</div>
            </div>
            <el-icon v-if="selectedPaymentMethod === method.id" class="method-check">
              <Check />
            </el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付提示 -->
    <div class="payment-notice">
      <el-alert
        title="支付提示"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <div>
            <p>1. 支付成功后，订单将自动更新状态</p>
            <p>2. 若支付后订单状态未更新，请联系客服</p>
            <p>3. 支付超时时间：30分钟</p>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 底部支付栏 -->
    <div class="payment-bar">
      <div class="price-info">
        <div class="total-price">¥{{ (order.finalAmount || 0).toFixed(2) }}</div>
        <div class="detail" v-if="(order.discountAmount || 0) > 0">
          已优惠¥{{ (order.discountAmount || 0).toFixed(2) }}
        </div>
      </div>
      <el-button 
        type="primary" 
        size="large" 
        @click="confirmPayment" 
        :loading="isProcessing"
        :disabled="!selectedPaymentMethod"
      >
        {{ isProcessing ? '支付中...' : '立即支付' }}
      </el-button>
    </div>

    <!-- 支付结果弹窗 -->
    <el-dialog
      v-model="showResultDialog"
      title="支付结果"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="result-content">
        <div class="result-icon" :class="paymentResult">
          <el-icon v-if="paymentResult === 'success'"><CircleCheck /></el-icon>
          <el-icon v-else><CircleClose /></el-icon>
        </div>
        <div class="result-text">
          <h3>{{ paymentResult === 'success' ? '支付成功' : '支付失败' }}</h3>
          <p>{{ paymentResult === 'success' ? '订单支付成功，正在为您处理订单...' : paymentErrorMessage }}</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button 
            v-if="paymentResult === 'success'" 
            type="primary" 
            @click="goToOrderDetail"
          >
            查看订单
          </el-button>
          <el-button 
            v-else 
            type="primary" 
            @click="retryPayment"
          >
            重新支付
          </el-button>
          <el-button @click="goToOrderList">返回订单列表</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, Check, CircleCheck, CircleClose, CreditCard, Wallet 
} from '@element-plus/icons-vue'
import api from '../api/index'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id

// 数据定义
const order = ref({
  orderId: '',
  restaurantName: '',
  finalAmount: 0,
  discountAmount: 0
})
const selectedPaymentMethod = ref('alipay')
const isProcessing = ref(false)
const showResultDialog = ref(false)
const paymentResult = ref('') // 'success' or 'error'
const paymentErrorMessage = ref('')

// 支付方式列表
const paymentMethods = ref([
  {
    id: 'alipay',
    name: '支付宝',
    description: '推荐使用支付宝App扫码支付',
    icon: Qrcode
  },
  {
    id: 'wechat',
    name: '微信支付',
    description: '推荐使用微信App扫码支付',
    icon: Qrcode
  },
  {
    id: 'credit_card',
    name: '银行卡支付',
    description: '支持国内外主要银行卡',
    icon: CreditCard
  },
  {
    id: 'wallet',
    name: '余额支付',
    description: '使用账户余额支付',
    icon: Wallet
  }
])

// 获取订单详情
const getOrderDetail = async () => {
  try {
    const res = await api.order.getOrderDetail(orderId)
    if (res.data) {
      order.value = res.data
    } else {
      ElMessage.error('订单不存在')
      router.back()
    }
  } catch (error) {
    ElMessage.error('获取订单详情失败')
    router.back()
  }
}

// 选择支付方式
const selectPaymentMethod = (methodId) => {
  selectedPaymentMethod.value = methodId
}

// 确认支付
const confirmPayment = async () => {
  try {
    isProcessing.value = true
    
    // 调用支付API
    const res = await api.payment.createPayment({
      order_id: orderId,
      amount: order.value.finalAmount,
      payment_method: selectedPaymentMethod.value
    })
    
    // 模拟支付处理过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (res.success) {
      // 支付成功
      paymentResult.value = 'success'
      showResultDialog.value = true
      ElMessage.success('支付成功')
    } else {
      // 支付失败
      paymentResult.value = 'error'
      paymentErrorMessage.value = res.message || '支付失败，请稍后重试'
      showResultDialog.value = true
    }
  } catch (error) {
    console.error('支付失败:', error)
    paymentResult.value = 'error'
    paymentErrorMessage.value = '支付失败，请稍后重试'
    showResultDialog.value = true
  } finally {
    isProcessing.value = false
  }
}

// 重新支付
const retryPayment = () => {
  showResultDialog.value = false
  paymentResult.value = ''
  paymentErrorMessage.value = ''
}

// 跳转到订单详情
const goToOrderDetail = () => {
  router.push(`/order/${orderId}`)
}

// 跳转到订单列表
const goToOrderList = () => {
  router.push('/orders')
}

// 初始化
onMounted(() => {
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    router.back()
    return
  }
  getOrderDetail()
})
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
  color: white;
  border-bottom: none;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.back-btn .el-icon {
  color: white;
  font-size: 18px;
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin: 20px 0 15px 0;
  padding: 0 20px;
  color: #333;
}

.order-info-section {
  background: white;
  margin: 0 20px;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.order-info {
  background-color: #f7f8fa;
  padding: 15px;
  border-radius: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #606266;
  font-size: 14px;
}

.info-item .value {
  font-weight: 500;
  font-size: 14px;
}

.info-item .value.amount {
  color: #ff6b00;
  font-size: 18px;
  font-weight: bold;
}

.payment-methods-section {
  background: white;
  margin: 20px;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-method-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method-item:hover {
  border-color: #409eff;
}

.payment-method-item.active {
  border-color: #67c23a;
  background-color: #f0f9eb;
}

.method-content {
  display: flex;
  align-items: center;
  padding: 15px;
}

.method-icon {
  font-size: 24px;
  margin-right: 15px;
  color: #409eff;
}

.method-info {
  flex: 1;
}

.method-name {
  font-weight: 500;
  margin-bottom: 5px;
  font-size: 16px;
}

.method-desc {
  font-size: 12px;
  color: #909399;
}

.method-check {
  color: #67c23a;
  font-size: 20px;
}

.payment-notice {
  margin: 20px;
}

.payment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  z-index: 100;
}

.price-info {
  text-align: left;
}

.total-price {
  font-size: 20px;
  color: #ff6b00;
  font-weight: bold;
}

.detail {
  font-size: 12px;
  color: #999;
}

.payment-bar .el-button {
  width: 120px;
  height: 44px;
  font-size: 16px;
}

.result-content {
  text-align: center;
  padding: 20px 0;
}

.result-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.result-icon.success {
  color: #67c23a;
}

.result-icon.error {
  color: #f56c6c;
}

.result-text h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  font-weight: bold;
}

.result-text p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .payment-page {
    max-width: 500px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
  
  .page-header {
    border-radius: 0;
  }
}
</style>