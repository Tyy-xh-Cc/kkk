<template>
  <div class="checkout-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="back-btn" @click="goBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
      </div>
      <h1>确认订单</h1>
    </div>

    <!-- 收货地址 -->
    <div class="address-section">
      <div class="section-title">收货地址</div>
      <div class="address-card" @click="showAddressDialog = true">
        <div class="address-content" v-if="selectedAddress">
          <div class="address-info">
            <div class="receiver">
              <span class="name">{{ selectedAddress.receiverName }}</span>
              <span class="phone">{{ selectedAddress.phone }}</span>
            </div>
            <div class="address-detail">
              <el-tag v-if="selectedAddress.isDefault" size="small" type="success">
                默认
              </el-tag>
              <span>{{ selectedAddress.address }}</span>
            </div>
          </div>
          <el-icon>
            <ArrowRight />
          </el-icon>
        </div>
        <div class="no-address" v-else>
          <span>请选择收货地址</span>
          <el-icon>
            <ArrowRight />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 送达时间 -->
    <div class="delivery-time-section">
      <div class="section-title">送达时间</div>
      <div class="time-options">
        <div v-for="time in deliveryTimes" :key="time.value" class="time-option"
          :class="{ active: selectedTime === time.value }" @click="selectTime(time.value)">
          {{ time.label }}
        </div>
      </div>
      <div class="specific-time" v-if="selectedTime === 'specific'">
        <el-time-select v-model="specificTime" placeholder="选择时间" start="08:00" step="00:30" end="22:00" />
      </div>
    </div>

    <!-- 餐厅信息 -->
    <div class="restaurant-section">
      <div class="section-title">餐厅信息</div>
      <div class="restaurant-card" @click="goToRestaurant">
        <img :src="checkoutData.restaurant?.logoUrl" class="restaurant-logo" />
        <div class="restaurant-info">
          <div class="name">{{ checkoutData.restaurant?.name }}</div>
          <div class="distance">{{ checkoutData.restaurant?.estimatedDeliveryTime }}分钟送达</div>
        </div>
        <el-icon>
          <ArrowRight />
        </el-icon>
      </div>
    </div>

    <!-- 商品清单 -->
    <div class="order-items-section">
      <div class="section-title">商品清单</div>
      <div class="order-items">
        <div v-for="item in checkoutData.items" :key="item.productId" class="order-item">
          <div class="item-info">
            <div class="item-name">{{ item.productName }}</div>
            <div class="item-specs" v-if="item.specifications">
              {{ formatSpecifications(item.specifications) }}
            </div>
            <div class="item-price">¥{{ (item.productPrice || 0).toFixed(2) }}</div>
          </div>
          <div class="item-quantity">×{{ item.quantity }}</div>
          <div class="item-total">¥{{ ((item.productPrice || 0) * item.quantity).toFixed(2) }}</div>
        </div>
      </div>
    </div>

    <!-- 订单备注 -->
    <div class="remark-section">
      <div class="section-title">订单备注</div>
      <el-input v-model="remark" placeholder="口味偏好、配送要求等" type="textarea" rows="2" maxlength="100" show-word-limit />
    </div>

    <!-- 支付方式 -->
    <div class="payment-section">
      <div class="section-title">支付方式</div>
      <div class="payment-options">
        <div v-for="method in paymentMethods" :key="method.value" class="payment-option"
          :class="{ active: paymentMethod === method.value }" @click="selectPaymentMethod(method.value)">
          <img :src="method.icon" class="method-icon" />
          <span class="method-name">{{ method.name }}</span>
          <el-icon v-if="paymentMethod === method.value" class="method-check">
            <CircleCheck />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 价格明细 -->
    <div class="price-section" v-if="checkoutData.amount">
      <div class="section-title">价格明细</div>
      <div class="price-details">
        <div class="price-item">
          <span>商品金额</span>
          <span>¥{{ (checkoutData.amount.subtotal || 0).toFixed(2) }}</span>
        </div>
        <div class="price-item">
          <span>配送费</span>
          <span>¥{{ (checkoutData.amount.deliveryFee || 0).toFixed(2) }}</span>
        </div>
        <div class="price-item total">
          <span>实付</span>
          <span class="total-price">¥{{ (checkoutData.amount.total || 0).toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- 底部支付栏 -->
    <div class="payment-bar" v-if="checkoutData.amount">
      <div class="price-info">
        <div class="total-price">¥{{ (checkoutData.amount.total || 0).toFixed(2) }}</div>
        <div class="detail" v-if="(checkoutData.amount.discount || 0) > 0">
          已优惠¥{{ (checkoutData.amount.discount || 0).toFixed(2) }}
        </div>
      </div>
      <el-button type="primary" size="large" @click="submitOrder" :loading="submitting" :disabled="!selectedAddress">
        {{ submitButtonText }}
      </el-button>
    </div>
    <!-- 地址选择对话框 -->
    <el-dialog v-model="showAddressDialog" title="选择收货地址" width="90%" :before-close="handleAddressDialogClose">
      <address-selector v-model="selectedAddress" @change="handleAddressChange" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, CircleCheck } from '@element-plus/icons-vue'
import AddressSelector from './Selector/AddressSelector.vue'
import api from '../api/index'

const router = useRouter()

// 数据定义
const checkoutData = ref({})
const selectedAddress = ref(null)
const deliveryTimes = ref([
  { value: 'asap', label: '尽快送达' },
  { value: '30min', label: '30分钟内' },
  { value: '1hour', label: '1小时内' },
  { value: 'specific', label: '指定时间' }
])
const selectedTime = ref('asap')
const specificTime = ref('')
const remark = ref('')
const tablewareCount = ref(2)
const invoiceInfo = ref('')
const paymentMethod = ref('alipay')
const submitting = ref(false)

const showAddressDialog = ref(false)

// 支付方式配置
const paymentMethods = ref([
  { value: 'alipay', name: '支付宝支付', icon: '/assets/payment/alipay.png' },
  { value: 'wechat', name: '微信支付', icon: '/assets/payment/wechat.png' },
  { value: 'balance', name: '余额支付', icon: '/assets/payment/balance.png' },
  { value: 'cash', name: '货到付款', icon: '/assets/payment/cash.png' }
])

// 计算属性
const submitButtonText = computed(() => {
  if (!selectedAddress.value) {
    return '请选择收货地址'
  }
  return submitting.value ? '提交中...' : '提交订单'
})

// 初始化数据
const initData = () => {
  const data = JSON.parse(localStorage.getItem('checkout_data') || '{}')
  checkoutData.value = data

  if (!data.items || data.items.length === 0) {
    ElMessage.error('购物车为空')
    router.push('/cart')
    return
  }
  console.log(checkoutData.value);

  // 确保关键对象存在
  if (!data.restaurant) checkoutData.value.restaurant = {}
  if (!data.amount) {
    checkoutData.value.amount = {
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0
    }
  }

  // 确保每个商品项都有product_price
  if (data.items) {
    checkoutData.value.items = data.items.map(item => ({
      ...item,
      product_price: item.product_price || 0
    }))
  }

  // 获取默认地址
  getDefaultAddress()
}

// API: 获取默认地址
const getDefaultAddress = async () => {
  try {
    const res = await api.address.getDefaultAddress()
    if (res.data) {
      selectedAddress.value = res.data
    }
  } catch (error) {
    console.error('获取默认地址失败:', error)
  }
}

// 选择送达时间
const selectTime = (time) => {
  selectedTime.value = time
}

// 选择支付方式
const selectPaymentMethod = (method) => {
  paymentMethod.value = method
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

// 处理地址变化
const handleAddressChange = (address) => {
  selectedAddress.value = address
  showAddressDialog.value = false
}

// 处理地址对话框关闭
const handleAddressDialogClose = () => {
  showAddressDialog.value = false
}

// API: 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  submitting.value = true

  try {
    const orderData = {
    restaurantId: checkoutData.value.restaurant?.restaurantId,
    items: checkoutData.value.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.productName,
        price: item.productPrice,
        totalPrice: item.totalPrice,
        specifications: item.specifications
    })),
    deliveryAddress: selectedAddress.value.address,
    deliveryPhone: selectedAddress.value.phone,
    deliveryName: selectedAddress.value.receiverName,
    note: remark.value,
    finalAmount: checkoutData.value.amount?.total || 0,
    discountAmount: checkoutData.value.amount?.discount || 0,
    deliveryFee: checkoutData.value.amount?.deliveryFee || 0,
    deliveryTime: selectedTime.value === 'specific' ? specificTime.value : selectedTime.value,
    tablewareCount: tablewareCount.value,
    totalAmount: checkoutData.value.amount?.total || 0,
    invoiceInfo: invoiceInfo.value,
    paymentMethod: paymentMethod.value,
    couponId: checkoutData.value.coupon?.couponId
};
console.log(orderData);

    const res = await api.order.createOrder(orderData)

    if (res.data) {
      // 清空购物车数据
      localStorage.removeItem('checkout_data')

      // 根据支付方式处理
      if (paymentMethod.value === 'alipay' || paymentMethod.value === 'wechat') {
        // 跳转到支付页面
        router.push(`/payment/${res.data.order_id}`)
      } else {
        // 跳转到订单详情页面
        router.push(`/order/${res.data.order_id}`)
      }

      ElMessage.success('订单提交成功')
    } else {
      ElMessage.error(res.message || '提交订单失败')
    }
  } catch (error) {
    ElMessage.error('提交订单失败，请重试')
    console.error('提交订单失败:', error)
  } finally {
    submitting.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到餐厅
const goToRestaurant = () => {
  if (checkoutData.value.restaurant?.restaurant_id) {
    router.push(`/restaurant/${checkoutData.value.restaurant.restaurant_id}`)
  }
}

// 初始化
onMounted(() => {
  initData()
})
</script>

<style scoped>
.checkout-page {
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

.address-section,
.delivery-time-section,
.restaurant-section,
.order-items-section,
.remark-section,
.tableware-section,
.invoice-section,
.payment-section,
.price-section {
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

.address-card,
.restaurant-card,
.invoice-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.address-card:hover,
.restaurant-card:hover,
.invoice-content:hover {
  border-color: #ff6b00;
}

.address-content,
.no-address {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.address-info {
  flex: 1;
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

.address-detail {
  display: flex;
  align-items: center;
}

.address-detail .el-tag {
  margin-right: 8px;
}

.no-address {
  color: #999;
  font-size: 14px;
}

.time-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.time-option {
  padding: 8px 16px;
  border: 1px solid #dcdcdc;
  border-radius: 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.time-option.active {
  color: #ff6b00;
  border-color: #ff6b00;
  background: #fff0e6;
}

.specific-time {
  margin-top: 10px;
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

.restaurant-info .distance {
  font-size: 12px;
  color: #666;
}

.order-items {
  background: #fafafa;
  border-radius: 8px;
  padding: 10px;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
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

.remark-section .el-textarea {
  width: 100%;
}

.tableware-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tableware-label {
  font-size: 14px;
  color: #666;
}

.invoice-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option.active {
  border-color: #ff6b00;
  background: #fff0e6;
}

.method-icon {
  width: 24px;
  height: 24px;
  margin-right: 15px;
}

.method-name {
  flex: 1;
  font-size: 14px;
}

.method-check {
  color: #ff6b00;
  font-size: 20px;
}

.price-details {
  background: #fafafa;
  border-radius: 8px;
  padding: 15px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.price-item:last-child {
  margin-bottom: 0;
}

.price-item.total {
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}

.discount {
  color: #ff6b00;
}

.total-price {
  color: #ff6b00;
}

.payment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 10px 15px;
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

.payment-bar .el-button[disabled] {
  opacity: 0.6;
}
</style>