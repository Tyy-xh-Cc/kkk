<template>
  <div class="order-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="订单号">
            <el-input
              v-model="searchForm.order_id"
              placeholder="请输入订单号"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="用户姓名">
            <el-input
              v-model="searchForm.user_name"
              placeholder="请输入用户姓名"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="待支付" value="pending_payment" />
              <el-option label="待配送" value="pending_delivery" />
              <el-option label="配送中" value="delivering" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 订单列表 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="orderList"
          style="width: 100%"
          border
        >
          <el-table-column prop="order_id" label="订单号" width="180" />
          <el-table-column prop="user_name" label="用户姓名" width="120" />
          <el-table-column prop="user_phone" label="联系电话" width="120" />
          <el-table-column prop="address" label="配送地址" min-width="200" />
          <el-table-column prop="total_amount" label="订单金额" width="120">
            <template #default="scope">
              ¥{{ scope.row.total_amount.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="订单状态" width="120">
            <template #default="scope">
              <el-tag
                :type="getStatusTagType(scope.row.status)"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="delivery_name" label="配送员" width="120" />
          <el-table-column prop="created_at" label="创建时间" width="160" />
          <el-table-column label="操作" width="170" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleDetail(scope.row)">详情</el-button>
              <el-button size="small" @click="handleUpdateStatus(scope.row)">更新状态</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="800px">
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentDetail?.order_id }}</el-descriptions-item>
          <el-descriptions-item label="用户姓名">{{ currentDetail?.user_name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail?.user_phone }}</el-descriptions-item>
          <el-descriptions-item label="配送地址">{{ currentDetail?.address }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ currentDetail?.total_amount?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag
              :type="getStatusTagType(currentDetail?.status)"
            >
              {{ getStatusText(currentDetail?.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="配送员">{{ currentDetail?.delivery_name || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ currentDetail?.created_at }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h4>商品列表</h4>
        <el-table :data="currentDetail?.items" style="width: 100%" border>
          <el-table-column prop="product_name" label="商品名称" min-width="150" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="subtotal" label="小计" width="100">
            <template #default="scope">
              ¥{{ scope.row.subtotal.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 更新状态对话框 -->
    <el-dialog v-model="statusDialogVisible" title="更新订单状态" width="500px">
      <el-form ref="statusFormRef" :model="statusForm" :rules="statusRules" label-width="100px">
        <el-form-item label="订单号">
          <el-input v-model="statusForm.order_id" disabled />
        </el-form-item>
        <el-form-item label="当前状态">
          <el-tag :type="getStatusTagType(statusForm.current_status)">
            {{ getStatusText(statusForm.current_status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="新状态" prop="new_status">
          <el-select v-model="statusForm.new_status" placeholder="请选择新状态">
            <el-option
              v-for="status in availableStatuses"
              :key="status.value"
              :label="status.label"
              :value="status.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="配送员" v-if="statusForm.new_status === 'delivering' || statusForm.new_status === 'completed'">
          <el-select v-model="statusForm.delivery_id" placeholder="请选择配送员">
            <el-option
              v-for="delivery in deliveryList"
              :key="delivery.delivery_id"
              :label="delivery.name"
              :value="delivery.delivery_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="statusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateStatusSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const detailDialogVisible = ref(false)
const statusDialogVisible = ref(false)
const submitting = ref(false)
const statusFormRef = ref()
const currentDetail = ref(null)

// 配送员列表（用于分配配送员）
const deliveryList = ref([
  { delivery_id: 1, name: '张三', status: 'available' },
  { delivery_id: 2, name: '李四', status: 'busy' }
])

// 搜索表单
const searchForm = reactive({
  order_id: '',
  user_name: '',
  status: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 订单列表数据
const orderList = ref([
  {
    order_id: 'ORD202312010001',
    user_name: '王五',
    user_phone: '13900139000',
    address: '北京市朝阳区建国路88号',
    total_amount: 196.00,
    status: 'pending_delivery',
    delivery_id: null,
    delivery_name: null,
    created_at: '2023-12-01 14:30:00',
    items: [
      { product_id: 1, product_name: '巧克力蛋糕', price: 98.00, quantity: 2, subtotal: 196.00 }
    ]
  },
  {
    order_id: 'ORD202312020002',
    user_name: '赵六',
    user_phone: '13900139001',
    address: '北京市海淀区中关村大街1号',
    total_amount: 88.00,
    status: 'delivering',
    delivery_id: 1,
    delivery_name: '张三',
    created_at: '2023-12-02 15:45:00',
    items: [
      { product_id: 2, product_name: '草莓蛋糕', price: 88.00, quantity: 1, subtotal: 88.00 }
    ]
  }
])

// 更新状态表单
const statusForm = reactive({
  order_id: '',
  current_status: '',
  new_status: '',
  delivery_id: null
})

// 表单验证规则
const statusRules = {
  new_status: [
    { required: true, message: '请选择新状态', trigger: 'blur' }
  ]
}

// 订单状态配置
const orderStatus = [
  { value: 'pending_payment', label: '待支付', type: 'warning' },
  { value: 'pending_delivery', label: '待配送', type: 'info' },
  { value: 'delivering', label: '配送中', type: 'primary' },
  { value: 'completed', label: '已完成', type: 'success' },
  { value: 'cancelled', label: '已取消', type: 'danger' }
]

// 可用状态（根据当前状态动态生成）
const availableStatuses = ref([])

// 初始化数据
onMounted(() => {
  fetchOrderList()
})

// 获取订单列表
const fetchOrderList = async () => {
  loading.value = true
  try {
    // 实际项目中使用API调用
    // const response = await orderApi.getOrderList({
    //   page: pagination.current,
    //   page_size: pagination.size,
    //   ...searchForm
    // })
    // orderList.value = response.data
    // pagination.total = response.total
    
    // 模拟数据
    pagination.total = orderList.value.length
    loading.value = false
  } catch (error) {
    ElMessage.error('获取订单列表失败')
    loading.value = false
  }
}

// 刷新
const handleRefresh = () => {
  fetchOrderList()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchOrderList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    order_id: '',
    user_name: '',
    status: ''
  })
  pagination.current = 1
  fetchOrderList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size
  fetchOrderList()
}

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchOrderList()
}

// 查看详情
const handleDetail = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 更新状态
const handleUpdateStatus = (row) => {
  Object.assign(statusForm, {
    order_id: row.order_id,
    current_status: row.status,
    new_status: '',
    delivery_id: row.delivery_id
  })
  
  // 生成可用状态
  availableStatuses.value = getAvailableStatuses(row.status)
  
  statusDialogVisible.value = true
}

// 获取可用状态列表
const getAvailableStatuses = (currentStatus) => {
  const statusMap = {
    'pending_payment': ['pending_delivery', 'cancelled'],
    'pending_delivery': ['delivering', 'cancelled'],
    'delivering': ['completed'],
    'completed': [],
    'cancelled': []
  }
  
  const allowedValues = statusMap[currentStatus] || []
  return orderStatus.filter(status => allowedValues.includes(status.value))
}

// 获取状态文本
const getStatusText = (status) => {
  const statusItem = orderStatus.find(item => item.value === status)
  return statusItem ? statusItem.label : status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusItem = orderStatus.find(item => item.value === status)
  return statusItem ? statusItem.type : 'info'
}

// 提交状态更新
const handleUpdateStatusSubmit = async () => {
  if (!statusFormRef.value) return
  
  try {
    await statusFormRef.value.validate()
    submitting.value = true
    
    // 实际项目中使用API调用
    // await orderApi.updateOrderStatus(statusForm.order_id, statusForm.new_status)
    
    // 如果分配了配送员
    if (statusForm.delivery_id) {
      // await orderApi.assignDelivery(statusForm.order_id, statusForm.delivery_id)
    }
    
    // 模拟更新
    const order = orderList.value.find(item => item.order_id === statusForm.order_id)
    if (order) {
      order.status = statusForm.new_status
      if (statusForm.delivery_id) {
        const delivery = deliveryList.value.find(d => d.delivery_id === statusForm.delivery_id)
        order.delivery_id = statusForm.delivery_id
        order.delivery_name = delivery?.name
      }
    }
    
    ElMessage.success('状态更新成功')
    statusDialogVisible.value = false
    fetchOrderList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('状态更新失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-management {
  padding: 20px;
}

.main-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
}

.table-container {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  padding: 10px 0;
}
</style>