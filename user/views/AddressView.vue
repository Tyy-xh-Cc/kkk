<template>
  <div class="address-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <h1>地址管理</h1>
    </div>

    <!-- 地址列表 -->
    <div class="address-list">
      <div v-if="addresses.length === 0 && !loading" class="empty-address">
        <div class="empty-icon">
          <el-icon><Location /></el-icon>
        </div>
        <p class="empty-text">暂无收货地址</p>
        <p class="empty-subtext">添加地址后下单更方便</p>
        <el-button type="primary" @click="addAddress">添加新地址</el-button>
      </div>

      <div 
        v-else
        v-for="address in addresses" 
        :key="address.address_id" 
        class="address-item"
      >
        <div class="address-content" @click="selectAddress(address)">
          <div class="address-header">
            <div class="address-name">{{ address.name }}</div>
            <div class="address-tags">
              <el-tag v-if="address.isDefault" size="small" type="success">默认</el-tag>
            </div>
          </div>
          <div class="address-info">
            <div class="receiver">
              <span class="name">{{ address.receiverName }}</span>
              <span class="phone">{{ address.phone }}</span>
            </div>
            <div class="address-detail">{{ address.address }}</div>
          </div>
        </div>
        <div class="address-actions">
          <el-button 
            type="text" 
            size="small"
            @click.stop="editAddress(address)"
          >
            编辑
          </el-button>
          <el-button 
            type="text" 
            size="small"
            @click.stop="deleteAddress(address.id)"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加地址按钮 -->
    <div class="add-address-btn" v-if="addresses.length > 0">
      <el-button type="primary" size="large" @click="addAddress">
        <el-icon><Plus /></el-icon>
        添加新地址
      </el-button>
    </div>

    <!-- 地址表单弹窗 -->
    <el-dialog
      v-model="showAddressDialog"
      :title="editingAddress ? '编辑地址' : '添加新地址'"
      width="90%"
      :before-close="handleDialogClose"
    >
      <el-form 
        ref="addressFormRef" 
        :model="addressForm" 
        :rules="addressRules"
        label-width="80px"
      >
        <el-form-item label="地址标签" prop="name">
          <el-input 
            v-model="addressForm.name" 
            placeholder="如：家、公司、学校"
            maxlength="10"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="收货人" prop="receiver_name">
          <el-input 
            v-model="addressForm.receiver_name" 
            placeholder="请输入收货人姓名"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="addressForm.phone" 
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>
        <el-form-item label="所在地区" prop="area">
          <el-cascader
            v-model="addressForm.area"
            :options="areaOptions"
            placeholder="请选择省/市/区"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="address_detail">
          <el-input 
            v-model="addressForm.address_detail" 
            placeholder="请输入详细地址，如街道、小区、楼栋号、门牌号等"
            type="textarea"
            rows="3"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddress">保存</el-button>
      </template>
    </el-dialog>

    <!-- 加载中 -->
    <div class="loading" v-if="loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Location, Plus, Loading } from '@element-plus/icons-vue'
import api from '../api/index'
import { regionData } from 'element-china-area-data'

const router = useRouter()

// 数据定义
const addresses = ref([])
const showAddressDialog = ref(false)
const editingAddress = ref(null)
const addressForm = ref({
  name: '',
  receiver_name: '',
  phone: '',
  area: [],
  address_detail: '',
  isDefault: false
})
const addressRules = {
  name: [
    { required: true, message: '请输入地址标签', trigger: 'blur' },
    { max: 10, message: '长度不超过10个字符', trigger: 'blur' }
  ],
  receiver_name: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { max: 20, message: '长度不超过20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请选择所在地区', trigger: 'change' }
  ],
  address_detail: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { max: 100, message: '长度不超过100个字符', trigger: 'blur' }
  ]
}
const areaOptions = ref([])
const loading = ref(false)

// API: 获取省市区数据（使用china-area-data库）
const getRegions = async () => {
  try {
    areaOptions.value =  regionData
    
    if (!areaOptions.value || !Array.isArray(areaOptions.value)) {
      throw new Error('无法获取有效的省市区数据')
    }
  } catch (error) {
    console.error('获取地区数据失败:', error)
    ElMessage.error('获取地区数据失败: ' + error.message)
  }
}

// API: 获取地址列表
const getAddresses = async () => {
  loading.value = true
  try {
    const res = await api.address.getAddressList()
    addresses.value = res.data || []
    console.log(res.data);
    
  } catch (error) {
    ElMessage.error('获取地址列表失败')
    console.error('获取地址列表失败:', error)
  } finally {
    loading.value = false
  }
}

// API: 添加地址
const addNewAddress = async () => {
  try {
    const data = {
      name: addressForm.value.name,
      receiverName: addressForm.value.receiver_name,
      phone: addressForm.value.phone,
      address: addressForm.value.address_detail,
      area: addressForm.value.area.join('/'),
      isDefault: addressForm.value.isDefault || false
    }
    if (!addressForm.value.area || addressForm.value.area.length === 0) {
      ElMessage.error('请选择所在地区')
      return
    }
    if (!addressForm.value.address_detail) {
      ElMessage.error('请输入详细地址')
      return
    }
    if (!addressForm.value.name) {
      ElMessage.error('请输入地址标签')
      return
    }
    if (!addressForm.value.receiver_name) {
      ElMessage.error('请输入收货人姓名')
      return
    }
    if (!addressForm.value.phone) {
      ElMessage.error('请输入手机号')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(addressForm.value.phone)) {
      ElMessage.error('请输入正确的手机号')
      return
    }
    const res = await api.address.addAddress(data)
    
    if (res.data.success) {
      ElMessage.success('添加成功')
      showAddressDialog.value = false
      resetForm()
      getAddresses()
    } else {
      ElMessage.error(res.message || '添加失败')
    }
  } catch (error) {
    ElMessage.error('添加失败')
    console.error('添加地址失败:', error)
  }
}

// API: 更新地址
const updateAddress = async () => {
  try {
    const data = {
      name: addressForm.value.name,
      receiverName: addressForm.value.receiver_name,
      phone: addressForm.value.phone,
      address: addressForm.value.address_detail,
      area: addressForm.value.area.join('/'),
      isDefault: addressForm.value.isDefault || false
    }
    if (!addressForm.value.area || addressForm.value.area.length === 0) {
      ElMessage.error('请选择所在地区')
      return
    }
    if (!addressForm.value.address_detail) {
      ElMessage.error('请输入详细地址')
      return
    }
    if (!addressForm.value.name) {
      ElMessage.error('请输入地址标签')
      return
    }
    if (!addressForm.value.receiver_name) {
      ElMessage.error('请输入收货人姓名')
      return
    }
    if (!addressForm.value.phone) {
      ElMessage.error('请输入手机号')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(addressForm.value.phone)) {
      ElMessage.error('请输入正确的手机号')
      return
    }
    const res = await api.address.updateAddress(editingAddress.value.id, data)
    if (res.data) {
      ElMessage.success('更新成功')
      showAddressDialog.value = false
      resetForm()
      getAddresses()
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch (error) {
    ElMessage.error('更新失败')
    console.error('更新地址失败:', error)
  }
}

// API: 删除地址
const deleteAddress = async (addressId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    
    const res = await api.address.deleteAddress(addressId)
    
    if (res.data) {
      ElMessage.success('删除成功')
      getAddresses()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 添加地址
const addAddress = () => {
  editingAddress.value = null
  resetForm()
  showAddressDialog.value = true
}

// 编辑地址
const editAddress = (address) => {
  editingAddress.value = address
  
  addressForm.value = {
    name: address.name,
    receiver_name: address.receiverName,
    phone: address.phone,
    area: address.area ? address.area.split('/') : [],
    address_detail: address.address,
    isDefault: address.isDefault || false
  }
  showAddressDialog.value = true
}

// 保存地址
const saveAddress = async () => {
  if (editingAddress.value) {
    await updateAddress()
  } else {
    await addNewAddress()
  }
}

// 选择地址（用于订单确认页跳转过来的情况）
const selectAddress = (address) => {
  const fromCheckout = sessionStorage.getItem('from_checkout')
  if (fromCheckout === 'true') {
    // 将选择的地址传回订单确认页
    sessionStorage.setItem('selected_address', JSON.stringify(address))
    router.back()
  }
}

// 重置表单
const resetForm = () => {
  addressForm.value = {
    name: '',
    receiver_name: '',
    phone: '',
    area: [],
    address_detail: '',
    isDefault: false
  }
}

// 处理对话框关闭
const handleDialogClose = () => {
  resetForm()
  editingAddress.value = null
  showAddressDialog.value = false
}

// 初始化
onMounted(() => {
  getAddresses()
  getRegions()
})
</script>

<style scoped>
.address-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
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

.header-actions .el-button {
  width: 36px;
  height: 36px;
}

.address-list {
  padding: 15px;
}

.empty-address {
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
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #999;
}

.empty-subtext {
  margin: 0 0 30px 0;
  font-size: 14px;
  color: #ccc;
}

.empty-address .el-button {
  min-width: 120px;
}

.address-item {
  background: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.address-item:last-child {
  margin-bottom: 0;
}

.address-content {
  margin-bottom: 15px;
  cursor: pointer;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.address-name {
  font-size: 16px;
  font-weight: bold;
}

.address-tags {
  display: flex;
  gap: 8px;
}

.address-info {
  padding-left: 5px;
}

.receiver {
  margin-bottom: 8px;
}

.receiver .name {
  font-size: 14px;
  font-weight: bold;
  margin-right: 10px;
}

.receiver .phone {
  font-size: 14px;
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.address-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.address-actions .el-button {
  font-size: 12px;
}

.add-address-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
  z-index: 100;
}

.add-address-btn .el-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
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