<template>
  <div class="user-management">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleRefresh">
              <el-icon>
                <Refresh />
              </el-icon>刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索和筛选 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="用户姓名">
            <el-input v-model="searchForm.name" placeholder="请输入用户姓名" clearable @clear="handleSearch" />
          </el-form-item>
          <el-form-item label="手机号码">
            <el-input v-model="searchForm.phone" placeholder="请输入手机号码" clearable @clear="handleSearch" />
          </el-form-item>
          <el-form-item label="用户身份">
            <el-select v-model="searchForm.identity" placeholder="请选择身份" clearable @change="handleSearch">
              <el-option label="普通用户" value="1" />
              <el-option label="商家" value="2" />
              <el-option label="管理员" value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户状态">
            <el-select v-model="searchForm.status" placeholder="请选择状态" clearable @change="handleSearch">
              <el-option label="活跃" value="active" />
              <el-option label="非活跃" value="inactive" />
              <el-option label="封禁" value="banned" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon>
                <Search />
              </el-icon>搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon>
                <Refresh />
              </el-icon>重置
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户列表 -->
      <div class="table-container">
        <el-table v-loading="loading" :data="userList" style="width: 100%" border>
          <el-table-column prop="user_id" label="用户ID" width="100" />
          <el-table-column prop="name" label="用户姓名" width="120" />
          <el-table-column prop="phone" label="手机号码" width="120" />
          <el-table-column prop="email" label="邮箱" width="200" />
          <el-table-column prop="balance" label="账户余额" width="120">
            <template #default="scope">
              ¥{{ scope.row.balance.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="identity_text" label="用户身份" width="100">
            <template #default="scope">
              <el-tag :type="getIdentityTagType(scope.row.identity)">
                {{ scope.row.identity_text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="用户状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ scope.row.status_text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="注册时间" width="160" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleDetail(scope.row)">详情</el-button>
              <el-button size="small" @click="handleRecharge(scope.row)">充值</el-button>
              <el-button :type="scope.row.status === 'banned' ? 'success' : 'warning'" size="small"
                @click="handleToggleStatus(scope.row)">
                {{ scope.row.status === 'banned' ? '启用' : '禁用' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="pagination.total"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="用户详情" width="700px">
      <div class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ currentDetail?.user_id }}</el-descriptions-item>
          <el-descriptions-item label="用户姓名">{{ currentDetail?.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号码">{{ currentDetail?.phone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentDetail?.email }}</el-descriptions-item>
          <el-descriptions-item label="用户身份">
            <el-tag :type="getIdentityTagType(currentDetail?.identity)">
              {{ currentDetail?.identity_text }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="账户余额">¥{{ currentDetail?.balance?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="用户状态" span="2">
            <el-tag :type="getStatusTagType(currentDetail?.status)">
              {{ currentDetail?.status_text }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentDetail?.created_at }}</el-descriptions-item>
          <el-descriptions-item label="最后登录时间">{{ currentDetail?.last_login_at }}</el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <h4>收货地址</h4>
        <el-table :data="currentDetail?.addresses || []" style="width: 100%" border>
          <el-table-column prop="address_id" label="ID" width="80" />
          <el-table-column prop="address" label="地址" min-width="250" />
          <el-table-column prop="is_default" label="默认地址" width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.is_default" type="success">是</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 充值对话框 -->
    <el-dialog v-model="rechargeDialogVisible" title="用户充值" width="500px">
      <el-form ref="rechargeFormRef" :model="rechargeForm" :rules="rechargeRules" label-width="100px">
        <el-form-item label="用户姓名">
          <el-input v-model="rechargeForm.user_name" disabled />
        </el-form-item>
        <el-form-item label="当前余额">
          <el-input v-model="rechargeForm.current_balance" disabled />
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input-number v-model="rechargeForm.amount" :min="1" :step="1" placeholder="请输入充值金额" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rechargeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRechargeSubmit">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import userApi from './user.js'

const loading = ref(false)
const detailDialogVisible = ref(false)
const rechargeDialogVisible = ref(false)
const submitting = ref(false)
const rechargeFormRef = ref()
const currentDetail = ref(null)

// 搜索表单
const searchForm = reactive({
  name: '',
  phone: '',
  identity: '',
  status: ''
})

// 搜索表单的状态选项
const statusOptions = [
  { label: '活跃', value: 'active' },
  { label: '非活跃', value: 'inactive' },
  { label: '封禁', value: 'banned' }
]
// 分页配置
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 用户列表数据
const userList = ref([
])

// 充值表单
const rechargeForm = reactive({
  user_id: '',
  user_name: '',
  current_balance: 0,
  amount: 0
})

// 表单验证规则
const rechargeRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '充值金额必须大于等于1', trigger: 'blur' }
  ]
}

// 初始化数据
onMounted(() => {
  fetchUserList()
})
// 获取用户状态标签类型
const getStatusTagType = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'warning'
    case 'banned':
      return 'danger'
    default:
      return 'info'
  }
}
// 获取用户身份标签类型
const getIdentityTagType = (identity) => {
  switch (identity) {
    case '1': // 普通用户
      return 'info'
    case '2': // 商家
      return 'warning'
    case '3': // 管理员
      return 'danger'
    default:
      return 'info'
  }
}
// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const response = await userApi.getUserList({
      page: pagination.current,
      size: pagination.size,
      ...searchForm
    })

    const identityMap = {
      '1': '普通用户',
      '2': '商家',
      '3': '管理员'
    }
    const statusMap = {
      'active': { text: '活跃', type: 'success' },
      'inactive': { text: '非活跃', type: 'warning' },
      'banned': { text: '封禁', type: 'danger' }
    }
    const formatUserData = (user) => ({
      user_id: user.id,
      name: user.username,
      phone: user.phone,
      email: user.email,
      balance: user.balance || 0,
      identity: user.identity || '1',
      status: user.status,
      status_text: statusMap[user.status]?.text || '未知状态',
      identity_text: identityMap[user.identity] || '未知身份',
      created_at: user.createdAt ? new Date(user.createdAt).toLocaleString('zh-CN') : '未知',
      last_login_at: user.updatedAt ? new Date(user.updatedAt).toLocaleString('zh-CN') : '未知',
      addresses: user.addresses || []
    })
    if (response && response.data) {
      const apiData = response.data
      if (apiData.content) {
        const userData = Array.isArray(apiData.content) ? apiData.content : []
        userList.value = userData.map(formatUserData)
        pagination.total = apiData.totalElements || userData.length
        pagination.current = apiData.page || 1
        pagination.size = apiData.size || 10
      } else if (Array.isArray(apiData)) {
        userList.value = apiData.map(formatUserData)
        pagination.total = apiData.length
      } else {
        userList.value = []
        pagination.total = 0
      }
    } else {
      userList.value = []
      pagination.total = 0
    }

  } catch (error) {
    console.log(error);
    ElMessage.error('获取用户列表失败')
    loading.value = false
  } finally {
    loading.value = false
  }
}

// 刷新
const handleRefresh = () => {
  fetchUserList()
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchUserList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    status: ''
  })
  pagination.current = 1
  fetchUserList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.size = size
  fetchUserList()
}

// 当前页变化
const handleCurrentChange = (current) => {
  pagination.current = current
  fetchUserList()
}

// 查看详情
const handleDetail = (row) => {
  currentDetail.value = { ...row }
  detailDialogVisible.value = true
}

// 充值
const handleRecharge = (row) => {
  Object.assign(rechargeForm, {
    user_id: row.user_id,
    user_name: row.name,
    current_balance: row.balance,
    amount: 0
  })
  rechargeDialogVisible.value = true
}

// 提交充值
const handleRechargeSubmit = async () => {
  if (!rechargeFormRef.value) return

  try {
    await rechargeFormRef.value.validate()
    submitting.value = true

    await userApi.rechargeUser(rechargeForm.user_id, rechargeForm.amount)

    ElMessage.success('充值成功')
    rechargeDialogVisible.value = false
    fetchUserList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('充值失败')
    }
  } finally {
    submitting.value = false
  }
}

// 切换用户状态
const handleToggleStatus = async (row) => {
  try {
    const newStatus = row.status === 'banned' ? 'active' : 'banned'
    const actionText = row.status === 'banned' ? '启用' : '禁用'

    await ElMessageBox.confirm(`确定要${actionText}该用户吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await userApi.updateUserStatus(row.user_id, newStatus)

    ElMessage.success(`${actionText}成功`)
    fetchUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}
</script>

<style scoped>
.user-management {
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