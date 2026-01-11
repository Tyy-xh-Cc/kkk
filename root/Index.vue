<template>
  <div class="delivery-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>配送员管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增配送员
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="姓名">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入姓名"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="空闲" value="available" />
              <el-option label="忙碌" value="busy" />
              <el-option label="离线" value="offline" />
            </el-select>
          </el-form-item>
          <el-form-item label="交通工具">
            <el-select
              v-model="searchForm.vehicle_type"
              placeholder="请选择交通工具"
              clearable
              @change="handleSearch"
            >
              <el-option label="全部" value="" />
              <el-option label="自行车" value="bicycle" />
              <el-option label="摩托车" value="motorcycle" />
              <el-option label="汽车" value="car" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>搜索
            </el-button>
            <el-button @click="resetSearch">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table
        :data="deliveryList"
        v-loading="loading"
        stripe
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="delivery_id" label="ID" width="80" sortable />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="vehicle_type" label="交通工具" width="100">
          <template #default="{ row }">
            {{ formatVehicleType(row.vehicle_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="license_plate" label="车牌号" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="180" sortable>
          <template #default="{ row }">
            <el-rate
              v-model="row.rating"
              disabled
              show-score
              text-color="#ff9900"
              :score-template="`${row.rating}`"
            />
          </template>
        </el-table-column>
        <el-table-column prop="completed_orders" label="完成订单" width="100" sortable />
        <el-table-column prop="created_at" label="创建时间" width="180" sortable>
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="text"
              size="small"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-popconfirm
              title="确定删除该配送员吗？"
              @confirm="handleDelete(row.delivery_id)"
            >
              <template #reference>
                <el-button type="text" size="small" danger>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑配送员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="deliveryFormRef"
        :model="deliveryForm"
        :rules="deliveryRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input
                v-model="deliveryForm.name"
                placeholder="请输入姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input
                v-model="deliveryForm.phone"
                placeholder="请输入联系电话"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="id_card">
              <el-input
                v-model="deliveryForm.id_card"
                placeholder="请输入身份证号"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="交通工具" prop="vehicle_type">
              <el-select
                v-model="deliveryForm.vehicle_type"
                placeholder="请选择交通工具"
                clearable
                style="width: 100%"
              >
                <el-option label="自行车" value="bicycle" />
                <el-option label="摩托车" value="motorcycle" />
                <el-option label="汽车" value="car" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号" prop="license_plate">
              <el-input
                v-model="deliveryForm.license_plate"
                placeholder="请输入车牌号"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select
                v-model="deliveryForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 100%"
              >
                <el-option label="空闲" value="available" />
                <el-option label="忙碌" value="busy" />
                <el-option label="离线" value="offline" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="评分" prop="rating">
              <el-input-number
                v-model="deliveryForm.rating"
                :min="0"
                :max="5"
                :step="0.1"
                placeholder="请输入评分"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="完成订单数" prop="completed_orders">
              <el-input-number
                v-model="deliveryForm.completed_orders"
                :min="0"
                placeholder="请输入完成订单数"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="当前位置" prop="current_location">
          <el-input
            v-model="deliveryForm.current_location"
            placeholder="格式：经度,纬度"
            clearable
          />
          <div class="location-hint">
            使用POINT格式，例如：116.397128,39.916527
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 配送员详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="配送员详情"
      width="500px"
    >
      <el-descriptions :column="2" border v-if="currentDetail">
        <el-descriptions-item label="配送员ID">
          {{ currentDetail.delivery_id }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名">
          {{ currentDetail.name }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentDetail.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="身份证号">
          {{ currentDetail.id_card || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="交通工具">
          {{ formatVehicleType(currentDetail.vehicle_type) }}
        </el-descriptions-item>
        <el-descriptions-item label="车牌号">
          {{ currentDetail.license_plate || '未填写' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentDetail.status)">
            {{ formatStatus(currentDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="评分">
          <el-rate
            v-model="currentDetail.rating"
            disabled
            show-score
            text-color="#ff9900"
            score-template="{value}分"
          />
        </el-descriptions-item>
        <el-descriptions-item label="完成订单数">
          {{ currentDetail.completed_orders }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(currentDetail.created_at) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import axios from './api.js' 
axios.defaults.baseURL = 'http://localhost:8080'
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const submitting = ref(false)
const deliveryFormRef = ref()
const currentDetail = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  vehicle_type: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 排序配置
const sortConfig = reactive({
  prop: '',
  order: ''
})

// 配送员列表数据
const deliveryList = ref([])

// 对话框标题
const dialogTitle = computed(() => {
  return deliveryForm.delivery_id ? '编辑配送员' : '新增配送员'
})

// 配送员表单
const deliveryForm = reactive({
  delivery_id: null,
  name: '',
  phone: '',
  id_card: '',
  vehicle_type: '',
  license_plate: '',
  current_location: '',
  status: 'available',
  rating: 0,
  completed_orders: 0
})

// 表单验证规则
const deliveryRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 格式化交通工具类型
const formatVehicleType = (type) => {
  const map = {
    bicycle: '自行车',
    motorcycle: '摩托车',
    car: '汽车'
  }
  return map[type] || type
}

// 格式化状态
const formatStatus = (status) => {
  const map = {
    available: '空闲',
    busy: '忙碌',
    offline: '离线'
  }
  return map[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const map = {
    available: 'success',
    busy: 'warning',
    offline: 'info'
  }
  return map[status] || 'info'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 接口标注：获取配送员列表
const fetchDeliveryList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.size,
      ...searchForm
    }
    
    const response = await axios.get('/api/deliveryPersons', {
      params: {
        page: params.page || 0,
        size: params.size || 10,
        name: params.name,
        phone: params.phone,
        status: params.status,
        vehicleType: params.vehicleType,
        minRating: params.minRating,
        maxRating: params.maxRating
      }
    });
    console.log('API返回数据:', response.data);
    
    deliveryList.value = response.data.content.map(item => ({
      delivery_id: item.id,
      name: item.name,
      phone: item.phone,
      id_card: item.idCard,
      vehicle_type: item.vehicleType,
      license_plate: item.licensePlate,
      status: item.status,
      rating: item.rating,
      completed_orders: item.completedOrders,
      created_at: item.createdAt
    }));
    pagination.total = response.data.totalElements;
  } catch (error) {
    ElMessage.error('获取配送员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchDeliveryList()
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  handleSearch()
}

// 排序改变
const handleSortChange = ({ prop, order }) => {
  sortConfig.prop = prop
  sortConfig.order = order === 'ascending' ? 'asc' : 'descending' ? 'desc' : ''
  fetchDeliveryList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.size = size
  fetchDeliveryList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchDeliveryList()
}

// 新增配送员
const handleAdd = () => {
  Object.keys(deliveryForm).forEach(key => {
    deliveryForm[key] = ''
  })
  deliveryForm.status = 'available'
  deliveryForm.rating = 0
  deliveryForm.completed_orders = 0
  dialogVisible.value = true
}

// 编辑配送员
const handleEdit = (row) => {
  Object.assign(deliveryForm, row)
  dialogVisible.value = true
}

// 查看详情
const handleViewDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 接口标注：删除配送员
const handleDelete = async (id) => {
  try {
    const response =await axios.delete(`/api/deliveryPersons/${id}`)
    ElMessage.success('删除成功')
    fetchDeliveryList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}


const submitForm = async () => {
  try {
    await deliveryFormRef.value.validate()
    submitting.value = true
    if (deliveryForm.delivery_id) {
      const response = await axios.put(`/api/deliveryPersons/${deliveryForm.delivery_id}`, deliveryForm)
      console.log('更新成功:', response.data)
      ElMessage.success('更新成功')
    } else {
      const response = await axios.post('/api/deliveryPersons', deliveryForm)
      console.log('新增成功:', response.data)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    fetchDeliveryList()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    submitting.value = false
  }
}


// 对话框关闭
const handleDialogClosed = () => {
  deliveryFormRef.value?.resetFields()
}

onMounted(() => {
  fetchDeliveryList()
})
</script>

<style scoped>
.delivery-management {
  height: 100%;
}

.main-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.location-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>