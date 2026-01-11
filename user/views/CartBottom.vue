<template>
  <div class="cart-bottom" v-if="showCart">
    <div class="cart-info" @click="emit('show-cart')">
      <div class="cart-icon" :class="{ 'has-items': totalQuantity > 0 }">
        <el-icon><ShoppingCart /></el-icon>
        <span class="badge" v-if="totalQuantity > 0">{{ totalQuantity }}</span>
      </div>
      <div class="cart-details">
        <div class="total-price">¥{{ totalAmount.toFixed(2) }}</div>
        <div class="delivery-fee" v-if="deliveryFee > 0">另需配送费¥{{ deliveryFee }}</div>
      </div>
    </div>
    <div class="checkout-btn">
      <el-button 
        type="primary" 
        size="large" 
        :disabled="totalAmount < minOrderAmount"
        @click="handleCheckout"
      >
        {{ checkoutText }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import api from '@/api'

const props = defineProps({
  restaurantId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['checkout', 'show-cart'])

// 数据定义
const cartItems = ref([])
const restaurantInfo = ref({})
const loading = ref(false)

// 计算属性
const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.product_price * item.quantity), 0)
})

const deliveryFee = computed(() => {
  return restaurantInfo.value?.delivery_fee || 0
})

const minOrderAmount = computed(() => {
  return restaurantInfo.value?.min_order_amount || 0
})

const showCart = computed(() => {
  return cartItems.value.length > 0
})

const checkoutText = computed(() => {
  if (totalAmount.value < minOrderAmount.value) {
    const diff = (minOrderAmount.value - totalAmount.value).toFixed(2)
    return `还差¥${diff}起送`
  }
  return '去结算'
})

// API: 获取购物车商品
const getCartItems = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    const res = await api.cart.getCartItems()
    cartItems.value = res.data?.items || []
    
    // 过滤当前餐厅的商品
    if (props.restaurantId) {
      cartItems.value = cartItems.value.filter(item => 
        item.restaurant_id === parseInt(props.restaurantId)
      )
    }
  } catch (error) {
    console.error('获取购物车失败:', error)
  } finally {
    loading.value = false
  }
}

// API: 获取餐厅信息
const getRestaurantInfo = async () => {
  try {
    const res = await api.restaurant.getRestaurantDetail(props.restaurantId)
    restaurantInfo.value = res.data || {}
  } catch (error) {
    console.error('获取餐厅信息失败:', error)
  }
}

// 刷新购物车
const refreshCart = () => {
  getCartItems()
}

// 处理结算
const handleCheckout = () => {
  if (totalAmount.value < minOrderAmount.value) {
    ElMessage.warning(`起送金额为¥${minOrderAmount.value}`)
    return
  }
  emit('checkout')
}

// 监听餐厅ID变化
watch(() => props.restaurantId, (newVal) => {
  if (newVal) {
    getRestaurantInfo()
    getCartItems()
  }
})

// 初始化
onMounted(() => {
  if (props.restaurantId) {
    getRestaurantInfo()
    getCartItems()
  }
})

// 暴露方法给父组件
defineExpose({
  refreshCart
})
</script>

<style scoped>
.cart-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.cart-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex: 1;
}

.cart-icon {
  position: relative;
  width: 50px;
  height: 50px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.cart-icon.has-items {
  background: #ff6b00;
  color: white;
}

.cart-icon .el-icon {
  font-size: 24px;
}

.badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 20px;
  height: 20px;
  background: #ff4d4f;
  color: white;
  font-size: 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.cart-details {
  flex: 1;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6b00;
  margin-bottom: 3px;
}

.delivery-fee {
  font-size: 12px;
  color: #999;
}

.checkout-btn {
  flex-shrink: 0;
}

.checkout-btn .el-button {
  width: 120px;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
}

.checkout-btn .el-button[disabled] {
  background: #dcdcdc;
  border-color: #dcdcdc;
  color: #999;
}
</style>