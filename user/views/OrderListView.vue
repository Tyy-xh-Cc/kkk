<template>
  <div class="order-list-page">
    <!-- 侧边导航栏 -->
    <NavSide />
    
    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 顶部标题 -->
      <div class="page-header">
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
            :key="order.orderId" 
            class="order-item"
            @click="viewOrderDetail(order.orderId)"
          >
            <div class="order-header">
              <div class="order-info">
                <div class="restaurant-name">{{ order.restaurantName }}</div>
                <div class="order-status" :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </div>
              </div>
              <div class="order-time">{{ formatTime(order.createdAt) }}</div>
            </div>
            
            <div class="order-content">
              <div class="order-items">
                <div class="item-name" v-for="item in order.orderItems" :key="item.productId">
                  {{ item.productName }} × {{ item.quantity }}
                </div>
              </div>
              <div class="order-image">
                <img :src="order.orderItems[0]?.productImage || defaultProductImage" />
              </div>
            </div>
            
            <div class="order-footer">
              <div class="order-price">
                共{{ order.orderItems.length }}件商品，实付
                <span class="price">¥{{ order.finalAmount.toFixed(2) }}</span>
              </div>
              <div class="order-actions">
                <el-button 
                  v-if="order.status === 'pending' && order.paymentStatus === 'pending'"
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
                  v-if="order.status === 'completed' && !order.userRated"
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
     <PaymentDialog 
      v-model="showPaymentDialog"
      :order-id="currentOrder?.orderId || ''"
      :amount="currentOrder?.finalAmount || 0"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Loading } from '@element-plus/icons-vue'
import api from '../api/index.js'
import NavSide from './NavSide.vue'
import PaymentDialog from './Dialog/PaymentDialog.vue'  // 新增导入
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
const defaultProductImage = ''
const showPaymentDialog = ref(false)
const currentOrder = ref(null)
// API: 获取订单列表
const getOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      size: pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value
    }
    
    const res = await api.order.getOrderList(params)
    console.log(res.data);
    
    if (res.data) {
      if (page.value === 1) {
        orders.value = res.data.content || []
      } else {
        orders.value = [...orders.value, ...(res.data.content || [])]
      }
      hasMore.value = res.data.has_more || false
    }
    console.log(orders.value);
    
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

const payOrder = async (order) => {
  try {
    currentOrder.value = order
    showPaymentDialog.value = true
  } catch (error) {
    ElMessage.error('支付失败')
  }
}

// 取消订单
const cancelOrder = async (order) => {
  try {
    const res = await api.order.cancelOrder(order.orderId)
    if (res.data) {
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
  router.push(`/order/${order.orderId}`)
}

// 再来一单
const reorder = async (order) => {
  try {
    const res = await api.order.reorder(order.orderId)
    if (res.data) {
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
  background: #f8f9fa;
  display: flex;
}

/* 主内容区域 - 为侧边栏留出空间 */
.main-content {
  flex: 1;
  margin-left: 240px; /* 与侧边栏宽度保持一致 */
  padding-bottom: 60px;
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

.order-tabs {
  display: flex;
  overflow-x: auto;
  background: #ffffff;
  padding: 12px 20px;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 60px;
  z-index: 99;
}

.order-tabs::-webkit-scrollbar {
  display: none;
}

.order-tab {
  padding: 8px 18px;
  margin-right: 12px;
  font-size: 14px;
  color: #6c757d;
  background: #f1f3f4;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.order-tab:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.order-tab.active {
  color: #ff6b00;
  background: #fff0e6;
  border-color: #ff6b00;
  box-shadow: 0 2px 6px rgba(255, 107, 0, 0.2);
}

.order-list {
  padding: 20px;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 20px;
  text-align: center;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 25px;
}

.empty-icon .el-icon {
  width: 100%;
  height: 100%;
  color: #dee2e6;
  font-size: 100px;
}

.empty-text {
  margin: 0 0 35px 0;
  font-size: 16px;
  color: #6c757d;
}

.empty-orders .el-button {
  min-width: 140px;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.empty-orders .el-button:hover {
  background: linear-gradient(135deg, #ff8533 0%, #ff6b00 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.order-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  flex: 1;
}

.restaurant-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  color: #212529;
}

.order-status {
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-pending { 
  color: #ff6b00; 
  background: #fff0e6;
  border: 1px solid #ffe5d0;
}
.status-confirmed { 
  color: #1890ff; 
  background: #e6f7ff;
  border: 1px solid #b3d8ff;
}
.status-preparing { 
  color: #2f54eb; 
  background: #e6f7ff;
  border: 1px solid #b3d8ff;
}
.status-delivering { 
  color: #52c41a; 
  background: #f6ffed;
  border: 1px solid #d9f7be;
}
.status-completed { 
  color: #52c41a; 
  background: #f6ffed;
  border: 1px solid #d9f7be;
}
.status-cancelled { 
  color: #999; 
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-content {
  display: flex;
  margin-bottom: 18px;
}

.order-items {
  flex: 1;
  padding-right: 20px;
}

.item-name {
  font-size: 14px;
  margin-bottom: 8px;
  color: #495057;
  line-height: 1.4;
}

.item-name:last-child {
  margin-bottom: 0;
}

.order-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.order-image img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 18px;
  border-top: 1px solid #f0f0f0;
}

.order-price {
  font-size: 15px;
  color: #6c757d;
}

.price {
  font-size: 18px;
  color: #ff6b00;
  font-weight: bold;
  margin-left: 8px;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.order-actions .el-button {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.order-actions .el-button.primary {
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
  border: none;
}

.order-actions .el-button.primary:hover {
  background: linear-gradient(135deg, #ff8533 0%, #ff6b00 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.order-actions .el-button:not(.primary) {
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.order-actions .el-button:not(.primary):hover {
  border-color: #ff6b00;
  color: #ff6b00;
  background: #fff0e6;
}

.load-more {
  padding: 25px;
  text-align: center;
}

.load-more .el-button {
  width: 220px;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8533 100%);
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.load-more .el-button:hover {
  background: linear-gradient(135deg, #ff8533 0%, #ff6b00 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 0, 0.3);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  color: #6c757d;
}

.loading-icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: rotate 2s linear infinite;
  color: #ff6b00;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .main-content {
    margin-left: 220px; /* 略微减小间距 */
  }
  
  .restaurant-name {
    font-size: 16px;
  }
  
  .order-item {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0; /* 移动端不显示侧边栏时 */
  }
  
  .order-tabs {
    padding: 10px 15px;
  }
  
  .order-tab {
    padding: 6px 14px;
    font-size: 13px;
  }
  
  .order-list {
    padding: 15px;
  }
  
  .order-content {
    flex-direction: column;
  }
  
  .order-image {
    width: 80px;
    height: 80px;
    margin-top: 10px;
  }
}
</style>