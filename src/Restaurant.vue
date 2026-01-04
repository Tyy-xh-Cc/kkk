<template>
  <div class="restaurant-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>餐厅管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增餐厅
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="餐厅名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入餐厅名称"
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
              <el-option label="营业中" value="open" />
              <el-option label="已关闭" value="closed" />
              <el-option label="审核中" value="pending" />
            </el-select>
          </el-form-item>
          <el-form-item label="评分">
            <el-input-number
              v-model="searchForm.min_rating"
              :min="0"
              :max="5"
              :step="0.1"
              placeholder="最低评分"
            />
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

      <!-- 餐厅列表 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="restaurantList"
          style="width: 100%"
          border
        >
          <el-table-column prop="restaurant_id" label="ID" width="80" />
          <el-table-column prop="name" label="餐厅名称" min-width="150" />
          <el-table-column prop="address" label="地址" min-width="200" />
          <el-table-column prop="phone" label="联系电话" width="120" />
          <el-table-column prop="rating" label="评分" width="100">
            <template #default="scope">
              <el-rate :value="scope.row.rating" disabled show-score />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 'open' ? 'success' : scope.row.status === 'closed' ? 'danger' : 'warning'"
              >
                {{ scope.row.status === 'open' ? '营业中' : scope.row.status === 'closed' ? '已关闭' : '审核中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="160" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button size="small" @click="handleDetail(scope.row)">详情</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      destroy-on-close
    >
      <el-form ref="restaurantFormRef" :model="restaurantForm" :rules="restaurantRules" label-width="120px">
        <el-form-item label="餐厅名称" prop="name">
          <el-input v-model="restaurantForm.name" placeholder="请输入餐厅名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="restaurantForm.address" placeholder="请输入餐厅地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="restaurantForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="营业时间" prop="opening_hours">
          <el-input v-model="restaurantForm.opening_hours" placeholder="例如：09:00-21:00" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="restaurantForm.status" placeholder="请选择状态">
            <el-option label="营业中" value="open" />
            <el-option label="已关闭" value="closed" />
            <el-option label="审核中" value="pending" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="餐厅详情" width="700px">
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="餐厅ID">{{ currentDetail?.restaurant_id }}</el-descriptions-item>
          <el-descriptions-item label="餐厅名称">{{ currentDetail?.name }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ currentDetail?.address }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail?.phone }}</el-descriptions-item>
          <el-descriptions-item label="营业时间">{{ currentDetail?.opening_hours }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{ currentDetail?.rating }}</el-descriptions-item>
          <el-descriptions-item label="状态" span="2">
            <el-tag
              :type="currentDetail?.status === 'open' ? 'success' : currentDetail?.status === 'closed' ? 'danger' : 'warning'"
            >
              {{ currentDetail?.status === 'open' ? '营业中' : currentDetail?.status === 'closed' ? '已关闭' : '审核中' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const submitting = ref(false)
const restaurantFormRef = ref()
const currentDetail = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  status: '',
  min_rating: null
})

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 餐厅列表数据
const restaurantList = ref([
  {
    restaurant_id: 1,
    name: '美味蛋糕店',
    address: '北京市朝阳区建国路88号',
    phone: '010-12345678',
    opening_hours: '09:00-21:00',
    rating: 4.8,
    status: 'open',
    created_at: '2023-12-01 10:00:00'
  },
  {
    restaurant_id: 2,
    name: '甜心烘焙',
    address: '北京市海淀区中关村大街1号',
    phone: '010-87654321',
    opening_hours: '10:00-22:00',
    rating: 4.5,
    status: 'open',
    created_at: '2023-12-02 11:00:00'
  }
])

// 餐厅表单
const restaurantForm = reactive({
  restaurant_id: null,
  name: '',
  address: '',
  phone: '',
  opening_hours: '',
  status: 'open'
})

// 表单验证规则
const restaurantRules = {
  name: [
    { required: true, message: '请输入餐厅名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入餐厅地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ]
}

// 对话框标题
const dialogTitle = computed(() => {
  return restaurantForm.restaurant_id ? '编辑餐厅' : '新增餐厅'
})

// 初始化数据
onMounted(() => {
  fetchRestaurantList()
})

// 获取餐厅列表
const fetchRestaurantList = async () => {
  loading.value = true
  try {
    // 实际项目中使用API调用
    // const response = await restaurantApi.getRestaurantList({
    //   page: pagination.current,
    //   page_size: pagination.size,
    //   ...searchForm
    // })
    // restaurantList.value = response.data
    // pagination.total = response.total
    
    // 模拟数据
    pagination.total = restaurantList.value.length
    loading.value = false
  } catch (error) {
    ElMessage.error('获取餐厅列表失败')
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchRestaurantList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    status: '',
    min_rating: null
  })
  pagination.current = 1
  fetchRestaurantList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size
  fetchRestaurantList()
}

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchRestaurantList()
}

// 新增餐厅
const handleAdd = () => {
  Object.assign(restaurantForm, {
    restaurant_id: null,
    name: '',
    address: '',
    phone: '',
    opening_hours: '',
    status: 'open'
  })
  dialogVisible.value = true
}

// 编辑餐厅
const handleEdit = (row) => {
  Object.assign(restaurantForm, { ...row })
  dialogVisible.value = true
}

// 查看详情
const handleDetail = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 删除餐厅
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该餐厅吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中使用API调用
    // await restaurantApi.deleteRestaurant(row.restaurant_id)
    
    // 模拟删除
    const index = restaurantList.value.findIndex(item => item.restaurant_id === row.restaurant_id)
    if (index !== -1) {
      restaurantList.value.splice(index, 1)
    }
    
    ElMessage.success('删除成功')
    fetchRestaurantList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!restaurantFormRef.value) return
  
  try {
    await restaurantFormRef.value.validate()
    submitting.value = true
    
    if (restaurantForm.restaurant_id) {
      // 编辑
      // await restaurantApi.updateRestaurant(restaurantForm.restaurant_id, restaurantForm)
      const index = restaurantList.value.findIndex(item => item.restaurant_id === restaurantForm.restaurant_id)
      if (index !== -1) {
        restaurantList.value[index] = { ...restaurantForm }
      }
      ElMessage.success('更新成功')
    } else {
      // 新增
      // const response = await restaurantApi.addRestaurant(restaurantForm)
      const newRestaurant = {
        ...restaurantForm,
        restaurant_id: Date.now(),
        rating: 0,
        created_at: new Date().toLocaleString('zh-CN')
      }
      restaurantList.value.unshift(newRestaurant)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    fetchRestaurantList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.restaurant-management {
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