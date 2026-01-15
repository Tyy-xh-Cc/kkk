<template>
  <div class="restaurant-page">
    <!-- 餐厅头部 -->
    <div class="restaurant-header" ref="headerRef">
      <img :src="restaurant.coverUrl || defaultCover" class="header-bg" />
      <div class="header-content">
        <div class="back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div class="restaurant-info">
          <h1 class="name">{{ restaurant.name }}</h1>
          <div class="rating-status">
            <div class="rating">
              <el-rate v-model="restaurant.rating" disabled size="small" />
              <span class="rating-text">{{ restaurant.rating || 0 }}</span>
              <span class="sales">月售{{ restaurant.total_orders || 0 }}</span>
            </div>
            <el-tag :type="getStatusType(restaurant.status)" size="small">
              {{ getStatusText(restaurant.status) }}
            </el-tag>
          </div>
          <div class="delivery-info">
            <span>起送 ¥{{ restaurant.min_order_amount || 0 }}</span>
            <span class="divider">|</span>
            <span>配送 ¥{{ restaurant.delivery_fee || 0 }}</span>
            <span class="divider">|</span>
            <span>{{ restaurant.estimated_delivery_time || 30 }}分钟</span>
          </div>
          <div class="restaurant-desc" v-if="restaurant.description">
            {{ restaurant.description }}
          </div>
          <div class="address-info">
            <el-icon><Location /></el-icon>
            <span>{{ restaurant.address }}</span>
          </div>
          <div class="business-hours" v-if="restaurant.opening_hours">
            <el-icon><Clock /></el-icon>
            <span>{{ restaurant.opening_hours }}</span>
          </div>
        </div>
      </div>
    </div>

 
    <!-- 分类导航（吸顶） -->
    <div class="category-nav" :class="{ sticky: isSticky }" ref="navRef">
      <div class="nav-content">
        <div class="category-tabs">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-tab"
            :class="{ active: activeCategory === category.id }"
            @click="scrollToCategory(category.id)"
          >
            {{ category.name }}
          </div>
        </div>
      </div>
    </div>

   <!-- 商品区域 -->
    <div class="product-area">
      <div 
        v-for="category in categories" 
        :key="category.id" 
        class="category-section"
        :ref="el => categoryRefs[category.id] = el"
      >
        <div class="category-title" :id="`category-${category.id}`">
          {{ category.name }}
        </div>
        <div class="product-list">
          <div 
            v-for="product in getProductsByCategory(category.id)" 
            :key="product.id" 
            class="product-item"
          >
            <div class="product-image" @click="showProductDetail(product)">
              <img :src="product.image_url || defaultProductImage" />
              <div class="sold-out" v-if="product.status === 'sold_out'">
                已售罄
              </div>
            </div>
            <div class="product-info">
              <h3 class="product-name" @click="showProductDetail(product)">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              <div class="price-info">
                <div class="price">
                  <span class="current">¥{{ product.price }}</span>
                  <span class="original" v-if="product.original_price && product.original_price > product.price">
                    ¥{{ product.original_price }}
                  </span>
                </div>
                <div class="sales">月售{{ product.sales_count || 0 }}</div>
              </div>
            </div>
            <div class="product-actions">
              <el-button 
                v-if="product.status === 'available' && product.stock !== 0"
                type="primary" 
                size="small" 
                circle
                @click.stop="addToCart(product)"
                :disabled="isProductInCart(product.id)"  
              >
                <el-icon><Plus /></el-icon>
              </el-button>
              <el-tag v-else-if="product.status === 'sold_out'" type="danger" size="small">
                已售罄
              </el-tag>
              <el-tag v-else-if="product.stock === 0" type="warning" size="small">
                无库存
              </el-tag>
              <el-tag v-else type="info" size="small">
                已下架
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 购物车底部栏 -->
    <cart-bottom 
      ref="cartBottomRef"
      :restaurant-id="restaurantId"
      @checkout="goToCheckout"
      @show-cart="showCart"
    />
  <!-- 商品详情弹窗 -->
<product-dialog 
  v-model="showProductDialog"
  :product="selectedProduct"
  @add-to-cart="handleAddToCart"
  @buy-now="handleBuyNow"
/>

    <!-- 评价区域 -->
    <div class="reviews-section" v-if="reviews.length > 0">
      <div class="section-header">
        <h3>评价</h3>
        <el-button type="text" @click="viewAllReviews">查看全部{{ totalReviews }}条评价</el-button>
      </div>
      <div class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="user-info">
            <img :src="review.user_avatar || defaultAvatar" class="avatar" />
            <div class="user-details">
              <div class="username">{{ review.username }}</div>
              <div class="review-time">{{ formatTime(review.created_at) }}</div>
            </div>
          </div>
          <div class="review-content">
            <el-rate v-model="review.rating" disabled size="small" />
            <p class="review-text">{{ review.content }}</p>
            <div class="review-images" v-if="review.images && review.images.length > 0">
              <img 
                v-for="(img, index) in review.images.slice(0, 3)" 
                :key="index" 
                :src="img" 
                @click="previewImage(review.images, index)"
              />
              <span v-if="review.images.length > 3" class="more-images">+{{ review.images.length - 3 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Location, Clock, Plus } from '@element-plus/icons-vue'
import CartBottom from './CartBottom.vue'
import ProductDialog from './Dialog/ProductDialog.vue'
import api from '../api/index'

const route = useRoute()
const router = useRouter()
const restaurantId = route.params.id

// 数据定义
const restaurant = ref({})
const categories = ref([])
const products = ref([])
const reviews = ref([])
const cartItems = ref([])
const activeCategory = ref(null)
const isSticky = ref(false)
const showProductDialog = ref(false)
const selectedProduct = ref(null)
const totalReviews = ref(0)

// 默认图片
const defaultCover = 'http://localhost:8080/images/banners/banner1.jpg'
const defaultProductImage = 'http://localhost:8080/images/banners/banner1.jpg'
const defaultAvatar = 'http://localhost:8080/images/banners/banner1.jpg'

// Refs
const navRef = ref(null)
const categoryRefs = ref({})
const cartBottomRef = ref(null)

// API: 获取餐厅详情
const getRestaurantDetail = async () => {
  try {
    const res = await api.restaurant.getRestaurantDetail(restaurantId)
    restaurant.value = res.data.userInfo|| {}
    console.log('获取餐厅详情:', restaurant.value);
  } catch (error) {
    ElMessage.error('获取餐厅信息失败')
    console.error('获取餐厅信息失败:', error)
  }
}

// API: 获取分类列表
const getCategories = async () => {
  try {
    const res = await api.restaurant.getRestaurantCategories(restaurantId) 
    const categoriesData = Array.isArray(res.data) ? res.data : []
    categories.value = categoriesData;
    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0].id || categories.value[0].id
    }
    console.log('分类数据:', categories.value);
  } catch (error) {
    console.error('获取分类信息失败:', error)
  }
}

// API: 获取商品列表
const getProducts = async () => {
  try {
    const res = await api.restaurant.getRestaurantProducts(restaurantId)
    products.value = res.data.userInfo || []
    console.log('获取商品列表:', products.value);
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    console.error('获取商品列表失败:', error)
  }
}

// API: 获取购物车商品
const getCartItems = async () => {
  try {
    const res = await api.cart.getCartItems()
    cartItems.value = res.data?.items || []
  } catch (error) {
    console.error('获取购物车失败:', error)
  }
}

const addToCart = async (product) => {
  try {
    console.log('添加商品:', product);
    
    // 检查购物车中是否已存在该商品
    const existingItem = cartItems.value.find(item => item.product_id === product.product_id)
    
    const data = {
      productId: product.productId|| product.id,  // 修复字段名I
      restaurant_id: restaurantId,
      quantity:  product.quantity || 1,
    }
    const res = await api.cart.addToCart(data)
    
    if (res.data) {
      ElMessage.success(existingItem ? '数量已增加' : '添加成功')
      getCartItems()
      cartBottomRef.value.refreshCart()
    }
  } catch (error) {
    ElMessage.error('添加失败')
    console.error('添加购物车失败:', error)
  }
}

// 获取分类下的商品
const getProductsByCategory = (categoryId) => {
  return products.value.filter(p => p.categoryId === categoryId && p.status !== 'hidden')
}

// 商品是否在购物车中
const isProductInCart = (productId) => {
  return cartItems.value.some(item => item.id === productId)
}

// 显示商品详情
const showProductDetail = (product) => {
  selectedProduct.value = product
  showProductDialog.value = true
}
// 处理直接购买
const handleBuyNow = (orderItem) => {
  console.log('直接购买商品:', orderItem)
}

// 跳转到结算页面
const goToCheckout = () => {
   router.push('/checkout')
  
}
// 处理添加购物车（从商品详情弹窗）
const handleAddToCart = (product) => {
  addToCart(product)
}

// 修复滚动到分类函数
const scrollToCategory = (categoryId) => {
  console.log('滚动到分类:', categoryId)
  console.log('categoryRefs:', categoryRefs.value)
  
  // 方法1：使用 ref 获取元素
  const element = categoryRefs.value[categoryId]
  if (element) {
    console.log('通过ref找到元素')
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
    return
  }
  
  // 方法2：使用 id 获取元素
  const idElement = document.getElementById(`category-${categoryId}`)
  if (idElement) {
    console.log('通过id找到元素')
    idElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    })
    return
  }
  
  console.log('未找到元素，categoryId:', categoryId)
}

// 处理滚动
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const navTop = navRef.value?.offsetTop || 0
  
  isSticky.value = scrollTop > navTop
  
  // 滚动时高亮当前分类
  if (categories.value.length > 0) {
    for (const category of categories.value) {
      const element = categoryRefs.value[category.id || category.id]
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 150 && rect.bottom >= 150) {
          activeCategory.value = category.id || category.id
          break
        }
      }
    }
  }
}

const getStatusType = (status) => {
  const types = {
    'open': 'success',
    'closed': 'info',
    'busy': 'warning',
    'resting': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'open': '营业中',
    'closed': '休息中',
    'busy': '忙碌',
    'resting': '打烊'
  }
  return texts[status] || '未知'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60 * 1000) {
    return '刚刚'
  } else if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前'
  } else if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
  } else {
    return date.toLocaleDateString()
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([
    getRestaurantDetail(),
    getCategories(),
    getProducts(),
    getCartItems()
  ])
  
  window.addEventListener('scroll', handleScroll)
})

// 清理
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.restaurant-page {
  padding-bottom: 80px;
}

.restaurant-header {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.header-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
}

.header-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent 60%, rgba(0,0,0,0.6));
  padding: 20px;
  color: white;
}

.back-btn {
  width: 36px;
  height: 36px;
  background: rgba(0,0,0,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  top: 20px;
  left: 20px;
}

.header-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.header-actions .el-button {
  background: rgba(0,0,0,0.5);
  border: none;
  color: white;
}

.restaurant-info {
  margin-top: 60px;
}

.name {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: bold;
}

.rating-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.rating {
  display: flex;
  align-items: center;
}

.rating-text {
  margin: 0 10px;
  font-weight: bold;
}

.sales {
  font-size: 12px;
  opacity: 0.8;
}

.delivery-info {
  font-size: 14px;
  margin-bottom: 8px;
}

.divider {
  margin: 0 10px;
  opacity: 0.6;
}

.restaurant-desc {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;
  line-height: 1.4;
}

.address-info,
.business-hours {
  display: flex;
  align-items: center;
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 5px;
}

.address-info .el-icon,
.business-hours .el-icon {
  margin-right: 8px;
}

.promotions {
  background: #fff8e1;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.promotion-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.promotion-item:last-child {
  margin-bottom: 0;
}

.promotion-item .el-tag {
  margin-right: 10px;
  min-width: 60px;
}

.promotion-desc {
  font-size: 13px;
  color: #666;
}

/* 其他样式保持不变，参考之前的代码 */
.category-nav {
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.category-nav.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-content {
  padding: 10px 15px;
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
}

.category-tabs::-webkit-scrollbar {
  display: none;
}

.category-tab {
  padding: 8px 16px;
  margin-right: 15px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  flex-shrink: 0;
}

.category-tab.active {
  color: #ff6b00;
  border-bottom: 2px solid #ff6b00;
}

.product-area {
  padding: 15px;
}

.category-section {
  margin-bottom: 30px;
}

.category-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #ff6b00;
}

.product-list {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.sold-out {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border-radius: 8px;
}

.product-info {
  flex: 1;
  cursor: pointer;
}

.product-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.product-desc {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  display: flex;
  align-items: center;
}

.current {
  font-size: 18px;
  color: #ff6b00;
  font-weight: bold;
  margin-right: 8px;
}

.original {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

.sales {
  font-size: 12px;
  color: #999;
}

.product-actions {
  display: flex;
  align-items: flex-end;
}

.product-actions .el-button {
  width: 28px;
  height: 28px;
}

.reviews-section {
  padding: 15px;
  background: #ffffff;
  margin-top: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.review-item {
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 2px;
}

.review-time {
  font-size: 12px;
  color: #999;
}

.review-content {
  padding-left: 50px;
}

.review-text {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.review-images img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
}

.more-images {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border-radius: 4px;
  color: #999;
  font-size: 12px;
}
</style>