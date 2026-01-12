<template>
  <div class="profile-page">
    <!-- 侧边导航栏 -->
    <NavSide />
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 顶部标题 -->
      <div class="page-header">
        <div class="header-title">我的</div>
        <div class="header-right"></div>
      </div>

      <!-- 用户信息 -->
      <div class="user-info">
        <div class="user-header">
          <div class="avatar-section" @click="editAvatar">
            <img :src="userInfo.avatarUrl || defaultAvatar" class="avatar" />
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
        </div>
        
        <div class="user-stats">
          <div class="stat-item" @click="viewOrders">
            <div class="stat-value">{{ userStats.total_orders || 0 }}</div>
            <div class="stat-label">全部订单</div>
          </div>
          <div class="stat-item" @click="viewBalance">
            <div class="stat-value">¥{{ userInfo.balance?.toFixed(2) || '0.00' }}</div>
            <div class="stat-label">余额</div>
          </div>
        </div>
      </div>

      <!-- 功能列表 -->
      <div class="function-list">
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
          </div>
        </div>
      </div>

      <!-- 退出登录 -->
      <div class="logout-section">
        <el-button type="danger" @click="logout" class="logout-btn">退出登录</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Camera, Location, 
  ArrowRight} from '@element-plus/icons-vue'
import api from '../api/index.js'
import NavSide from './NavSide.vue'

const router = useRouter()

// 数据定义
const userInfo = ref({})
const userStats = ref({})
const editForm = ref({
  username: '',
  email: ''
})
const defaultAvatar = ''

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


// 编辑头像
const editAvatar = () => {
  ElMessage.info('头像上传功能开发中')
}

// 查看订单
const viewOrders = () => {
  router.push('/orders')
}

// 查看地址
const viewAddresses = () => {
  router.push('/addresses')
}

// 查看余额
const viewBalance = () => {
  router.push('/balance')
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
  background: linear-gradient(180deg, #FF9500 0%, #FF6B00 100%);
  display: flex;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding: 20px;
  padding-left: 260px; /* 为侧边导航栏留出空间 */
  padding-bottom: 20px;
}

/* 顶部标题栏 */
.page-header {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
  margin-bottom: 20px;
}

.header-left,
.header-right {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  flex: 1;
  text-align: center;
}

/* 用户信息区域 */
.user-info {
  background: #ffffff;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.edit-avatar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 107, 0, 0.3);
}

.user-details {
  flex: 1;
}

.username {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
}

.user-phone {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.user-level .el-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 用户统计区域 */
.user-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f5f5f5;
}

.stat-item {
  cursor: pointer;
  flex: 1;
}

.stat-item:hover .stat-value {
  color: #FF6B00;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  transition: color 0.3s ease;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

/* 功能列表区域 */
.function-list {
  background: #ffffff;
  margin-bottom: 15px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
}

.function-section {
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.function-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 15px;
  font-weight: 500;
}

/* 功能网格 */
.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.function-item:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
}

.function-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 28px;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.function-icon.pending { 
  background: linear-gradient(135deg, #FF9500 0%, #FF6B00 100%); 
}
.function-icon.preparing { 
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%); 
}
.function-icon.delivering { 
  background: linear-gradient(135deg, #34C759 0%, #28A745 100%); 
}
.function-icon.all { 
  background: linear-gradient(135deg, #AF52DE 0%, #8E24AA 100%); 
}

.function-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

/* 服务列表 */
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
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.3s ease;
}

.service-item:last-child {
  border-bottom: none;
}

.service-item:hover {
  background-color: #f8f9fa;
}

.service-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FFF2E8 0%, #FFE6D6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #FF6B00;
  font-size: 22px;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 3px;
  font-weight: 500;
}

.service-desc {
  font-size: 13px;
  color: #999;
}

.service-item .el-icon {
  color: #999;
  font-size: 16px;
}

/* 退出登录区域 */
.logout-section {
  padding: 0;
}

.logout-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background: linear-gradient(135deg, #FF3B30 0%, #D70015 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #D70015 0%, #B30010 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 59, 48, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding-left: 220px; /* 为侧边导航栏留出空间 */
  }
}
</style>