<template>
  <div class="profile-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-title">我的</div>
    </div>

    <!-- 用户信息 -->
    <div class="user-info">
      <div class="user-header">
        <div class="avatar-section" @click="editAvatar">
          <img :src="userInfo.avatar_url || defaultAvatar" class="avatar" />
          <div class="edit-avatar">
            <el-icon><Camera /></el-icon>
          </div>
        </div>
        <div class="user-details">
          <div class="username">{{ userInfo.username || '用户' }}</div>
          <div class="user-phone">{{ userInfo.phone || '未绑定手机号' }}</div>
          <div class="user-level">
            <el-tag size="small" type="warning">普通会员</el-tag>
          </div>
        </div>
        <div class="user-actions">
          <el-button type="text" @click="editProfile">编辑资料</el-button>
        </div>
      </div>
      
      <div class="user-stats">
        <div class="stat-item" @click="viewOrders">
          <div class="stat-value">{{ userStats.total_orders || 0 }}</div>
          <div class="stat-label">全部订单</div>
        </div>
        <div class="stat-item" @click="viewCoupons">
          <div class="stat-value">{{ userStats.coupon_count || 0 }}</div>
          <div class="stat-label">优惠券</div>
        </div>
        <div class="stat-item" @click="viewBalance">
          <div class="stat-value">¥{{ userInfo.balance?.toFixed(2) || '0.00' }}</div>
          <div class="stat-label">余额</div>
        </div>
        <div class="stat-item" @click="viewFavorites">
          <div class="stat-value">{{ userStats.favorite_count || 0 }}</div>
          <div class="stat-label">收藏</div>
        </div>
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="function-list">
      <!-- 我的订单 -->
      <div class="function-section">
        <div class="section-title">我的订单</div>
        <div class="function-grid">
          <div class="function-item" @click="viewOrderStatus('pending')">
            <div class="function-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="function-name">待付款</div>
          </div>
          <div class="function-item" @click="viewOrderStatus('preparing')">
            <div class="function-icon preparing">
              <el-icon><Food /></el-icon>
            </div>
            <div class="function-name">待接单</div>
          </div>
          <div class="function-item" @click="viewOrderStatus('delivering')">
            <div class="function-icon delivering">
              <el-icon><Van /></el-icon>
            </div>
            <div class="function-name">配送中</div>
          </div>
          <div class="function-item" @click="viewOrders">
            <div class="function-icon all">
              <el-icon><List /></el-icon>
            </div>
            <div class="function-name">全部订单</div>
          </div>
        </div>
      </div>

      <!-- 我的服务 -->
      <div class="function-section">
        <div class="section-title">我的服务</div>
        <div class="service-list">
          <div class="service-item" @click="viewAddresses">
            <div class="service-icon">
              <el-icon><Location /></el-icon>
            </div>
            <div class="service-info">
              <div class="service-name">收货地址</div>
              <div class="service-desc">管理收货地址</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="service-item" @click="viewCoupons">
            <div class="service-icon">
              <el-icon><Discount /></el-icon>
            </div>
            <div class="service-info">
              <div class="service-name">优惠券</div>
              <div class="service-desc">{{ userStats.coupon_count || 0 }}张可用</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="service-item" @click="viewBalance">
            <div class="service-icon">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="service-info">
              <div class="service-name">我的钱包</div>
              <div class="service-desc">余额¥{{ userInfo.balance?.toFixed(2) || '0.00' }}</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="service-item" @click="viewFavorites">
            <div class="service-icon">
              <el-icon><Star /></el-icon>
            </div>
            <div class="service-info">
              <div class="service-name">我的收藏</div>
              <div class="service-desc">{{ userStats.favorite_count || 0 }}个收藏</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 其他服务 -->
      <div class="function-section">
        <div class="section-title">其他服务</div>
        <div class="service-list">
          <div class="service-item" @click="viewHelp">
            <div class="service-icon">
              <el-icon><QuestionFilled /></el-icon>
            </div>
            <div class="service-info">
              <div class="service-name">帮助中心</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="service-item" @click="viewFeedback">
            <div class="service-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="service-info">
              <div class="service-name">意见反馈</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="service-item" @click="viewSettings">
            <div class="service-icon">
              <el-icon><Setting /></el-icon>
            </div>
            <div class="service-info">
              <div class="service-name">设置</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
          <div class="service-item" @click="viewAbout">
            <div class="service-icon">
              <el-icon><InfoFilled /></el-icon>
            </div>
            <div class="service-info">
              <div class="service-name">关于我们</div>
            </div>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-section">
      <el-button type="danger" @click="logout" class="logout-btn">退出登录</el-button>
    </div>

    <!-- 编辑资料弹窗 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑资料"
      width="90%"
    >
      <el-form 
        ref="editFormRef" 
        :model="editForm" 
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input 
            v-model="editForm.username" 
            placeholder="请输入用户名"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input 
            v-model="editForm.email" 
            placeholder="请输入邮箱"
            type="email"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Camera, Clock, Food, Van, List, Location, Discount,
  Wallet, Star, QuestionFilled, ChatDotRound, Setting,
  InfoFilled, ArrowRight
} from '@element-plus/icons-vue'
import api from '../api/index.js'

const router = useRouter()

// 数据定义
const userInfo = ref({})
const userStats = ref({})
const showEditDialog = ref(false)
const editForm = ref({
  username: '',
  email: ''
})
const defaultAvatar = 'https://via.placeholder.com/80x80?text=用户'

// API: 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await api.user.getUserInfo()
    if (res.data) {
      userInfo.value = res.data
      editForm.value = {
        username: res.data.username || '',
        email: res.data.email || ''
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// API: 获取用户统计
const getUserStats = async () => {
  try {
    const res = await api.user.getUserStats()
    userStats.value = res.data || {}
  } catch (error) {
    console.error('获取用户统计失败:', error)
  }
}

// API: 更新用户信息
const updateUserInfo = async () => {
  try {
    const res = await api.user.updateUserInfo(editForm.value)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      showEditDialog.value = false
      getUserInfo()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 编辑头像
const editAvatar = () => {
  ElMessage.info('头像上传功能开发中')
}

// 编辑资料
const editProfile = () => {
  showEditDialog.value = true
}

// 保存资料
const saveProfile = async () => {
  await updateUserInfo()
}

// 查看订单
const viewOrders = () => {
  router.push('/orders')
}

// 查看订单状态
const viewOrderStatus = (status) => {
  router.push(`/orders?status=${status}`)
}

// 查看地址
const viewAddresses = () => {
  router.push('/addresses')
}

// 查看优惠券
const viewCoupons = () => {
  router.push('/coupons')
}

// 查看余额
const viewBalance = () => {
  router.push('/balance')
}

// 查看收藏
const viewFavorites = () => {
  router.push('/favorites')
}

// 查看帮助
const viewHelp = () => {
  router.push('/help')
}

// 查看反馈
const viewFeedback = () => {
  router.push('/feedback')
}

// 查看设置
const viewSettings = () => {
  router.push('/settings')
}

// 查看关于
const viewAbout = () => {
  router.push('/about')
}

// API: 退出登录
const logout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    await api.user.logout()
    localStorage.removeItem('token')
    router.push('/login')
    ElMessage.success('已退出登录')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出失败')
    }
  }
}

// 初始化
onMounted(() => {
  getUserInfo()
  getUserStats()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.page-header {
  padding: 15px;
  background: linear-gradient(135deg, #ff6b00, #ff8c00);
  color: white;
  text-align: center;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
}

.user-info {
  background: #ffffff;
  padding: 20px 15px;
  margin-bottom: 15px;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-section {
  position: relative;
  margin-right: 15px;
  cursor: pointer;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.edit-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: #ff6b00;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-phone {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.user-actions .el-button {
  font-size: 14px;
  color: #ff6b00;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.stat-item {
  cursor: pointer;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.function-list {
  background: #ffffff;
  margin-bottom: 15px;
}

.function-section {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.function-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 15px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.function-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  font-size: 24px;
  color: white;
}

.function-icon.pending { background: #ff6b00; }
.function-icon.preparing { background: #1890ff; }
.function-icon.delivering { background: #52c41a; }
.function-icon.all { background: #722ed1; }

.function-name {
  font-size: 12px;
  color: #333;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.service-item:last-child {
  border-bottom: none;
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #ff6b00;
  font-size: 20px;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 3px;
}

.service-desc {
  font-size: 12px;
  color: #999;
}

.logout-section {
  padding: 20px 15px;
}

.logout-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}
</style>