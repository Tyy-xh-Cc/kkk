<template>
  <div class="home-page">
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
      <el-carousel height="200px" class="banner">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <img :src="item.image" class="banner-image" @click="handleBannerClick(item)" />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-entries">
      <div v-for="entry in quickEntries" :key="entry.id" class="entry-item" @click="handleQuickEntry(entry)">
        <div class="entry-icon">
          <img :src="entry.icon" />
        </div>
        <span>{{ entry.name }}</span>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-item" :class="{ active: activeFilter === 'all' }" @click="changeFilter('all')">
        全部
      </div>
      <div class="filter-item" :class="{ active: activeFilter === 'fast' }" @click="changeFilter('fast')">
        快送
      </div>
      <div class="filter-item" :class="{ active: activeFilter === 'rating' }" @click="changeFilter('rating')">
        评分最高
      </div>
      <div class="filter-item" :class="{ active: activeFilter === 'cheap' }" @click="changeFilter('cheap')">
        起送价最低
      </div>
      <div class="filter-item" :class="{ active: activeFilter === 'distance' }" @click="changeFilter('distance')">
        距离最近
      </div>
      <div class="filter-item" :class="{ active: activeFilter === 'recommend' }" @click="changeFilter('recommend')">
        推荐
      </div>
    </div>

    <!-- 餐厅列表 -->
    <div class="restaurant-list">
      <div 
        v-for="restaurant in restaurants" 
        :key="restaurant.restaurant_id" 
        class="restaurant-card"
        @click="goToRestaurant(restaurant.restaurant_id)"
      >
        <div class="restaurant-image">
          <img :src="restaurant.cover_url || defaultImage" />
          <div class="restaurant-tag" v-if="restaurant.status === 'busy'">
            忙碌
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
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              />
              <span class="rating-text">{{ restaurant.rating }}</span>
              <span class="order-count">月售{{ restaurant.total_orders || 0 }}</span>
            </div>
          </div>
          <div class="delivery-info">
            <span class="delivery-fee">¥{{ restaurant.delivery_fee || 0 }}配送费</span>
            <span class="min-order">¥{{ restaurant.min_order_amount || 0 }}起送</span>
            <span class="delivery-time">{{ restaurant.estimated_delivery_time || 30 }}分钟</span>
          </div>
          <div class="restaurant-activity" v-if="restaurant.activity">
            <el-tag size="small" type="info">{{ restaurant.activity }}</el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="hasMore && !loading">
      <el-button @click="loadMore">加载更多</el-button>
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

    <!-- 底部导航 -->
    <nav-bottom />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Location, ArrowDown, Search, Loading } from '@element-plus/icons-vue'
import NavBottom from './NavBottom.vue'
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
const defaultImage = 'https://tse4-mm.cn.bing.net/th/id/OIP-C.rDTdPvUueEYijUT_CPKjggHaFp?w=253&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'

// 获取轮播图
const getBanners = async () => {
  try {
    const res = await api.common.getBanners()
    banners.value = res.data || []
  } catch (error) {
    console.error('获取轮播图失败:', error)
  }
}

// 获取快捷入口
const getQuickEntries = () => {
  quickEntries.value = [
    { id: 1, name: '美食', icon: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.rDTdPvUueEYijUT_CPKjggHaFp?w=253&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', type: 'food' },
    { id: 2, name: '超市', icon: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.rDTdPvUueEYijUT_CPKjggHaFp?w=253&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', type: 'market' },
    { id: 3, name: '水果', icon: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.rDTdPvUueEYijUT_CPKjggHaFp?w=253&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', type: 'fruit' },
    { id: 4, name: '下午茶', icon: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.rDTdPvUueEYijUT_CPKjggHaFp?w=253&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', type: 'tea' },
    { id: 5, name: '夜宵', icon: 'https://tse4-mm.cn.bing.net/th/id/OIP-C.rDTdPvUueEYijUT_CPKjggHaFp?w=253&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3', type: 'night' },
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

    let res
    if (activeFilter.value === 'recommend') {
      // 获取推荐餐厅
      res = await api.restaurant.getRecommendedRestaurants({
        page: 1,
        size: 10,
      })
      console.log(res.data);
      
      restaurants.value = res.data || []
      hasMore.value = false
    } else if (activeFilter.value === 'distance') {
      // 获取附近餐厅
      const location = await getCurrentLocation()
      res = await api.restaurant.getNearbyRestaurants({
        ...params,
        latitude: location.latitude,
        longitude: location.longitude,
        distance: 5 // 5公里范围内
      })
      restaurants.value = res.data?.list || []
      hasMore.value = res.data?.has_more || false
    } else {
      // 普通列表
      res = await api.restaurant.getRestaurantList(params)
      restaurants.value = res.data?.list || []
      hasMore.value = res.data?.has_more || false
    }
  } catch (error) {
    ElMessage.error('获取餐厅列表失败')
    console.error('获取餐厅列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取排序参数
const getSortByValue = (filter) => {
  const map = {
    'rating': 'rating_desc',
    'cheap': 'min_order_asc',
    'fast': 'delivery_time_asc',
    'default': 'created_at_desc'
  }
  return map[filter] || map['default']
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
  if (banner.link) {
    if (banner.link.startsWith('/')) {
      router.push(banner.link)
    } else {
      window.open(banner.link, '_blank')
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
  padding-bottom: 60px;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

.location {
  display: flex;
  align-items: center;
  margin-right: 15px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.location .el-icon {
  margin-right: 4px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
}

.banner-section {
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.quick-entries {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  background: #ffffff;
  margin: 10px;
  border-radius: 8px;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.entry-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
  border-radius: 50%;
  overflow: hidden;
}

.entry-icon img {
  width: 100%;
  height: 100%;
}

.entry-item span {
  font-size: 12px;
  color: #666;
}

.filter-bar {
  display: flex;
  overflow-x: auto;
  padding: 10px;
  background: #ffffff;
  margin: 10px;
  border-radius: 8px;
  white-space: nowrap;
}

.filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-item {
  padding: 6px 16px;
  margin-right: 10px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.filter-item.active {
  color: #ff6b00;
  background: #fff0e6;
}

.restaurant-list {
  padding: 0 10px;
}

.restaurant-card {
  display: flex;
  padding: 15px;
  margin-bottom: 10px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.restaurant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.restaurant-image {
  position: relative;
  width: 100px;
  height: 100px;
  margin-right: 15px;
  flex-shrink: 0;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.restaurant-tag {
  position: absolute;
  top: 5px;
  left: 5px;
  padding: 2px 6px;
  background: rgba(255, 107, 0, 0.9);
  color: #fff;
  font-size: 12px;
  border-radius: 4px;
}

.restaurant-promotion {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(255, 107, 0, 0.9);
  color: #fff;
  font-size: 12px;
  text-align: center;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.restaurant-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.name {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  font-weight: bold;
  line-height: 1.2;
}

.rating-info {
  margin-bottom: 8px;
}

.rating {
  display: flex;
  align-items: center;
}

.rating-text {
  margin: 0 10px 0 5px;
  color: #ff6b00;
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
}

.delivery-fee,
.min-order,
.delivery-time {
  margin-right: 10px;
  white-space: nowrap;
}

.restaurant-activity {
  margin-top: 4px;
}

.restaurant-activity .el-tag {
  font-size: 11px;
}

.load-more {
  padding: 20px;
  text-align: center;
}

.load-more .el-button {
  width: 200px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-image {
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-text {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #999;
}

.empty-subtext {
  margin: 0;
  font-size: 14px;
  color: #ccc;
}
</style>