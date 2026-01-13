<template>
  <div class="home-page">
    <!-- 侧边导航栏 -->
    <NavSide />
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部搜索栏 -->
      <div class="search-bar">
        <div class="location" @click="selectLocation">
          <el-icon><Location /></el-icon>
          <span>{{ currentLocation }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索餐厅或菜品"
          class="search-input"
          @keyup.enter="searchRestaurants"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 轮播图 -->
      <div class="banner-section" v-if="banners.length > 0">
        <el-carousel  class="banner" indicator-position="outside">
          <el-carousel-item v-for="item in banners" :key="item.id">
            <img :src="item.imageUrl" class="banner-image" @click="handleBannerClick(item)" />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-item" :class="{ active: activeFilter === 'all' }" @click="changeFilter('all')">
          全部
        </div>

        <div class="filter-item" :class="{ active: activeFilter === 'rating' }" @click="changeFilter('rating')">
          评分最高
        </div>
      </div>

      <!-- 餐厅列表 -->
      <div class="restaurant-list">
        <div 
          v-for="restaurant in restaurants" 
          :key="restaurant.restaurantId" 
          class="restaurant-card"
          @click="goToRestaurant(restaurant.restaurantId)"
        >
          <div class="restaurant-image">
            <img :src="restaurant.coverUrl || defaultImage" />
            <div class="restaurant-tag busy" v-if="restaurant.status === 'busy'">
              忙碌
            </div>
            <div class="restaurant-tag closed" v-else-if="restaurant.status === 'closed'">
              打烊
            </div>
            <div class="restaurant-promotion" v-if="restaurant.promotion">
              {{ restaurant.promotion }}
            </div>
          </div>
          <div class="restaurant-info">
            <h3 class="name">{{ restaurant.name }}</h3>
            <div class="rating-info">
              <div class="rating">
                <el-rate 
                  v-model="restaurant.rating" 
                  disabled 
                  size="small" 
                  :colors="['#99A9BF', '#F7BA2A', '#1989fa']"
                />
                <span class="rating-text">{{ restaurant.rating }}</span>
                <span class="order-count">月售{{ restaurant.totalOrders || 0 }}</span>
              </div>
            </div>
            <div class="delivery-info">
              <span class="delivery-fee">¥{{ restaurant.deliveryFee || 0 }}配送费</span>
              <span class="min-order">¥{{ restaurant.minOrderAmount || 0 }}起送</span>
              <span class="delivery-time">{{ restaurant.estimatedDeliveryTime || 30 }}分钟</span>
            </div>
            <div class="restaurant-activity" v-if="restaurant.activity">
              <el-tag size="small" type="primary">{{ restaurant.activity }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore && !loading">
        <el-button type="primary" @click="loadMore">加载更多</el-button>
      </div>

      <!-- 加载中 -->
      <div class="loading" v-if="loading">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="!loading && restaurants.length === 0">
        <p class="empty-text">暂无餐厅</p>
        <p class="empty-subtext">换个筛选条件试试吧</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, ArrowDown, Search, Loading } from '@element-plus/icons-vue'
import NavSide from './NavSide.vue'
import api from '../api/index.js'

const router = useRouter()

// 数据定义
const searchKeyword = ref('')
const currentLocation = ref('正在定位...')
const banners = ref([])
const quickEntries = ref([])
const activeFilter = ref('all')
const restaurants = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10
const defaultImage = 'https://via.placeholder.com/100x100?text=Restaurant'

// 获取轮播图
const getBanners = async () => {
  try {
    const res = await api.common.getBanners()
    console.log(res.data.userInfo);
    
    banners.value = res.data.userInfo || []
  } catch (error) {
    console.error('获取轮播图失败:', error)
  }
}

// 获取快捷入口
const getQuickEntries = () => {
  quickEntries.value = [
  ]
}

// API: 获取餐厅列表
const getRestaurants = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      size: pageSize,
      keyword: searchKeyword.value || undefined,
      sort_by: getSortByValue(activeFilter.value),
      status: activeFilter.value === 'fast' ? 'open' : undefined,
      min_order_amount: activeFilter.value === 'cheap' ? 0 : undefined,
    }
    console.log(params);
    
    let res
     res = await api.restaurant.getRestaurantList(params)
    console.log(res.data);
    restaurants.value = res.data?.content || []
    hasMore.value = res.data?.totalPages > page.value
  } catch (error) {
    ElMessage.error('获取餐厅列表失败')
    console.error('获取餐厅列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取排序参数 - 修改为匹配后端的字段名
const getSortByValue = (filter) => {
  const map = {
    'rating': 'rating',  
    'cheap': 'price',    
    'fast': 'orders',  
    'all': undefined     
  }
  return map[filter]
}

// 获取当前位置
const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          currentLocation.value = '当前位置'
          resolve({ latitude, longitude })
        },
        () => {
          // 使用默认位置
          currentLocation.value = '未知位置'
          resolve({ latitude: 39.9042, longitude: 116.4074 }) // 北京
        }
      )
    } else {
      currentLocation.value = '未知位置'
      resolve({ latitude: 39.9042, longitude: 116.4074 })
    }
  })
}

// 搜索餐厅
const searchRestaurants = () => {
  page.value = 1
  restaurants.value = []
  getRestaurants()
}

// 切换筛选
const changeFilter = (filter) => {
  activeFilter.value = filter
  page.value = 1
  restaurants.value = []
  getRestaurants()
}

// 加载更多
const loadMore = () => {
  page.value++
  getRestaurants()
}

// 跳转到餐厅详情
const goToRestaurant = (restaurantId) => {
  router.push(`/restaurant/${restaurantId}`)
}

// 选择位置
const selectLocation = () => {
  ElMessage.info('位置选择功能开发中')
}

// 处理轮播图点击
const handleBannerClick = (banner) => {
  if (banner.linkUrl) {
    if (banner.linkUrl.startsWith('/')) {
      router.push(banner.linkUrl)
    } else {
      window.open(banner.linkUrl, '_blank')
    }
  }
}

// 处理快捷入口点击
const handleQuickEntry = (entry) => {
  searchKeyword.value = entry.name
  searchRestaurants()
}

// 监听滚动加载
const handleScroll = () => {
  if (loading.value || !hasMore.value) return
  
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const windowHeight = document.documentElement.clientHeight
  const scrollHeight = document.documentElement.scrollHeight
  
  if (scrollTop + windowHeight >= scrollHeight - 100) {
    loadMore()
  }
}

// 初始化加载
onMounted(async () => {
  await getCurrentLocation()
  getBanners()
  getQuickEntries()
  getRestaurants()
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

// 清理
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home-page {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  padding-left: 240px; /* 为侧边导航栏留出空间 */
  padding-bottom: 60px;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.location {
  display: flex;
  align-items: center;
  margin-right: 20px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location .el-icon {
  margin-right: 4px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  max-width: 500px;
}

.banner-section {
  margin: 15px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.filter-bar {
  display: flex;
  overflow-x: auto;
  padding: 0 15px;
  margin-bottom: 15px;
  white-space: nowrap;
}

.filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-item {
  padding: 8px 18px;
  margin-right: 12px;
  font-size: 14px;
  color: #666;
  background: #ffffff;
  border-radius: 20px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.filter-item:hover {
  background: #f8f9fa;
}

.filter-item.active {
  color: #1989fa;
  background: #eaf5ff;
  border-color: #1989fa;
}

.restaurant-list {
  padding: 0 15px;
}

.restaurant-card {
  display: flex;
  padding: 18px;
  margin-bottom: 15px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.restaurant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.restaurant-image {
  position: relative;
  width: 120px;
  height: 120px;
  margin-right: 20px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.restaurant-card:hover .restaurant-image img {
  transform: scale(1.05);
}

.restaurant-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 4px 8px;
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
  font-weight: 500;
}

.restaurant-tag.busy {
  background: rgba(255, 107, 0, 0.9);
}

.restaurant-tag.closed {
  background: rgba(153, 153, 153, 0.9);
}

.restaurant-promotion {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  background: rgba(25, 137, 250, 0.9);
  color: #fff;
  font-size: 12px;
  text-align: center;
  font-weight: 500;
}

.restaurant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.name {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
  font-weight: bold;
  line-height: 1.2;
}

.rating-info {
  margin-bottom: 10px;
}

.rating {
  display: flex;
  align-items: center;
}

.rating-text {
  margin: 0 10px 0 5px;
  color: #1989fa;
  font-weight: bold;
  font-size: 14px;
}

.order-count {
  color: #999;
  font-size: 12px;
}

.delivery-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
  flex-wrap: wrap;
}

.delivery-fee,
.min-order,
.delivery-time {
  margin-right: 15px;
  white-space: nowrap;
  margin-bottom: 4px;
}

.restaurant-activity {
  margin-top: 6px;
}

.restaurant-activity .el-tag {
  font-size: 11px;
  margin-right: 6px;
  margin-bottom: 4px;
}

.load-more {
  padding: 25px;
  text-align: center;
}

.load-more .el-button {
  width: 200px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 0;
  color: #999;
}

.loading-icon {
  font-size: 40px;
  margin-bottom: 10px;
  animation: rotate 2s linear infinite;
  color: #1989fa;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  text-align: center;
  color: #999;
}

.empty-text {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #ccc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding-left: 200px; /* 为侧边导航栏留出空间 */
  }
  
  .search-bar {
    padding: 12px 15px;
  }
  
  .location {
    max-width: 80px;
  }
  
  .restaurant-image {
    width: 100px;
    height: 100px;
    margin-right: 15px;
  }
  
  .name {
    font-size: 16px;
  }
  
  .delivery-info {
    font-size: 11px;
  }
}
</style>