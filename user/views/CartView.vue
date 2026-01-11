<template>
  <div class="cart-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <h1>购物车</h1>
      <div class="header-actions">
        <el-button 
          v-if="cartItems.length > 0"
          type="text" 
          @click="clearCart"
        >
          清空
        </el-button>
      </div>
    </div>

    <!-- 购物车为空 -->
    <div v-if="cartItems.length === 0 && !loading" class="empty-cart">
      <div class="empty-icon">
        <el-icon><ShoppingCart /></el-icon>
      </div>
      <p class="empty-text">购物车还是空的</p>
      <p class="empty-subtext">快去挑选喜欢的商品吧</p>
      <el-button type="primary" @click="goToHome">去逛逛</el-button>
    </div>

    <!-- 购物车列表 -->
    <div v-else class="cart-content">
      <!-- 餐厅信息 -->
      <div class="restaurant-info" v-if="restaurantInfo">
        <div class="restaurant-header">
          <img :src="restaurantInfo.logo_url" class="restaurant-logo" />
          <div class="restaurant-details">
            <div class="name">{{ restaurantInfo.name }}</div>
            <div class="delivery-info">
              <span>¥{{ restaurantInfo.delivery_fee }}配送费</span>
              <span>¥{{ restaurantInfo.min_order_amount }}起送</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="cart-items">
        <div 
          v-for="item in cartItems" 
          :key="item.cart_item_id" 
          class="cart-item"
        >
          <div class="item-select" @click="toggleSelect(item)">
            <el-icon v-if="selectedItems.includes(item.cart_item_id)">
              <CircleCheck />
            </el-icon>
            <el-icon v-else>
              <Circle />
            </el-icon>
          </div>
          <div class="item-content">
            <div class="item-image">
              <img :src="item.product_image || defaultProductImage" />
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.product_name }}</div>
              <div class="item-specs" v-if="item.specifications">
                {{ formatSpecifications(item.specifications) }}
              </div>
              <div class="item-price">¥{{ item.product_price.toFixed(2) }}</div>
            </div>
            <div class="item-actions">
              <div class="quantity-control">
                <el-button 
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1"
                  size="small"
                  circle
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
                <span class="quantity">{{ item.quantity }}</span>
                <el-button 
                  @click="increaseQuantity(item)"
                  size="small"
                  circle
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
              <div class="item-total">¥{{ (item.product_price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
          <div class="item-delete">
            <el-button 
              type="danger" 
              size="small" 
              circle
              @click="removeItem(item.cart_item_id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 全选 -->
      <div class="select-all" v-if="cartItems.length > 0">
        <div class="select-all-left" @click="toggleSelectAll">
          <el-icon v-if="allSelected">
            <CircleCheck />
          </el-icon>
          <el-icon v-else>
            <Circle />
          </el-icon>
          <span>全选</span>
        </div>
        <div class="select-all-right">
          <span>合计：</span>
          <span class="total-price">¥{{ selectedTotal.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 优惠券 -->
      <div class="coupon-section" v-if="availableCoupons.length > 0">
        <div class="section-title">优惠券</div>
        <div class="coupon-list">
          <div 
            v-for="coupon in availableCoupons" 
            :key="coupon.coupon_id"
            class="coupon-item"
            @click="selectCoupon(coupon)"
          >
            <div class="coupon-info">
              <div class="coupon-amount">¥{{ coupon.discount_amount }}</div>
              <div class="coupon-condition">满{{ coupon.min_order_amount }}可用</div>
              <div class="coupon-expiry">{{ formatExpiry(coupon.expiry_date) }}</div>
            </div>
            <div class="coupon-action">
              <el-button 
                type="primary" 
                size="small"
                @click.stop="useCoupon(coupon)"
                :disabled="selectedCoupon?.coupon_id === coupon.coupon_id"
              >
                {{ selectedCoupon?.coupon_id === coupon.coupon_id ? '已使用' : '使用' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 价格明细 -->
      <div class="price-section">
        <div class="price-item">
          <span>商品金额</span>
          <span>¥{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="price-item">
          <span>配送费</span>
          <span>¥{{ deliveryFee.toFixed(2) }}</span>
        </div>
        <div class="price-item" v-if="selectedCoupon">
          <span>优惠券</span>
          <span class="discount">-¥{{ selectedCoupon.discount_amount.toFixed(2) }}</span>
        </div>
        <div class="price-item total">
          <span>实付</span>
          <span class="total-price">¥{{ finalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 备注信息 -->
      <div class="remark-section">
        <div class="section-title">备注</div>
        <el-input
          v-model="remark"
          placeholder="口味偏好、配送要求等"
          type="textarea"
          rows="2"
          maxlength="100"
          show-word-limit
        />
      </div>
    </div>

    <!-- 底部结算栏 -->
    <div class="checkout-bar" v-if="cartItems.length > 0">
      <div class="checkout-info">
        <div class="checkout-price">
          <span class="total">¥{{ finalAmount.toFixed(2) }}</span>
          <span class="original" v-if="selectedCoupon">
            原价¥{{ (subtotal + deliveryFee).toFixed(2) }}
          </span>
        </div>
        <div class="checkout-amount" v-if="selectedCoupon">
          已优惠¥{{ selectedCoupon.discount_amount.toFixed(2) }}
        </div>
      </div>
      <el-button 
        type="primary" 
        size="large" 
        @click="goToCheckout"
        :disabled="selectedItems.length === 0 || finalAmount < minOrderAmount"
      >
        {{ checkoutButtonText }}
      </el-button>
    </div>

    <!-- 加载中 -->
    <div class="loading" v-if="loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, ShoppingCart, CircleCheck, 
  Minus, Plus, Delete, Loading 
} from '@element-plus/icons-vue'
import api from '../api/index.js'

const router = useRouter()

// 数据定义
const cartItems = ref([])
const restaurantInfo = ref(null)
const selectedItems = ref([])
const availableCoupons = ref([])
const selectedCoupon = ref(null)
const remark = ref('')
const loading = ref(false)
const defaultProductImage = 'https://via.placeholder.com/100x100?text=Product'

// 计算属性
const allSelected = computed(() => {
  return selectedItems.value.length === cartItems.value.length && cartItems.value.length > 0
})

const selectedItemsList = computed(() => {
  return cartItems.value.filter(item => selectedItems.value.includes(item.cart_item_id))
})

const subtotal = computed(() => {
  return selectedItemsList.value.reduce((sum, item) => {
    return sum + (item.product_price * item.quantity)
  }, 0)
})

const deliveryFee = computed(() => {
  return restaurantInfo.value?.delivery_fee || 0
})

const minOrderAmount = computed(() => {
  return restaurantInfo.value?.min_order_amount || 0
})

const selectedTotal = computed(() => {
  return selectedItemsList.value.reduce((sum, item) => {
    return sum + (item.product_price * item.quantity)
  }, 0)
})

const finalAmount = computed(() => {
  const baseAmount = subtotal.value + deliveryFee.value
  const discount = selectedCoupon.value?.discount_amount || 0
  return Math.max(baseAmount - discount, 0)
})

const checkoutButtonText = computed(() => {
  if (selectedItems.value.length === 0) {
    return '请选择商品'
  }
  if (finalAmount.value < minOrderAmount.value) {
    const diff = (minOrderAmount.value - finalAmount.value).toFixed(2)
    return `还差¥${diff}起送`
  }
  return `去结算`
})

// API: 获取购物车列表
const getCartItems = async () => {
  loading.value = true
  try {
    const res = await api.cart.getCartItems()
    if (res.data) {
      cartItems.value = res.data.items || []
      restaurantInfo.value = res.data.restaurant || null
      
      // 如果有默认选中的商品，初始选中状态
      if (cartItems.value.length > 0) {
        selectedItems.value = cartItems.value.map(item => item.cart_item_id)
      }
      
      // 获取可用优惠券
      getAvailableCoupons()
    }
  } catch (error) {
    ElMessage.error('获取购物车失败')
    console.error('获取购物车失败:', error)
  } finally {
    loading.value = false
  }
}

// API: 获取可用优惠券
const getAvailableCoupons = async () => {
  try {
    const res = await api.coupon.getAvailableCoupons({
      restaurant_id: restaurantInfo.value?.restaurant_id,
      min_amount: subtotal.value
    })
    availableCoupons.value = res.data || []
  } catch (error) {
    console.error('获取优惠券失败:', error)
  }
}

// API: 更新商品数量
const updateQuantity = async (item, newQuantity) => {
  try {
    await api.cart.updateCartItemQuantity(item.cart_item_id, { quantity: newQuantity })
    item.quantity = newQuantity
  } catch (error) {
    ElMessage.error('更新失败')
    console.error('更新商品数量失败:', error)
  }
}

// API: 删除商品
const removeItem = async (itemId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await api.cart.removeCartItem(itemId)
    cartItems.value = cartItems.value.filter(item => item.cart_item_id !== itemId)
    selectedItems.value = selectedItems.value.filter(id => id !== itemId)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// API: 清空购物车
const clearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await api.cart.clearCart()
    cartItems.value = []
    selectedItems.value = []
    selectedCoupon.value = null
    ElMessage.success('购物车已清空')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败')
    }
  }
}

// API: 使用优惠券
const useCoupon = async (coupon) => {
  try {
    if (selectedCoupon.value?.coupon_id === coupon.coupon_id) {
      selectedCoupon.value = null
    } else {
      selectedCoupon.value = coupon
    }
  } catch (error) {
    ElMessage.error('使用优惠券失败')
    console.error('使用优惠券失败:', error)
  }
}

// 增加数量
const increaseQuantity = (item) => {
  updateQuantity(item, item.quantity + 1)
}

// 减少数量
const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    updateQuantity(item, item.quantity - 1)
  }
}

// 选择/取消选择商品
const toggleSelect = (item) => {
  const index = selectedItems.value.indexOf(item.cart_item_id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(item.cart_item_id)
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = cartItems.value.map(item => item.cart_item_id)
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

// 格式化过期时间
const formatExpiry = (expiryDate) => {
  if (!expiryDate) return ''
  const date = new Date(expiryDate)
  return date.toLocaleDateString('zh-CN')
}

// 选择优惠券
const selectCoupon = (coupon) => {
  selectedCoupon.value = selectedCoupon.value?.coupon_id === coupon.coupon_id ? null : coupon
}

// 去结算
const goToCheckout = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择商品')
    return
  }
  
  if (finalAmount.value < minOrderAmount.value) {
    ElMessage.warning(`起送金额为¥${minOrderAmount.value}`)
    return
  }
  
  // 保存选中的商品信息到本地存储或状态管理
  const checkoutData = {
    items: selectedItemsList.value,
    restaurant: restaurantInfo.value,
    coupon: selectedCoupon.value,
    remark: remark.value,
    amount: {
      subtotal: subtotal.value,
      deliveryFee: deliveryFee.value,
      discount: selectedCoupon.value?.discount_amount || 0,
      total: finalAmount.value
    }
  }
  
  localStorage.setItem('checkout_data', JSON.stringify(checkoutData))
  router.push('/checkout')
}

// 去首页
const goToHome = () => {
  router.push('/')
}

// 初始化
onMounted(() => {
  getCartItems()
})
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.header-actions .el-button {
  width: 36px;
  height: 36px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

.empty-icon .el-icon {
  width: 100%;
  height: 100%;
  color: #dcdcdc;
  font-size: 120px;
}

.empty-text {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #999;
}

.empty-subtext {
  margin: 0 0 30px 0;
  font-size: 14px;
  color: #ccc;
}

.empty-cart .el-button {
  min-width: 120px;
}

.cart-content {
  padding: 15px;
}

.restaurant-info {
  background: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.restaurant-header {
  display: flex;
  align-items: center;
}

.restaurant-logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-right: 15px;
  object-fit: cover;
}

.restaurant-details {
  flex: 1;
}

.restaurant-details .name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.delivery-info {
  font-size: 12px;
  color: #666;
}

.delivery-info span {
  margin-right: 15px;
}

.cart-items {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-select {
  margin-right: 10px;
  cursor: pointer;
}

.item-select .el-icon {
  font-size: 20px;
  color: #dcdcdc;
}

.item-select .el-icon[data-v-]:has(+ .circle-check) {
  color: #ff6b00;
}

.item-content {
  display: flex;
  flex: 1;
  align-items: center;
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
  font-size: 16px;
  margin-bottom: 5px;
  font-weight: bold;
}

.item-specs {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.item-price {
  font-size: 14px;
  color: #ff6b00;
  font-weight: bold;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.quantity-control .el-button {
  width: 24px;
  height: 24px;
  padding: 0;
}

.quantity {
  margin: 0 10px;
  font-size: 14px;
  min-width: 20px;
  text-align: center;
}

.item-total {
  font-size: 16px;
  color: #ff6b00;
  font-weight: bold;
}

.item-delete {
  margin-left: 10px;
}

.item-delete .el-button {
  width: 28px;
  height: 28px;
}

.select-all {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 15px;
}

.select-all-left {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.select-all-left .el-icon {
  font-size: 20px;
  margin-right: 8px;
  color: #dcdcdc;
}

.select-all-left .el-icon[data-v-]:has(+ .circle-check) {
  color: #ff6b00;
}

.select-all-left span {
  font-size: 14px;
}

.select-all-right {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.total-price {
  font-size: 18px;
  color: #ff6b00;
  font-weight: bold;
  margin-left: 10px;
}

.coupon-section,
.price-section,
.remark-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #ff6b00;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coupon-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.coupon-item:hover {
  border-color: #ff6b00;
}

.coupon-info {
  flex: 1;
}

.coupon-amount {
  font-size: 18px;
  color: #ff6b00;
  font-weight: bold;
  margin-bottom: 4px;
}

.coupon-condition {
  font-size: 12px;
  color: #999;
  margin-bottom: 2px;
}

.coupon-expiry {
  font-size: 11px;
  color: #ccc;
}

.coupon-action .el-button {
  min-width: 60px;
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

.checkout-bar {
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

.checkout-info {
  flex: 1;
}

.checkout-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
}

.checkout-price .total {
  font-size: 20px;
  color: #ff6b00;
  font-weight: bold;
  margin-right: 10px;
}

.checkout-price .original {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.checkout-amount {
  font-size: 12px;
  color: #ff6b00;
}

.checkout-bar .el-button {
  width: 120px;
  height: 44px;
  font-size: 16px;
}

.checkout-bar .el-button[disabled] {
  opacity: 0.6;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  color: #999;
}

.loading-icon {
  font-size: 40px;
  margin-bottom: 10px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>