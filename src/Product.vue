<template>
  <div class="product-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增商品
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="商品名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入商品名称"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item label="所属餐厅">
            <el-select
              v-model="searchForm.restaurant_id"
              placeholder="请选择餐厅"
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="restaurant in restaurantList"
                :key="restaurant.restaurant_id"
                :label="restaurant.name"
                :value="restaurant.restaurant_id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              @change="handleSearch"
            >
              <el-option label="上架" value="online" />
              <el-option label="下架" value="offline" />
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

      <!-- 商品列表 -->
      <div class="table-container">
        <el-table
          v-loading="loading"
          :data="productList"
          style="width: 100%"
          border
        >
          <el-table-column prop="product_id" label="ID" width="80" />
          <el-table-column prop="name" label="商品名称" min-width="150" />
          <el-table-column prop="restaurant_name" label="所属餐厅" width="150" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 'online' ? 'success' : 'danger'"
              >
                {{ scope.row.status === 'online' ? '上架' : '下架' }}
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
      <el-form ref="productFormRef" :model="productForm" :rules="productRules" label-width="120px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="所属餐厅" prop="restaurant_id">
          <el-select v-model="productForm.restaurant_id" placeholder="请选择餐厅">
            <el-option
              v-for="restaurant in restaurantList"
              :key="restaurant.restaurant_id"
              :label="restaurant.name"
              :value="restaurant.restaurant_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number
            v-model="productForm.price"
            :min="0"
            :step="0.01"
            :precision="2"
            placeholder="请输入价格"
          />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="productForm.stock"
            :min="0"
            placeholder="请输入库存"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="productForm.description"
            type="textarea"
            rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="productForm.status" placeholder="请选择状态">
            <el-option label="上架" value="online" />
            <el-option label="下架" value="offline" />
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
    <el-dialog v-model="detailDialogVisible" title="商品详情" width="700px">
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品ID">{{ currentDetail?.product_id }}</el-descriptions-item>
          <el-descriptions-item label="商品名称">{{ currentDetail?.name }}</el-descriptions-item>
          <el-descriptions-item label="所属餐厅">{{ currentDetail?.restaurant_name }}</el-descriptions-item>
          <el-descriptions-item label="价格">¥{{ currentDetail?.price?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="库存">{{ currentDetail?.stock }}</el-descriptions-item>
          <el-descriptions-item label="状态" span="2">
            <el-tag
              :type="currentDetail?.status === 'online' ? 'success' : 'danger'"
            >
              {{ currentDetail?.status === 'online' ? '上架' : '下架' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="描述" span="2">{{ currentDetail?.description }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const submitting = ref(false)
const productFormRef = ref()
const currentDetail = ref(null)

// 餐厅列表（用于下拉选择）
const restaurantList = ref([
  { restaurant_id: 1, name: '美味蛋糕店' },
  { restaurant_id: 2, name: '甜心烘焙' }
])

// 搜索表单
const searchForm = reactive({
  name: '',
  restaurant_id: null,
  status: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 商品列表数据
const productList = ref([
  {
    product_id: 1,
    name: '巧克力蛋糕',
    restaurant_id: 1,
    restaurant_name: '美味蛋糕店',
    price: 98.00,
    stock: 50,
    description: '精选进口巧克力制作，口感丝滑',
    status: 'online',
    created_at: '2023-12-01 10:00:00'
  },
  {
    product_id: 2,
    name: '草莓蛋糕',
    restaurant_id: 2,
    restaurant_name: '甜心烘焙',
    price: 88.00,
    stock: 30,
    description: '新鲜草莓搭配奶油，酸甜可口',
    status: 'online',
    created_at: '2023-12-02 11:00:00'
  }
])

// 商品表单
const productForm = reactive({
  product_id: null,
  name: '',
  restaurant_id: null,
  price: 0,
  stock: 0,
  description: '',
  status: 'online'
})

// 表单验证规则
const productRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  restaurant_id: [
    { required: true, message: '请选择所属餐厅', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', min: 0, message: '库存必须大于等于0', trigger: 'blur' }
  ]
}

// 对话框标题
const dialogTitle = computed(() => {
  return productForm.product_id ? '编辑商品' : '新增商品'
})

// 初始化数据
onMounted(() => {
  fetchProductList()
})

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    // 实际项目中使用API调用
    // const response = await productApi.getProductList({
    //   page: pagination.current,
    //   page_size: pagination.size,
    //   ...searchForm
    // })
    // productList.value = response.data
    // pagination.total = response.total
    
    // 模拟数据
    pagination.total = productList.value.length
    loading.value = false
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchProductList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    restaurant_id: null,
    status: ''
  })
  pagination.current = 1
  fetchProductList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size
  fetchProductList()
}

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchProductList()
}

// 新增商品
const handleAdd = () => {
  Object.assign(productForm, {
    product_id: null,
    name: '',
    restaurant_id: null,
    price: 0,
    stock: 0,
    description: '',
    status: 'online'
  })
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row) => {
  Object.assign(productForm, { ...row })
  dialogVisible.value = true
}

// 查看详情
const handleDetail = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 删除商品
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 实际项目中使用API调用
    // await productApi.deleteProduct(row.product_id)
    
    // 模拟删除
    const index = productList.value.findIndex(item => item.product_id === row.product_id)
    if (index !== -1) {
      productList.value.splice(index, 1)
    }
    
    ElMessage.success('删除成功')
    fetchProductList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!productFormRef.value) return
  
  try {
    await productFormRef.value.validate()
    submitting.value = true
    
    if (productForm.product_id) {
      // 编辑
      // await productApi.updateProduct(productForm.product_id, productForm)
      const index = productList.value.findIndex(item => item.product_id === productForm.product_id)
      if (index !== -1) {
        const restaurant = restaurantList.value.find(r => r.restaurant_id === productForm.restaurant_id)
        productList.value[index] = {
          ...productForm,
          restaurant_name: restaurant?.name
        }
      }
      ElMessage.success('更新成功')
    } else {
      // 新增
      // const response = await productApi.addProduct(productForm)
      const restaurant = restaurantList.value.find(r => r.restaurant_id === productForm.restaurant_id)
      const newProduct = {
        ...productForm,
        product_id: Date.now(),
        restaurant_name: restaurant?.name,
        created_at: new Date().toLocaleString('zh-CN')
      }
      productList.value.unshift(newProduct)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    fetchProductList()
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
.product-management {
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