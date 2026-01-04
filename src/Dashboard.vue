<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <!-- 页面标题和筛选 -->
    <div class="dashboard-header">
      <div class="header-title">
        <h1>仪表盘</h1>
        <el-tag type="success">实时数据</el-tag>
      </div>
      <div class="header-actions">
        <el-select
          v-model="timeRange"
          placeholder="时间范围"
          size="small"
          style="width: 120px"
          @change="handleTimeRangeChange"
        >
          <el-option label="今日" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
          <el-option label="本年" value="year" />
          <el-option label="自定义" value="custom" />
        </el-select>
        
        <el-date-picker
          v-if="timeRange === 'custom'"
          v-model="customDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="small"
          style="width: 240px; margin-left: 10px"
        />
        
        <el-button
          type="primary"
          icon="Refresh"
          size="small"
          :loading="loading"
          @click="refreshData"
          style="margin-left: 10px"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="stats-grid">
      <!-- 今日订单 -->
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #409EFF;">
            <el-icon size="24"><ShoppingCart /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.todayOrders) }}</div>
            <div class="stat-label">今日订单</div>
          </div>
          <div class="stat-trend">
            <el-icon :color="stats.orderTrend > 0 ? '#67C23A' : '#F56C6C'">
              <TrendingUp v-if="stats.orderTrend > 0" />
              <TrendingDown v-else />
            </el-icon>
            <span :class="stats.orderTrend > 0 ? 'trend-up' : 'trend-down'">
              {{ Math.abs(stats.orderTrend) }}%
            </span>
          </div>
        </div>
        <div class="stat-chart">
          <!-- 迷你趋势图 -->
          <div ref="ordersChart" style="height: 40px; width: 100%"></div>
        </div>
      </el-card>

      <!-- 今日营收 -->
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #67C23A;">
            <el-icon size="24"><Money /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">¥{{ formatNumber(stats.todayRevenue) }}</div>
            <div class="stat-label">今日营收</div>
          </div>
          <div class="stat-trend">
            <el-icon :color="stats.revenueTrend > 0 ? '#67C23A' : '#F56C6C'">
              <TrendingUp v-if="stats.revenueTrend > 0" />
              <TrendingDown v-else />
            </el-icon>
            <span :class="stats.revenueTrend > 0 ? 'trend-up' : 'trend-down'">
              {{ Math.abs(stats.revenueTrend) }}%
            </span>
          </div>
        </div>
        <div class="stat-chart">
          <div ref="revenueChart" style="height: 40px; width: 100%"></div>
        </div>
      </el-card>

      <!-- 总用户数 -->
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #E6A23C;">
            <el-icon size="24"><User /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(stats.totalUsers) }}</div>
            <div class="stat-label">总用户数</div>
          </div>
          <div class="stat-trend">
            <el-icon color="#67C23A">
              <TrendingUp />
            </el-icon>
            <span class="trend-up">+{{ stats.newUsersToday }}</span>
          </div>
        </div>
        <div class="stat-chart">
          <div ref="usersChart" style="height: 40px; width: 100%"></div>
        </div>
      </el-card>

      <!-- 营业餐厅 -->
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon" style="background: #F56C6C;">
            <el-icon size="24"><Shop /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeRestaurants }}</div>
            <div class="stat-label">营业餐厅</div>
          </div>
          <div class="stat-trend">
            <el-icon color="#67C23A">
              <TrendingUp />
            </el-icon>
            <span class="trend-up">+{{ stats.newRestaurantsToday }}</span>
          </div>
        </div>
        <div class="stat-chart">
          <div ref="restaurantsChart" style="height: 40px; width: 100%"></div>
        </div>
      </el-card>
    </div>

    <!-- 第二行：订单状态和配送统计 -->
    <div class="order-stats-row">
      <el-row :gutter="20">
        <!-- 订单状态统计 -->
        <el-col :xs="24" :sm="12" :lg="8">
          <el-card shadow="hover" class="order-status-card">
            <template #header>
              <div class="card-header">
                <span>订单状态统计</span>
                <el-tag type="primary">今日</el-tag>
              </div>
            </template>
            
            <div class="order-status-content">
              <div class="status-item" v-for="item in orderStatusStats" :key="item.status">
                <div class="status-info">
                  <div class="status-label">{{ item.label }}</div>
                  <div class="status-count">{{ item.count }}单</div>
                </div>
                <el-progress
                  :percentage="item.percentage"
                  :color="item.color"
                  :show-text="false"
                  :stroke-width="8"
                />
              </div>
              
              <div class="status-total">
                <div class="total-label">总订单数</div>
                <div class="total-value">{{ stats.totalOrdersToday }}单</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 配送统计 -->
        <el-col :xs="24" :sm="12" :lg="8">
          <el-card shadow="hover" class="delivery-stats-card">
            <template #header>
              <div class="card-header">
                <span>配送统计</span>
                <el-tag type="warning">实时</el-tag>
              </div>
            </template>
            
            <div class="delivery-stats-content">
              <div class="delivery-item">
                <div class="delivery-label">配送中订单</div>
                <div class="delivery-value">
                  <el-statistic :value="stats.deliveringOrders">
                    <template #prefix>
                      <el-icon><Truck /></el-icon>
                    </template>
                    <template #suffix>单</template>
                  </el-statistic>
                </div>
              </div>
              
              <div class="delivery-item">
                <div class="delivery-label">平均配送时间</div>
                <div class="delivery-value">
                  <el-statistic :value="stats.avgDeliveryTime">
                    <template #suffix>分钟</template>
                  </el-statistic>
                </div>
              </div>
              
              <div class="delivery-item">
                <div class="delivery-label">准时率</div>
                <div class="delivery-value">
                  <el-statistic :value="stats.onTimeRate" :precision="1">
                    <template #suffix>%</template>
                  </el-statistic>
                </div>
              </div>
              
              <div class="delivery-progress">
                <div class="progress-label">今日配送完成进度</div>
                <el-progress
                  :percentage="stats.deliveryProgress"
                  :color="deliveryProgressColor"
                  :stroke-width="10"
                  striped
                  :striped-flow="true"
                />
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 快捷操作 -->
        <el-col :xs="24" :sm="24" :lg="8">
          <el-card shadow="hover" class="quick-actions-card">
            <template #header>
              <div class="card-header">
                <span>快捷操作</span>
              </div>
            </template>
            
            <div class="quick-actions-content">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-button
                    type="primary"
                    class="quick-action-btn"
                    @click="goToPage('/order?status=pending')"
                  >
                    <el-icon><Clock /></el-icon>
                    处理待办订单
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <el-button
                    type="success"
                    class="quick-action-btn"
                    @click="goToPage('/delivery')"
                  >
                    <el-icon><Van /></el-icon>
                    管理配送员
                  </el-button>
                </el-col>
              </el-row>
              
              <el-row :gutter="10" style="margin-top: 10px">
                <el-col :span="12">
                  <el-button
                    type="warning"
                    class="quick-action-btn"
                    @click="goToPage('/restaurant')"
                  >
                    <el-icon><Shop /></el-icon>
                    查看餐厅
                  </el-button>
                </el-col>
                <el-col :span="12">
                  <el-button
                    type="info"
                    class="quick-action-btn"
                    @click="goToPage('/user')"
                  >
                    <el-icon><User /></el-icon>
                    用户管理
                  </el-button>
                </el-col>
              </el-row>
              
              <div class="system-status" style="margin-top: 20px">
                <div class="status-title">系统状态</div>
                <div class="status-item">
                  <el-icon color="#67C23A"><CircleCheck /></el-icon>
                  <span>运行正常</span>
                </div>
                <div class="status-item">
                  <el-icon color="#E6A23C"><Warning /></el-icon>
                  <span>今日订单量较高</span>
                </div>
                <div class="status-item">
                  <el-icon color="#409EFF"><Bell /></el-icon>
                  <span>3条未读通知</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 第三行：图表区 -->
    <div class="charts-row">
      <el-row :gutter="20">
        <!-- 订单趋势图表 -->
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>订单趋势</span>
                <el-select
                  v-model="chartTimeRange"
                  size="small"
                  style="width: 100px"
                  @change="updateOrderTrendChart"
                >
                  <el-option label="7天" value="7d" />
                  <el-option label="30天" value="30d" />
                  <el-option label="90天" value="90d" />
                </el-select>
              </div>
            </template>
            <div ref="orderTrendChart" style="height: 300px;"></div>
          </el-card>
        </el-col>

        <!-- 营收分析图表 -->
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span>营收分析</span>
                <div>
                  <el-radio-group v-model="revenueChartType" size="small" @change="updateRevenueChart">
                    <el-radio-button label="line">趋势</el-radio-button>
                    <el-radio-button label="pie">分布</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
            </template>
            <div ref="revenueAnalysisChart" style="height: 300px;"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 第四行：数据表格区 -->
    <div class="tables-row">
      <el-row :gutter="20">
        <!-- 最近订单 -->
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="table-card">
            <template #header>
              <div class="table-header">
                <span>最近订单</span>
                <el-button
                  type="text"
                  @click="goToPage('/order')"
                >
                  查看全部 <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </template>
            
            <el-table
              :data="recentOrders"
              style="width: 100%"
              v-loading="loading"
              height="300"
              :row-class-name="tableRowClassName"
            >
              <el-table-column prop="order_id" label="订单号" width="160">
                <template #default="{ row }">
                  <el-tooltip :content="row.order_id" placement="top">
                    <span class="order-id">{{ formatOrderId(row.order_id) }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="username" label="用户" width="100" />
              <el-table-column prop="restaurant" label="餐厅" width="120" show-overflow-tooltip />
              <el-table-column prop="amount" label="金额" width="100">
                <template #default="{ row }">
                  <span class="amount">¥{{ row.amount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getOrderTagType(row.status)" size="small" effect="light">
                    {{ formatOrderStatus(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="time" label="时间" width="120" />
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="text"
                    size="small"
                    @click="viewOrderDetail(row.order_id)"
                  >
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <!-- 热销商品 -->
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover" class="table-card">
            <template #header>
              <div class="table-header">
                <span>热销商品</span>
                <el-date-picker
                  v-model="topProductsRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  style="width: 240px"
                  @change="updateTopProducts"
                />
              </div>
            </template>
            
            <el-table
              :data="topProducts"
              style="width: 100%"
              v-loading="loading"
              height="300"
            >
              <el-table-column type="index" label="排名" width="60">
                <template #default="{ $index }">
                  <div class="rank" :class="getRankClass($index + 1)">
                    {{ $index + 1 }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="商品名称">
                <template #default="{ row }">
                  <div class="product-info">
                    <el-avatar :size="32" :src="row.image" />
                    <span class="product-name">{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="sales" label="销量" width="80" sortable>
                <template #default="{ row }">
                  <span class="sales">{{ formatNumber(row.sales) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="revenue" label="销售额" width="120" sortable>
                <template #default="{ row }">
                  <span class="revenue">¥{{ formatNumber(row.revenue) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="growth" label="增长" width="80">
                <template #default="{ row }">
                  <div class="growth" :class="row.growth >= 0 ? 'up' : 'down'">
                    <el-icon>
                      <TrendingUp v-if="row.growth >= 0" />
                      <TrendingDown v-else />
                    </el-icon>
                    <span>{{ Math.abs(row.growth) }}%</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 底部：实时通知和系统状态 -->
    <div class="bottom-row">
      <el-row :gutter="20">
        <!-- 系统通知 -->
        <el-col :xs="24" :lg="16">
          <el-card shadow="hover" class="notices-card">
            <template #header>
              <div class="notices-header">
                <span>系统通知</span>
                <el-badge :value="unreadNotices" :max="99" class="badge">
                  <el-button size="small" @click="viewAllNotices">
                    全部通知
                  </el-button>
                </el-badge>
              </div>
            </template>
            
            <el-timeline>
              <el-timeline-item
                v-for="notice in systemNotices"
                :key="notice.id"
                :timestamp="notice.time"
                :type="notice.type"
                :hollow="notice.unread"
              >
                <div class="notice-item">
                  <div class="notice-title">
                    <el-tag :type="notice.tagType" size="small">
                      {{ notice.tag }}
                    </el-tag>
                    <span class="notice-text">{{ notice.title }}</span>
                    <el-tag v-if="notice.unread" type="danger" size="small" effect="plain">
                      未读
                    </el-tag>
                  </div>
                  <div class="notice-content">{{ notice.content }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>

        <!-- 实时数据 -->
        <el-col :xs="24" :lg="8">
          <el-card shadow="hover" class="realtime-card">
            <template #header>
              <div class="realtime-header">
                <span>实时数据</span>
                <div class="update-time">
                  <el-icon><Clock /></el-icon>
                  <span>更新时间: {{ currentTime }}</span>
                </div>
              </div>
            </template>
            
            <div class="realtime-content">
              <div class="realtime-item">
                <div class="item-label">当前在线配送员</div>
                <div class="item-value">
                  <el-statistic :value="realtimeStats.onlineDelivery" />
                </div>
              </div>
              
              <div class="realtime-item">
                <div class="item-label">当前处理中订单</div>
                <div class="item-value">
                  <el-statistic :value="realtimeStats.processingOrders" />
                </div>
              </div>
              
              <div class="realtime-item">
                <div class="item-label">今日投诉数量</div>
                <div class="item-value">
                  <el-statistic :value="realtimeStats.todayComplaints">
                    <template #suffix>件</template>
                  </el-statistic>
                </div>
              </div>
              
              <div class="realtime-item">
                <div class="item-label">系统响应时间</div>
                <div class="item-value">
                  <el-statistic :value="realtimeStats.responseTime">
                    <template #suffix>ms</template>
                  </el-statistic>
                </div>
              </div>
              
              <div class="realtime-chart">
                <div ref="realtimeChart" style="height: 100px; width: 100%"></div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'


// 导入图标
import {
  ShoppingCart,
  Money,
  User,
  Shop,
  Van,
  Clock,
  Warning,
  Bell,
  CircleCheck,
  ArrowRight
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const timeRange = ref('today')
const customDateRange = ref([])
const chartTimeRange = ref('7d')
const revenueChartType = ref('line')
const topProductsRange = ref([])
const currentTime = ref('')

// 统计卡片数据
const stats = reactive({
  todayOrders: 156,
  orderTrend: 12,
  todayRevenue: 25840,
  revenueTrend: 8,
  totalUsers: 1520,
  newUsersToday: 24,
  activeRestaurants: 42,
  newRestaurantsToday: 3,
  pendingOrders: 12,
  deliveringOrders: 28,
  avgDeliveryTime: 32,
  onTimeRate: 95.5,
  deliveryProgress: 75,
  totalOrdersToday: 156
})

// 订单状态统计数据
const orderStatusStats = computed(() => [
  { status: 'pending', label: '待处理', count: 12, percentage: 8, color: '#E6A23C' },
  { status: 'preparing', label: '制作中', count: 24, percentage: 15, color: '#409EFF' },
  { status: 'delivering', label: '配送中', count: 28, percentage: 18, color: '#F56C6C' },
  { status: 'completed', label: '已完成', count: 92, percentage: 59, color: '#67C23A' }
])

// 配送进度条颜色
const deliveryProgressColor = computed(() => {
  const progress = stats.deliveryProgress
  if (progress >= 80) return '#67C23A'
  if (progress >= 60) return '#409EFF'
  if (progress >= 40) return '#E6A23C'
  return '#F56C6C'
})

// 最近订单数据
const recentOrders = ref([
  { order_id: 'ORD202312010001', username: '张三', restaurant: '快乐蛋糕店', amount: 158, status: 'delivering', time: '10:30' },
  { order_id: 'ORD202312010002', username: '李四', restaurant: '甜蜜时光', amount: 89, status: 'completed', time: '11:15' },
  { order_id: 'ORD202312010003', username: '王五', restaurant: '幸福蛋糕坊', amount: 245, status: 'preparing', time: '11:45' },
  { order_id: 'ORD202312010004', username: '赵六', restaurant: '美味蛋糕屋', amount: 76, status: 'pending', time: '12:20' },
  { order_id: 'ORD202312010005', username: '钱七', restaurant: '快乐蛋糕店', amount: 189, status: 'delivering', time: '12:50' }
])

// 热销商品数据
const topProducts = ref([
  { name: '巧克力蛋糕', image: '', sales: 156, revenue: 19968, growth: 12 },
  { name: '草莓慕斯', image: '', sales: 128, revenue: 10240, growth: 8 },
  { name: '提拉米苏', image: '', sales: 98, revenue: 11760, growth: -3 },
  { name: '芝士蛋糕', image: '', sales: 87, revenue: 10440, growth: 5 },
  { name: '水果蛋糕', image: '', sales: 76, revenue: 9120, growth: 15 }
])

// 系统通知数据
const systemNotices = ref([
  { id: 1, title: '系统维护通知', content: '系统将于今晚23:00-01:00进行维护升级', time: '10:30', type: 'primary', tag: '系统', tagType: 'primary', unread: true },
  { id: 2, title: '新餐厅入驻', content: '有3家新餐厅提交入驻申请，请及时审核', time: '09:15', type: 'warning', tag: '餐厅', tagType: 'warning', unread: true },
  { id: 3, title: '订单量异常', content: '检测到异常订单，请及时处理', time: '08:45', type: 'danger', tag: '订单', tagType: 'danger', unread: false },
  { id: 4, title: '配送员培训', content: '本周五下午进行配送员安全培训', time: '昨天', type: 'info', tag: '配送', tagType: 'info', unread: false }
])

// 实时统计数据
const realtimeStats = reactive({
  onlineDelivery: 28,
  processingOrders: 64,
  todayComplaints: 2,
  responseTime: 128
})

// 未读通知数量
const unreadNotices = computed(() => {
  return systemNotices.value.filter(notice => notice.unread).length
})

// 图表实例引用
const ordersChart = ref(null)
const revenueChart = ref(null)
const usersChart = ref(null)
const restaurantsChart = ref(null)
const orderTrendChart = ref(null)
const revenueAnalysisChart = ref(null)
const realtimeChart = ref(null)

// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 格式化订单号
const formatOrderId = (id) => {
  if (id.length > 10) {
    return id.substring(0, 8) + '...'
  }
  return id
}

// 格式化订单状态
const formatOrderStatus = (status) => {
  const map = {
    pending: '待处理',
    preparing: '制作中',
    delivering: '配送中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

// 获取订单标签类型
const getOrderTagType = (status) => {
  const map = {
    pending: 'warning',
    preparing: 'primary',
    delivering: 'danger',
    completed: 'success',
    cancelled: 'info'
  }
  return map[status] || 'info'
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  if (row.status === 'pending') {
    return 'warning-row'
  } else if (row.status === 'delivering') {
    return 'danger-row'
  } else if (row.status === 'completed') {
    return 'success-row'
  }
  return ''
}

// 排名样式
const getRankClass = (rank) => {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  return ''
}

// 更新时间
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 接口标注：获取仪表盘数据
const fetchDashboardData = async () => {
  loading.value = true
  try {
    // 接口调用示例：
    // const response = await axios.get('/api/dashboard/stats', {
    //   params: {
    //     timeRange: timeRange.value,
    //     startDate: customDateRange.value?.[0],
    //     endDate: customDateRange.value?.[1]
    //   }
    // })
    // 
    // const data = response.data
    // Object.assign(stats, data.stats)
    // recentOrders.value = data.recentOrders
    // topProducts.value = data.topProducts
    // systemNotices.value = data.notices
    // realtimeStats.value = data.realtimeStats
    
    // 模拟数据更新
    updateCurrentTime()
    
    // 更新迷你图表
    updateMiniCharts()
    
    // 更新订单趋势图表
    updateOrderTrendChart()
    
    // 更新营收分析图表
    updateRevenueChart()
    
    // 更新实时数据图表
    updateRealtimeChart()
    
    ElMessage.success('数据更新成功')
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 更新迷你图表
const updateMiniCharts = () => {
  const ordersData = [12, 19, 3, 5, 2, 3, 8, 15, 12, 14]
  const revenueData = [1500, 2300, 1800, 2100, 2500, 2800, 3000, 3200, 3100, 3500]
  const usersData = [45, 52, 38, 62, 71, 85, 90, 92, 98, 100]
  const restaurantsData = [8, 10, 12, 15, 18, 20, 22, 25, 28, 30]
  
  createMiniChart(ordersChart.value, ordersData, '#409EFF')
  createMiniChart(revenueChart.value, revenueData, '#67C23A')
  createMiniChart(usersChart.value, usersData, '#E6A23C')
  createMiniChart(restaurantsChart.value, restaurantsData, '#F56C6C')
}

// 创建迷你图表
const createMiniChart = (element, data, color) => {
  if (!element) return
  
  let chart = echarts.getInstanceByDom(element)
  if (!chart) {
    chart = echarts.init(element)
  }
  
  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      data: data,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: color,
        width: 2
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: color + '40' },
          { offset: 1, color: color + '10' }
        ])
      }
    }]
  }
  
  chart.setOption(option)
}

// 更新订单趋势图表
const updateOrderTrendChart = () => {
  if (!orderTrendChart.value) return
  
  let chart = echarts.getInstanceByDom(orderTrendChart.value)
  if (!chart) {
    chart = echarts.init(orderTrendChart.value)
  }
  
  // 模拟数据
  const days = ['11-25', '11-26', '11-27', '11-28', '11-29', '11-30', '12-01']
  const orderData = [120, 135, 142, 128, 156, 145, 150]
  const revenueData = [15600, 17550, 18460, 16640, 20280, 18850, 19500]
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['订单数', '营收额'],
      textStyle: {
        color: '#606266'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: days,
      axisLine: {
        lineStyle: {
          color: '#DCDFE6'
        }
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#DCDFE6'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#F2F6FC',
            type: 'dashed'
          }
        }
      },
      {
        type: 'value',
        name: '营收额',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#DCDFE6'
          }
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '订单数',
        type: 'line',
        smooth: true,
        data: orderData,
        lineStyle: {
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF40' },
            { offset: 1, color: '#409EFF10' }
          ])
        }
      },
      {
        name: '营收额',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: revenueData,
        lineStyle: {
          color: '#67C23A'
        },
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67C23A40' },
            { offset: 1, color: '#67C23A10' }
          ])
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 更新营收分析图表
const updateRevenueChart = () => {
  if (!revenueAnalysisChart.value) return
  
  let chart = echarts.getInstanceByDom(revenueAnalysisChart.value)
  if (!chart) {
    chart = echarts.init(revenueAnalysisChart.value)
  }
  
  if (revenueChartType.value === 'line') {
    // 折线图：每日营收
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const revenueData = [15600, 17550, 18460, 16640, 20280, 24500, 19500]
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>¥{c}'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: days,
        axisLine: {
          lineStyle: {
            color: '#DCDFE6'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#DCDFE6'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#F2F6FC',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          data: revenueData,
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }
      ]
    }
    
    chart.setOption(option)
  } else {
    // 饼图：营收分布
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ¥{c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          color: '#606266'
        }
      },
      series: [
        {
          name: '营收分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 25840, name: '蛋糕类' },
            { value: 12340, name: '甜品类' },
            { value: 9840, name: '饮料类' },
            { value: 7540, name: '其他' }
          ],
          color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
        }
      ]
    }
    
    chart.setOption(option)
  }
}

// 更新实时数据图表
const updateRealtimeChart = () => {
  if (!realtimeChart.value) return
  
  let chart = echarts.getInstanceByDom(realtimeChart.value)
  if (!chart) {
    chart = echarts.init(realtimeChart.value)
  }
  
  const data = Array.from({ length: 20 }, (_, i) => Math.floor(Math.random() * 50) + 20)
  
  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 5,
      bottom: 0
    },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [
      {
        data: data,
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#409EFF',
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409EFF40' },
            { offset: 1, color: '#409EFF10' }
          ])
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 刷新数据
const refreshData = () => {
  fetchDashboardData()
}

// 时间范围改变
const handleTimeRangeChange = () => {
  if (timeRange.value === 'custom' && customDateRange.value.length === 0) {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 7)
    customDateRange.value = [start, end]
  }
  fetchDashboardData()
}

// 更新热销商品
const updateTopProducts = () => {
  // 接口标注：根据时间范围获取热销商品
  // const response = await axios.get('/api/dashboard/top-products', {
  //   params: {
  //     startDate: topProductsRange.value?.[0],
  //     endDate: topProductsRange.value?.[1]
  //   }
  // })
  // topProducts.value = response.data
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/order/detail/${orderId}`)
}

// 查看所有通知
const viewAllNotices = () => {
  ElMessage.info('跳转到通知中心页面')
  // router.push('/notices')
}

// 页面跳转
const goToPage = (path) => {
  router.push(path)
}

onMounted(() => {
  fetchDashboardData()
  
  // 每秒更新一次时间
  const timeInterval = setInterval(updateCurrentTime, 1000)
  
  // 每30秒自动刷新数据
  const dataInterval = setInterval(fetchDashboardData, 30000)
  
  // 将定时器变量提升到外部作用域，以便在onUnmounted中访问
  window.dashboardTimeInterval = timeInterval
  window.dashboardDataInterval = dataInterval
})

// 组件卸载时清理资源
onUnmounted(() => {
  if (window.dashboardTimeInterval) {
    clearInterval(window.dashboardTimeInterval)
  }
  if (window.dashboardDataInterval) {
    clearInterval(window.dashboardDataInterval)
  }
  
  // 安全地销毁图表实例
  [ordersChart, revenueChart, usersChart, restaurantsChart, orderTrendChart, revenueAnalysisChart, realtimeChart].forEach(ref => {
    if (ref.value) {
      const chart = echarts.getInstanceByDom(ref.value)
      if (chart) {
        chart.dispose()
      }
    }
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

/* 头部样式 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15) !important;
}

.stat-content {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon .el-icon {
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.trend-up {
  color: #67C23A;
}

.trend-down {
  color: #F56C6C;
}

/* 订单状态行样式 */
.order-stats-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.order-status-content {
  padding: 10px 0;
}

.status-item {
  margin-bottom: 15px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.status-label {
  font-size: 14px;
  color: #606266;
}

.status-count {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.status-total {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #EBEEF5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 14px;
  color: #909399;
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: #409EFF;
}

/* 配送统计样式 */
.delivery-stats-content {
  padding: 10px 0;
}

.delivery-item {
  margin-bottom: 15px;
}

.delivery-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.delivery-progress {
  margin-top: 20px;
}

.progress-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

/* 快捷操作样式 */
.quick-actions-content {
  padding: 10px 0;
}

.quick-action-btn {
  width: 100%;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.system-status {
  padding: 15px;
  background-color: #F5F7FA;
  border-radius: 8px;
}

.status-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

/* 图表卡片样式 */
.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

/* 表格卡片样式 */
.tables-row {
  margin-bottom: 20px;
}

.table-card {
  height: 450px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.order-id {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #409EFF;
  cursor: pointer;
}

.amount {
  font-weight: 600;
  color: #F56C6C;
}

/* 表格行样式 */
:deep(.warning-row) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

:deep(.danger-row) {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}

:deep(.success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

/* 排名样式 */
.rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.rank-1 {
  background: linear-gradient(135deg, #FFD700, #FFA500);
}

.rank-2 {
  background: linear-gradient(135deg, #C0C0C0, #A0A0A0);
}

.rank-3 {
  background: linear-gradient(135deg, #CD7F32, #A0522D);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sales, .revenue {
  font-weight: 600;
}

.growth {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
}

.growth.up {
  color: #67C23A;
}

.growth.down {
  color: #F56C6C;
}

/* 底部通知样式 */
.bottom-row {
  margin-top: 20px;
}

.notices-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.badge {
  margin-right: 10px;
}

.notice-item {
  margin-left: 10px;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.notice-text {
  flex: 1;
  font-weight: 600;
  color: #303133;
}

.notice-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

/* 实时数据样式 */
.realtime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.update-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

.realtime-content {
  padding: 15px 0;
}

.realtime-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #F2F6FC;
}

.realtime-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 14px;
  color: #606266;
}

.item-value {
  font-size: 18px;
  font-weight: 700;
  color: #409EFF;
}

.realtime-chart {
  margin-top: 20px;
  height: 100px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-actions {
    width: 100%;
  }
}
</style>