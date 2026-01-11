<template>
  <div class="order-list-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <h1>我的订单</h1>
    </div>

    <!-- 订单状态筛选 -->
    <div class="order-tabs">
      <div 
        v-for="tab in orderTabs" 
        :key="tab.value"
        class="order-tab"
        :class="{ active: activeTab === tab.value }"
        @click="changeTab(tab.value)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div v-if="orders.length === 0 && !loading" class="empty-orders">
        <div class="empty-icon">
          <el-icon><Document /></el-icon>
        </div>
        <p class="empty-text">暂无订单</p>
        <el-button type="primary" @click="goToHome">去下单</el-button>
      </div>

      <div v-else>
        <div 
          v-for="order in orders" 
          :key="order.order_id" 
          class="order-item"
          @click="viewOrderDetail(order.order_id)"
        >
          <div class="order-header">
            <div class="order-info">
              <div class="restaurant-name">{{ order.restaurant_name }}</div>
              <div class="order-status" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </div>
            </div>
            <div class="order-time">{{ formatTime(order.created_at) }}</div>
          </div>
          
          <div class="order-content">
            <div class="order-items">
              <div class="item-name" v-for="item in order.items" :key="item.product_id">
                {{ item.product_name }} × {{ item.quantity }}
              </div>
            </div>
            <div class="order-image">
              <img :src="order.items[0]?.product_image || defaultProductImage" />
            </div>
          </div>
          
          <div class="order-footer">
            <div class="order-price">
              共{{ order.item_count }}件商品，实付
              <span class="price">¥{{ order.final_amount.toFixed(2) }}</span>
            </div>
            <div class="order-actions">
              <el-button 
                v-if="order.status === 'pending' && order.payment_status === 'pending'"
                type="primary" 
                size="small"
                @click.stop="payOrder(order)"
              >
                立即支付
              </el-button>
              <el-button 
                v-if="order.status === 'pending'"
                size="small"
                @click.stop="cancelOrder(order)"
              >
                取消订单
              </el-button>
              <el-button 
                v-if="order.status === 'completed' && !order.user_rated"
                type="primary"
                size="small"
                @click.stop="rateOrder(order)"
              >
                评价订单
              </el-button>
              <el-button 
                v-if="order.status === 'completed'"
                size="small"
                @click.stop="reorder(order)"
              >
                再来一单
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="hasMore && orders.length > 0">
      <el-button @click="loadMore" :loading="loading">加载更多</el-button>
    </div>

    <!-- 加载中 -->
    <div class="loading" v-if="loading && orders.length === 0">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Document, Loading } from '@element-plus/icons-vue'
import api from '../api/index.js'

const router = useRouter()

// 数据定义
const orderTabs = ref([
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'confirmed', label: '待接单' },
  { value: 'preparing', label: '备餐中' },
  { value: 'delivering', label: '配送中' },
  { value: 'completed', label: '已完成' }
])
const activeTab = ref('all')
const orders = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10
const defaultProductImage = 'https://via.placeholder.com/80x80?text=商品'

// API: 获取订单列表
const getOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    }
    
    const res = await api.order.getOrderList(params)
    
    if (res.data) {
      if (page.value === 1) {
        orders.value = res.data.list || []
      } else {
        orders.value = [...orders.value, ...(res.data.list || [])]
      }
      hasMore.value = res.data.has_more || false
    }
  } catch (error) {
    ElMessage.error('获取订单列表失败')
    console.error('获取订单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 切换标签
const changeTab = (tab) => {
  activeTab.value = tab
  page.value = 1
  orders.value = []
  getOrders()
}

// 加载更多
const loadMore = () => {
  page.value++
  getOrders()
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/order/${orderId}`)
}

// 支付订单
const payOrder = async (order) => {
  try {
    router.push(`/payment/${order.order_id}`)
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

// 取消订单
const cancelOrder = async (order) => {
  try {
    const res = await api.order.cancelOrder(order.order_id)
    if (res.code === 200) {
      ElMessage.success('订单已取消')
      // 重新加载列表
      page.value = 1
      getOrders()
    } else {
      ElMessage.error(res.message || '取消失败')
    }
  } catch (error) {
    ElMessage.error('取消失败')
  }
}

// 评价订单
const rateOrder = (order) => {
  router.push(`/order/${order.order_id}`)
}

// 再来一单
const reorder = async (order) => {
  try {
    const res = await api.order.reorder(order.order_id)
    if (res.code === 200) {
      router.push('/cart')
      ElMessage.success('已添加到购物车')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', { 
    month: '2-digit',
    day: '2-digit',
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
    'cancelled': '已取消'
  }
  return texts[status] || '未知'
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classes = {
    'pending': 'status-pending',
    'confirmed': 'status-confirmed',
    'preparing': 'status-preparing',
    'delivering': 'status-delivering',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  }
  return classes[status] || ''
}

// 去首页
const goToHome = () => {
  router.push('/')
}

// 初始化
onMounted(() => {
  getOrders()
})
</script>

<style scoped>
.order-list-page {
  min-height: 100vh;
  background: #f5f5f5;
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

.order-tabs {
  display: flex;
  overflow-x: auto;
  background: #ffffff;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 50px;
  z-index: 99;
}

.order-tabs::-webkit-scrollbar {
  display: none;
}

.order-tab {
  padding: 6px 16px;
  margin-right: 10px;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  border-radius: 16px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.order-tab.active {
  color: #ff6b00;
  background: #fff0e6;
}

.order-list {
  padding: 15px;
}

.empty-orders {
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
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #999;
}

.empty-orders .el-button {
  min-width: 120px;
}

.order-item {
  background: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  flex: 1;
}

.restaurant-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.order-status {
  font-size: 12px;
  font-weight: bold;
}

.status-pending { color: #ff6b00; }
.status-confirmed { color: #1890ff; }
.status-preparing { color: #2f54eb; }
.status-delivering { color: #52c41a; }
.status-completed { color: #52c41a; }
.status-cancelled { color: #999; }

.order-time {
  font-size: 12px;
  color: #999;
}

.order-content {
  display: flex;
  margin-bottom: 15px;
}

.order-items {
  flex: 1;
  padding-right: 15px;
}

.item-name {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

.item-name:last-child {
  margin-bottom: 0;
}

.order-image {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.order-image img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.order-price {
  font-size: 14px;
}

.price {
  font-size: 16px;
  color: #ff6b00;
  font-weight: bold;
  margin-left: 5px;
}

.order-actions {
  display: flex;
  gap: 10px;
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