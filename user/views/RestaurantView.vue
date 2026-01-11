<template>
  <div class="restaurant-page">
    <!-- 餐厅头部 -->
    <div class="restaurant-header" ref="headerRef">
      <img :src="restaurant.cover_url || defaultCover" class="header-bg" />
      <div class="header-content">
        <div class="back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </div>
        <div class="header-actions">
          <el-button type="text" @click="toggleFavorite">
            <el-icon v-if="isFavorite" color="#ff6b00"><StarFilled /></el-icon>
            <el-icon v-else><Star /></el-icon>
          </el-button>
          <el-button type="text" @click="shareRestaurant">
            <el-icon><Share /></el-icon>
          </el-button>
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

    <!-- 优惠活动 -->
    <div class="promotions" v-if="promotions.length > 0">
      <div class="promotion-item" v-for="promotion in promotions" :key="promotion.id">
        <el-tag :type="promotion.type" size="small">{{ promotion.title }}</el-tag>
        <span class="promotion-desc">{{ promotion.description }}</span>
      </div>
    </div>

    <!-- 分类导航（吸顶） -->
    <div class="category-nav" :class="{ sticky: isSticky }" ref="navRef">
      <div class="nav-content">
        <div class="category-tabs">
          <div 
            v-for="category in categories" 
            :key="category.category_id"
            class="category-tab"
            :class="{ active: activeCategory === category.category_id }"
            @click="scrollToCategory(category.category_id)"
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
        :key="category.category_id" 
        class="category-section"
        :ref="el => categoryRefs[category.category_id] = el"
      >
        <div class="category-title" :id="`category-${category.category_id}`">
          {{ category.name }}
        </div>
        <div class="product-list">
          <div 
            v-for="product in getProductsByCategory(category.category_id)" 
            :key="product.product_id"
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
                :disabled="isProductInCart(product.product_id)"
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Star, StarFilled, Share, Location, Clock, Plus } from '@element-plus/icons-vue'
import CartBottom from '@/components/CartBottom.vue'
import ProductDialog from '@/components/ProductDialog.vue'
import api from '@/api'

const route = useRoute()
const router = useRouter()
const restaurantId = route.params.id

// 数据定义
const restaurant = ref({})
const categories = ref([])
const products = ref([])
const promotions = ref([])
const reviews = ref([])
const cartItems = ref([])
const activeCategory = ref(null)
const isSticky = ref(false)
const showProductDialog = ref(false)
const selectedProduct = ref(null)
const isFavorite = ref(false)
const totalReviews = ref(0)

// 默认图片
const defaultCover = 'https://via.placeholder.com/750x300?text=Restaurant'
const defaultProductImage = 'https://via.placeholder.com/100x100?text=Product'
const defaultAvatar = 'https://via.placeholder.com/40x40?text=User'

// Refs
const headerRef = ref(null)
const navRef = ref(null)
const categoryRefs = ref({})
const cartBottomRef = ref(null)

// API: 获取餐厅详情
const getRestaurantDetail = async () => {
  try {
    const res = await api.restaurant.getRestaurantDetail(restaurantId)
    restaurant.value = res.data || {}
    
    // 检查是否收藏
    checkIsFavorite()
  } catch (error) {
    ElMessage.error('获取餐厅信息失败')
    console.error('获取餐厅信息失败:', error)
  }
}

// API: 获取分类列表
const getCategories = async () => {
  try {
    const res = await api.restaurant.getRestaurantCategories(restaurantId)
    categories.value = res.data || []
    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0].category_id
    }
  } catch (error) {
    console.error('获取分类信息失败:', error)
  }
}

// API: 获取商品列表
const getProducts = async () => {
  try {
    const res = await api.restaurant.getRestaurantProducts(restaurantId)
    products.value = res.data || []
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    console.error('获取商品列表失败:', error)
  }
}

// API: 获取优惠活动
const getPromotions = async () => {
  try {
    const res = await api.restaurant.getRestaurantPromotions(restaurantId)
    promotions.value = res.data || []
  } catch (error) {
    console.error('获取优惠活动失败:', error)
  }
}

// API: 获取评价
const getReviews = async () => {
  try {
    const res = await api.restaurant.getRestaurantReviews(restaurantId, { page: 1, page_size: 3 })
    reviews.value = res.data?.list || []
    totalReviews.value = res.data?.total || 0
  } catch (error) {
    console.error('获取评价失败:', error)
  }
}

// API: 检查是否收藏
const checkIsFavorite = async () => {
  try {
    const res = await api.user.getFavorites({ restaurant_id: restaurantId })
    isFavorite.value = res.data?.some(fav => fav.restaurant_id === parseInt(restaurantId)) || false
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// API: 添加/取消收藏
const toggleFavorite = async () => {
  try {
    const data = {
      restaurant_id: restaurantId,
      type: isFavorite.value ? 'remove' : 'add'
    }
    await api.restaurant.toggleFollowRestaurant(data)
    isFavorite.value = !isFavorite.value
    ElMessage.success(isFavorite.value ? '已收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败')
    console.error('收藏操作失败:', error)
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

// API: 添加商品到购物车
const addToCart = async (product) => {
  try {
    const data = {
      product_id: product.product_id,
      restaurant_id: restaurantId,
      quantity: 1,
      specifications: {}
    }
    
    const res = await api.cart.addToCart(data)
    
    if (res.code === 200) {
      ElMessage.success('添加成功')
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
  return products.value.filter(p => p.category_id === categoryId && p.status !== 'hidden')
}

// 商品是否在购物车中
const isProductInCart = (productId) => {
  return cartItems.value.some(item => item.product_id === productId)
}

// 显示商品详情
const showProductDetail = (product) => {
  selectedProduct.value = product
  showProductDialog.value = true
}

// 处理添加购物车（从商品详情弹窗）
const handleAddToCart = (product, quantity, specifications) => {
  addToCart(product)
}

// 滚动到分类
const scrollToCategory = (categoryId) => {
  const element = categoryRefs.value[categoryId]
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

// 处理滚动
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const navTop = navRef.value?.offsetTop || 0
  
  isSticky.value = scrollTop > navTop
  
  // 滚动时高亮当前分类
  if (categories.value.length > 0) {
    for (const category of categories.value) {
      const element = categoryRefs.value[category.category_id]
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 150 && rect.bottom >= 150) {
          activeCategory.value = category.category_id
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

// 分享餐厅
const shareRestaurant = () => {
  if (navigator.share) {
    navigator.share({
      title: restaurant.value.name,
      text: restaurant.value.description,
      url: window.location.href
    })
  } else {
    ElMessage.info('复制链接成功')
    navigator.clipboard.writeText(window.location.href)
  }
}

// 图片预览
const previewImage = (images, index) => {
  // 这里可以集成图片预览组件
  console.log('预览图片:', images, index)
}

// 查看所有评价
const viewAllReviews = () => {
  router.push(`/restaurant/${restaurantId}/reviews`)
}

// 去结算
const goToCheckout = () => {
  router.push('/checkout')
}

// 显示购物车
const showCart = () => {
  router.push('/cart')
}

// 初始化
onMounted(async () => {
  await Promise.all([
    getRestaurantDetail(),
    getCategories(),
    getProducts(),
    getPromotions(),
    getReviews(),
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