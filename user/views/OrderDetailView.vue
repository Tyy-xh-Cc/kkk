<template>
  <div class="order-detail-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <h1>订单详情</h1>
      <div class="order-status" :class="getStatusClass(order.status)">
        {{ getStatusText(order.status) }}
      </div>
    </div>

    <!-- 配送信息 -->
    <div class="delivery-section">
      <div class="delivery-status">
        <el-steps :active="statusStep" finish-status="success" align-center>
          <el-step title="待支付" v-if="order.payment_status === 'pending'" />
          <el-step title="待接单" :icon="Check" />
          <el-step title="备餐中" :icon="Food" />
          <el-step title="配送中" :icon="Van" />
          <el-step title="已完成" :icon="Check" />
        </el-steps>
      </div>

      <div class="delivery-info" v-if="deliveryInfo">
        <div class="delivery-person">
          <div class="person-info">
            <img :src="deliveryInfo.delivery_person_avatar || defaultAvatar" class="avatar" />
            <div class="person-details">
              <div class="name">{{ deliveryInfo.delivery_person_name }}</div>
              <div class="phone">{{ deliveryInfo.delivery_person_phone }}</div>
              <div class="rating">
                <el-rate v-model="deliveryInfo.rating" disabled size="small" />
                <span class="rating-text">{{ deliveryInfo.rating }}</span>
              </div>
            </div>
          </div>
          <div class="person-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click="contactDeliveryPerson"
              v-if="deliveryInfo.status === 'delivering'"
            >
              联系骑手
            </el-button>
            <el-button 
              type="primary" 
              size="small" 
              @click="rateDeliveryPerson"
              v-if="order.status === 'completed' && !deliveryInfo.user_rated"
            >
              评价骑手
            </el-button>
          </div>
        </div>
        
        <div class="delivery-timeline">
          <div class="timeline-item" v-if="order.confirmed_at">
            <div class="timeline-time">{{ formatTime(order.confirmed_at) }}</div>
            <div class="timeline-content">商家已接单</div>
          </div>
          <div class="timeline-item" v-if="order.prepared_at">
            <div class="timeline-time">{{ formatTime(order.prepared_at) }}</div>
            <div class="timeline-content">商家已备餐完成</div>
          </div>
          <div class="timeline-item" v-if="deliveryInfo.pickup_time">
            <div class="timeline-time">{{ formatTime(deliveryInfo.pickup_time) }}</div>
            <div class="timeline-content">骑手已取餐</div>
          </div>
          <div class="timeline-item" v-if="deliveryInfo.delivered_time">
            <div class="timeline-time">{{ formatTime(deliveryInfo.delivered_time) }}</div>
            <div class="timeline-content">已送达</div>
          </div>
        </div>

        <div class="track-delivery" v-if="deliveryInfo.status === 'delivering'">
          <el-button type="primary" @click="trackDelivery">
            <el-icon><Location /></el-icon>
            实时追踪
          </el-button>
        </div>
      </div>
    </div>

    <!-- 地址信息 -->
    <div class="address-section">
      <div class="section-title">收货地址</div>
      <div class="address-content">
        <div class="receiver">
          <span class="name">{{ order.delivery_name }}</span>
          <span class="phone">{{ order.delivery_phone }}</span>
        </div>
        <div class="address">{{ order.delivery_address }}</div>
      </div>
    </div>

    <!-- 餐厅信息 -->
    <div class="restaurant-section">
      <div class="section-title">餐厅信息</div>
      <div class="restaurant-card" @click="goToRestaurant">
        <img :src="restaurant?.logo_url || defaultRestaurantImage" class="restaurant-logo" />
        <div class="restaurant-info">
          <div class="name">{{ restaurant?.name }}</div>
          <div class="contact-info">
            <el-icon><Phone /></el-icon>
            <span>{{ restaurant?.phone }}</span>
          </div>
        </div>
        <el-icon><ArrowRight /></el-icon>
      </div>
    </div>

    <!-- 订单商品 -->
    <div class="order-items-section">
      <div class="section-title">订单商品</div>
      <div class="order-items">
        <div v-for="item in orderItems" :key="item.order_item_id" class="order-item">
          <div class="item-image">
            <img :src="item.product_image || defaultProductImage" />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.product_name }}</div>
            <div class="item-specs" v-if="item.specifications">
              {{ formatSpecifications(item.specifications) }}
            </div>
            <div class="item-price">¥{{ item.unit_price.toFixed(2) }}</div>
          </div>
          <div class="item-quantity">×{{ item.quantity }}</div>
          <div class="item-total">¥{{ item.total_price.toFixed(2) }}</div>
        </div>
      </div>

      <div class="order-summary">
        <div class="summary-item">
          <span>商品金额</span>
          <span>¥{{ order.total_amount?.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span>配送费</span>
          <span>¥{{ order.delivery_fee?.toFixed(2) }}</span>
        </div>
        <div class="summary-item" v-if="order.discount_amount > 0">
          <span>优惠</span>
          <span class="discount">-¥{{ order.discount_amount?.toFixed(2) }}</span>
        </div>
        <div class="summary-item total">
          <span>实付</span>
          <span class="total-price">¥{{ order.final_amount?.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- 订单信息 -->
    <div class="order-info-section">
      <div class="section-title">订单信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">订单编号</span>
          <span class="value">{{ order.order_id }}</span>
        </div>
        <div class="info-item">
          <span class="label">下单时间</span>
          <span class="value">{{ formatTime(order.created_at) }}</span>
        </div>
        <div class="info-item" v-if="order.paid_at">
          <span class="label">支付时间</span>
          <span class="value">{{ formatTime(order.paid_at) }}</span>
        </div>
        <div class="info-item" v-if="order.completed_at">
          <span class="label">完成时间</span>
          <span class="value">{{ formatTime(order.completed_at) }}</span>
        </div>
        <div class="info-item" v-if="order.cancelled_at">
          <span class="label">取消时间</span>
          <span class="value">{{ formatTime(order.cancelled_at) }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付方式</span>
          <span class="value">{{ getPaymentMethodText(order.payment_method) }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付状态</span>
          <span class="value" :class="getPaymentStatusClass(order.payment_status)">
            {{ getPaymentStatusText(order.payment_status) }}
          </span>
        </div>
        <div class="info-item" v-if="order.note">
          <span class="label">订单备注</span>
          <span class="value">{{ order.note }}</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar" v-if="showActions">
      <div class="action-buttons">
        <el-button 
          v-if="order.status === 'pending' && order.payment_status === 'pending'"
          type="primary"
          @click="payOrder"
        >
          立即支付
        </el-button>
        <el-button 
          v-if="order.status === 'pending'"
          @click="cancelOrder"
        >
          取消订单
        </el-button>
        <el-button 
          v-if="order.status === 'completed' && !order.user_rated"
          type="primary"
          @click="rateOrder"
        >
          评价订单
        </el-button>
        <el-button 
          v-if="order.status === 'completed'"
          @click="reorder"
        >
          再来一单
        </el-button>
        <el-button 
          v-if="order.status === 'delivering'"
          @click="contactRestaurant"
        >
          联系商家
        </el-button>
        <el-button 
          v-if="order.status === 'delivering' || order.status === 'completed'"
          @click="showHelp"
        >
          需要帮助
        </el-button>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <payment-dialog 
      v-model="showPaymentDialog"
      :order-id="order.order_id"
      :amount="order.final_amount"
      @success="handlePaymentSuccess"
    />

    <!-- 评价弹窗 -->
    <rating-dialog 
      v-model="showRatingDialog"
      :order-id="order.order_id"
      :restaurant-id="restaurant?.restaurant_id"
      @success="handleRatingSuccess"
    />

    <!-- 骑手评价弹窗 -->
    <delivery-rating-dialog 
      v-model="showDeliveryRatingDialog"
      :delivery-id="deliveryInfo?.delivery_id"
      :order-id="order.order_id"
      @success="handleDeliveryRatingSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Check, Food, Van, Location, Phone, ArrowRight 
} from '@element-plus/icons-vue'
import PaymentDialog from './Dialog/PaymentDialog.vue'
import RatingDialog from './Dialog/RatingDialog.vue'
import DeliveryRatingDialog from './Dialog/DeliveryRatingDialog.vue'
import api from '../api/index'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id

// 数据定义
const order = ref({})
const orderItems = ref([])
const restaurant = ref({})
const deliveryInfo = ref(null)
const showPaymentDialog = ref(false)
const showRatingDialog = ref(false)
const showDeliveryRatingDialog = ref(false)

// 默认图片
const defaultAvatar = 'https://via.placeholder.com/50x50?text=骑手'
const defaultRestaurantImage = 'https://via.placeholder.com/50x50?text=餐厅'
const defaultProductImage = 'https://via.placeholder.com/80x80?text=商品'

// 计算属性
const statusStep = computed(() => {
  const steps = {
    'pending': order.value.payment_status === 'pending' ? 0 : 1,
    'confirmed': 1,
    'preparing': 2,
    'delivering': 3,
    'completed': 4,
    'cancelled': -1,
    'refunded': -1
  }
  return steps[order.value.status] || 0
})

const showActions = computed(() => {
  const status = order.value.status
  return status === 'pending' || status === 'delivering' || status === 'completed'
})

// API: 获取订单详情
const getOrderDetail = async () => {
  try {
    const res = await api.order.getOrderDetail(orderId)
    if (res.data) {
      order.value = res.data.order || {}
      orderItems.value = res.data.items || []
      restaurant.value = res.data.restaurant || {}
      deliveryInfo.value = res.data.delivery || null
    }
  } catch (error) {
    ElMessage.error('获取订单详情失败')
    console.error('获取订单详情失败:', error)
  }
}

// API: 获取配送信息
const getDeliveryInfo = async () => {
  try {
    const res = await api.delivery.getDeliveryInfo(orderId)
    if (res.data) {
      deliveryInfo.value = res.data
    }
  } catch (error) {
    console.error('获取配送信息失败:', error)
  }
}

// API: 支付订单
const payOrder = () => {
  showPaymentDialog.value = true
}

// API: 取消订单
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确定要取消订单吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const res = await api.order.cancelOrder(orderId)
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      getOrderDetail()
    } else {
      ElMessage.error(res.message || '取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

// API: 评价订单
const rateOrder = () => {
  showRatingDialog.value = true
}

// API: 评价骑手
const rateDeliveryPerson = () => {
  showDeliveryRatingDialog.value = true
}

// API: 再来一单
const reorder = async () => {
  try {
    const res = await api.order.reorder(orderId)
    if (res.code === 200) {
      // 跳转到购物车或餐厅页面
      if (restaurant.value?.restaurant_id) {
        router.push(`/restaurant/${restaurant.value.restaurant_id}`)
      } else {
        router.push('/cart')
      }
      ElMessage.success('已添加到购物车')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    console.error('再来一单失败:', error)
  }
}

// 格式化规格信息
const formatSpecifications = (specs) => {
  if (!specs) return ''
  try {
    const parsed = JSON.parse(specs)
    return Object.values(parsed).join('，')
  } catch {
    return specs
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    'pending': '待支付',
    'confirmed': '待接单',
    'preparing': '备餐中',
    'delivering': '配送中',
    'completed': '已完成',
    'cancelled': '已取消',
    'refunded': '已退款'
  }
  return texts[status] || '未知状态'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classes = {
    'pending': 'status-pending',
    'confirmed': 'status-confirmed',
    'preparing': 'status-preparing',
    'delivering': 'status-delivering',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled',
    'refunded': 'status-refunded'
  }
  return classes[status] || ''
}

// 获取支付方式文本
const getPaymentMethodText = (method) => {
  const texts = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'balance': '余额支付',
    'cash': '货到付款'
  }
  return texts[method] || '未知'
}

// 获取支付状态文本
const getPaymentStatusText = (status) => {
  const texts = {
    'pending': '待支付',
    'paid': '已支付',
    'refunded': '已退款'
  }
  return texts[status] || '未知'
}

// 获取支付状态样式类
const getPaymentStatusClass = (status) => {
  const classes = {
    'pending': 'payment-pending',
    'paid': 'payment-paid',
    'refunded': 'payment-refunded'
  }
  return classes[status] || ''
}

// 联系骑手
const contactDeliveryPerson = () => {
  if (deliveryInfo.value?.delivery_person_phone) {
    window.location.href = `tel:${deliveryInfo.value.delivery_person_phone}`
  } else {
    ElMessage.info('骑手电话不可用')
  }
}

// 联系餐厅
const contactRestaurant = () => {
  if (restaurant.value?.phone) {
    window.location.href = `tel:${restaurant.value.phone}`
  } else {
    ElMessage.info('餐厅电话不可用')
  }
}

// 实时追踪
const trackDelivery = () => {
  if (deliveryInfo.value?.delivery_id) {
    router.push(`/delivery/track/${deliveryInfo.value.delivery_id}`)
  } else {
    ElMessage.info('暂无法追踪配送')
  }
}

// 显示帮助
const showHelp = () => {
  router.push('/help')
}

// 跳转到餐厅
const goToRestaurant = () => {
  if (restaurant.value?.restaurant_id) {
    router.push(`/restaurant/${restaurant.value.restaurant_id}`)
  }
}

// 处理支付成功
const handlePaymentSuccess = () => {
  getOrderDetail()
  showPaymentDialog.value = false
}

// 处理评价成功
const handleRatingSuccess = () => {
  getOrderDetail()
  showRatingDialog.value = false
}

// 处理骑手评价成功
const handleDeliveryRatingSuccess = () => {
  getDeliveryInfo()
  showDeliveryRatingDialog.value = false
}

// 初始化
onMounted(() => {
  getOrderDetail()
  getDeliveryInfo()
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.page-header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

.order-status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: bold;
}

.status-pending { background: #fff0e6; color: #ff6b00; }
.status-confirmed { background: #e6f7ff; color: #1890ff; }
.status-preparing { background: #f0f5ff; color: #2f54eb; }
.status-delivering { background: #f6ffed; color: #52c41a; }
.status-completed { background: #f6ffed; color: #52c41a; }
.status-cancelled { background: #f5f5f5; color: #999; }
.status-refunded { background: #fff0e6; color: #ff6b00; }

.delivery-section,
.address-section,
.restaurant-section,
.order-items-section,
.order-info-section {
  background: #ffffff;
  margin: 10px;
  padding: 15px;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #ff6b00;
}

.delivery-status {
  margin-bottom: 20px;
}

.delivery-info {
  margin-top: 20px;
}

.delivery-person {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.person-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  object-fit: cover;
}

.person-details {
  flex: 1;
}

.person-details .name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.person-details .phone {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.rating {
  display: flex;
  align-items: center;
}

.rating-text {
  margin-left: 8px;
  color: #ff6b00;
  font-weight: bold;
  font-size: 14px;
}

.person-actions {
  display: flex;
  gap: 10px;
}

.delivery-timeline {
  margin-bottom: 20px;
}

.timeline-item {
  display: flex;
  margin-bottom: 15px;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-time {
  width: 80px;
  font-size: 12px;
  color: #999;
  margin-right: 15px;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
  font-size: 14px;
}

.track-delivery {
  text-align: center;
}

.track-delivery .el-button {
  width: 200px;
}

.address-content {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.receiver {
  margin-bottom: 8px;
}

.receiver .name {
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.receiver .phone {
  font-size: 14px;
  color: #666;
}

.address {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.restaurant-card {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.restaurant-card:hover {
  border-color: #ff6b00;
}

.restaurant-logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 15px;
  object-fit: cover;
}

.restaurant-info {
  flex: 1;
}

.restaurant-info .name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.contact-info {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.contact-info .el-icon {
  margin-right: 5px;
}

.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.item-info {
  flex: 1;
  margin-right: 15px;
}

.item-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
}

.item-specs {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.item-price {
  font-size: 14px;
  color: #ff6b00;
}

.item-quantity {
  margin: 0 20px;
  font-size: 14px;
  color: #666;
  min-width: 30px;
  text-align: center;
}

.item-total {
  font-size: 16px;
  color: #ff6b00;
  font-weight: bold;
  min-width: 60px;
  text-align: right;
}

.order-summary {
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item.total {
  font-size: 16px;
  font-weight: bold;
}

.discount {
  color: #ff6b00;
}

.total-price {
  color: #ff6b00;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.value {
  font-size: 14px;
  color: #333;
  word-break: break-all;
}

.payment-pending { color: #ff6b00; font-weight: bold; }
.payment-paid { color: #52c41a; font-weight: bold; }
.payment-refunded { color: #999; }

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 10px 15px;
  border-top: 1px solid #f0f0f0;
  z-index: 100;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.action-buttons .el-button {
  min-width: 100px;
}
</style>