<template>
    <div class="address-selector">
      <!-- 地址列表 -->
      <div class="address-list">
        <div
          v-for="address in addressList"
          :key="address.address_id"
          class="address-item"
          :class="{ selected: modelValue?.address_id === address.address_id }"
          @click="selectAddress(address)"
        >
          <div class="address-header">
            <div class="receiver-info">
              <span class="name">{{ address.receiver_name }}</span>
              <span class="phone">{{ address.phone }}</span>
            </div>
            <div class="actions">
              <el-button
                size="small"
                type="text"
                @click.stop="editAddress(address)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="text"
                @click.stop="showDeleteConfirm(address.address_id)"
              >
                删除
              </el-button>
            </div>
          </div>
          <div class="address-content">
            <el-tag
              v-if="address.is_default"
              size="small"
              type="success"
              class="default-tag"
            >
              默认
            </el-tag>
            <span class="address-detail">{{ address.address }}</span>
          </div>
          <div
            class="default-toggle"
            v-if="!address.is_default"
            @click.stop="setDefault(address.address_id)"
          >
            <el-switch
              v-model="address.is_default"
              active-color="#ff6b00"
              @change="setDefault(address.address_id)"
            />
            <span>设为默认</span>
          </div>
        </div>
      </div>
  
      <!-- 空地址提示 -->
      <div class="empty-address" v-if="addressList.length === 0">
        <el-empty
          description="暂无收货地址"
          @click="showAddDialog = true"
        >
          <template #image>
            <el-icon><location /></el-icon>
          </template>
          <template #description>
            <span @click="showAddDialog = true" class="add-address-link">添加收货地址</span>
          </template>
        </el-empty>
      </div>
  
      <!-- 添加/编辑地址按钮 -->
      <div class="add-address-btn">
        <el-button
          type="primary"
          plain
          block
          @click="showAddDialog = true"
        >
          <el-icon><Plus /></el-icon>
          添加收货地址
        </el-button>
      </div>
  
      <!-- 添加/编辑地址对话框 -->
      <el-dialog
        v-model="showAddDialog"
        :title="editingAddress ? '编辑地址' : '添加地址'"
        width="90%"
      >
        <el-form
          ref="addressForm"
          :model="formData"
          :rules="addressRules"
          label-position="top"
        >
          <el-form-item label="收货人" prop="receiver_name">
            <el-input
              v-model="formData.receiver_name"
              placeholder="请输入收货人姓名"
              maxlength="20"
            />
          </el-form-item>
  
          <el-form-item label="手机号码" prop="phone">
            <el-input
              v-model="formData.phone"
              placeholder="请输入手机号码"
              maxlength="11"
            />
          </el-form-item>
  
          <el-form-item label="所在地区" prop="region_id">
            <el-cascader
              v-model="formData.region_id"
              :options="regionOptions"
              placeholder="请选择省市区"
              :props="{ value: 'region_id', label: 'region_name', children: 'children' }"
              @change="handleRegionChange"
            />
          </el-form-item>
  
          <el-form-item label="详细地址" prop="address">
            <el-input
              v-model="formData.address"
              type="textarea"
              placeholder="请输入详细地址"
              rows="3"
              maxlength="200"
            />
          </el-form-item>
  
          <el-form-item>
            <el-checkbox v-model="formData.is_default">设为默认地址</el-checkbox>
          </el-form-item>
        </el-form>
  
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showAddDialog = false">取消</el-button>
            <el-button
              type="primary"
              @click="saveAddress"
              :loading="saving"
            >
              {{ editingAddress ? '保存修改' : '添加地址' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Location, Plus } from '@element-plus/icons-vue'
  import api from '../../api/index'
  
  // 定义props
  const props = defineProps({
    modelValue: {
      type: Object,
      default: null
    }
  })
  
  // 定义事件
  const emit = defineEmits(['update:modelValue', 'change'])
  
  // 数据定义
  const addressList = ref([])
  const showAddDialog = ref(false)
  const editingAddress = ref(null)
  const saving = ref(false)
  const regionOptions = ref([])
  
  // 表单数据
  const formData = reactive({
    receiver_name: '',
    phone: '',
    region_id: [],
    address: '',
    is_default: false
  })
  
  // 表单验证规则
  const addressRules = {
    receiver_name: [
      { required: true, message: '请输入收货人姓名', trigger: 'blur' },
      { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号码', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    region_id: [
      { required: true, message: '请选择所在地区', trigger: 'change' }
    ],
    address: [
      { required: true, message: '请输入详细地址', trigger: 'blur' },
      { min: 5, max: 200, message: '详细地址长度在 5 到 200 个字符', trigger: 'blur' }
    ]
  }
  
  // 表单引用
  const addressForm = ref(null)
  
  // 监听modelValue变化
  watch(
    () => props.modelValue,
    (newValue) => {
      // 当外部modelValue变化时，不需要额外处理，UI会自动更新
    }
  )
  
  // 初始化获取地址列表
  const fetchAddressList = async () => {
    try {
      const res = await api.address.getAddressList()
      if (res.code === 200) {
        addressList.value = res.data
      } else {
        ElMessage.error('获取地址列表失败')
      }
    } catch (error) {
      console.error('获取地址列表失败:', error)
      ElMessage.error('网络错误，请重试')
    }
  }
  
  // 获取地区列表
  const fetchRegionList = async (parentId = 0, level = 0, parent = null) => {
    try {
      const res = await api.address.getRegionList(parentId)
      if (res.code === 200) {
        const regions = res.data
        
        if (level === 0) {
          // 省份级别
          regionOptions.value = regions.map(region => ({
            ...region,
            children: []
          }))
          
          // 递归获取城市
          for (const province of regionOptions.value) {
            await fetchRegionList(province.region_id, 1, province)
          }
        } else if (level === 1) {
          // 城市级别
          parent.children = regions.map(region => ({
            ...region,
            children: []
          }))
          
          // 递归获取区县
          for (const city of parent.children) {
            await fetchRegionList(city.region_id, 2, city)
          }
        } else if (level === 2) {
          // 区县级别
          parent.children = regions
        }
      }
    } catch (error) {
      console.error('获取地区列表失败:', error)
    }
  }
  
  // 选择地址
  const selectAddress = (address) => {
    emit('update:modelValue', address)
    emit('change', address)
  }
  
  // 编辑地址
  const editAddress = (address) => {
    editingAddress.value = address
    // 填充表单数据
    formData.receiver_name = address.receiver_name
    formData.phone = address.phone
    formData.region_id = address.region_id ? address.region_id.split(',').map(Number) : []
    formData.address = address.address
    formData.is_default = address.is_default
    
    showAddDialog.value = true
  }
  
  // 删除地址确认
  const showDeleteConfirm = (addressId) => {
    ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      deleteAddress(addressId)
    }).catch(() => {
      // 取消删除
    })
  }
  
  // 删除地址
  const deleteAddress = async (addressId) => {
    try {
      const res = await api.address.deleteAddress(addressId)
      if (res.code === 200) {
        ElMessage.success('地址删除成功')
        // 如果删除的是当前选中的地址，清空选中状态
        if (props.modelValue?.address_id === addressId) {
          emit('update:modelValue', null)
          emit('change', null)
        }
        // 重新获取地址列表
        await fetchAddressList()
      } else {
        ElMessage.error(res.message || '地址删除失败')
      }
    } catch (error) {
      console.error('删除地址失败:', error)
      ElMessage.error('网络错误，请重试')
    }
  }
  
  // 设置默认地址
  const setDefault = async (addressId) => {
    try {
      const res = await api.address.setDefaultAddress(addressId)
      if (res.code === 200) {
        ElMessage.success('默认地址设置成功')
        // 重新获取地址列表
        await fetchAddressList()
      } else {
        ElMessage.error(res.message || '默认地址设置失败')
      }
    } catch (error) {
      console.error('设置默认地址失败:', error)
      ElMessage.error('网络错误，请重试')
    }
  }
  
  // 保存地址（添加或编辑）
  const saveAddress = async () => {
    // 表单验证
    if (!addressForm.value) return
    
    await addressForm.value.validate(async (valid) => {
      if (valid) {
        saving.value = true
        
        try {
          const addressData = {
            receiver_name: formData.receiver_name,
            phone: formData.phone,
            region_id: formData.region_id.join(','),
            address: formData.address,
            is_default: formData.is_default
          }
          
          let res
          if (editingAddress.value) {
            // 编辑地址
            res = await api.address.updateAddress(editingAddress.value.address_id, addressData)
          } else {
            // 添加地址
            res = await api.address.addAddress(addressData)
          }
          
          if (res.code === 200) {
            ElMessage.success(editingAddress.value ? '地址编辑成功' : '地址添加成功')
            showAddDialog.value = false
            // 重新获取地址列表
            await fetchAddressList()
            // 如果是新添加的默认地址，自动选中
            if (formData.is_default) {
              const newAddress = res.data
              emit('update:modelValue', newAddress)
              emit('change', newAddress)
            }
          } else {
            ElMessage.error(res.message || (editingAddress.value ? '地址编辑失败' : '地址添加失败'))
          }
        } catch (error) {
          console.error(editingAddress.value ? '编辑地址失败:' : '添加地址失败:', error)
          ElMessage.error('网络错误，请重试')
        } finally {
          saving.value = false
          // 重置表单
          resetForm()
        }
      }
    })
  }
  
  // 重置表单
  const resetForm = () => {
    formData.receiver_name = ''
    formData.phone = ''
    formData.region_id = []
    formData.address = ''
    formData.is_default = false
    editingAddress.value = null
    if (addressForm.value) {
      addressForm.value.resetFields()
    }
  }
  
  // 地区变化处理
  const handleRegionChange = (value) => {
    // 可以在这里添加地区变化的处理逻辑
  }
  
  // 组件挂载时获取地址列表和地区列表
  onMounted(async () => {
    await fetchAddressList()
    await fetchRegionList()
  })
  </script>
  
  <style scoped>
  .address-selector {
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .address-list {
    margin-bottom: 20px;
  }
  
  .address-item {
    padding: 15px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .address-item:hover {
    border-color: #ff6b00;
    background-color: #fff8f3;
  }
  
  .address-item.selected {
    border-color: #ff6b00;
    background-color: #fff8f3;
  }
  
  .address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .receiver-info {
    display: flex;
    align-items: center;
  }
  
  .name {
    font-size: 16px;
    font-weight: bold;
    margin-right: 15px;
  }
  
  .phone {
    font-size: 14px;
    color: #666;
  }
  
  .actions {
    display: flex;
    gap: 10px;
  }
  
  .address-content {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
  }
  
  .default-tag {
    margin-right: 10px;
  }
  
  .address-detail {
    flex: 1;
    font-size: 14px;
    color: #333;
    line-height: 1.4;
  }
  
  .default-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
  }
  
  .empty-address {
    padding: 40px 0;
    text-align: center;
  }
  
  .add-address-link {
    color: #ff6b00;
    cursor: pointer;
    text-decoration: underline;
  }
  
  .add-address-btn {
    margin-top: 20px;
  }
  
  /* 对话框样式 */
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  </style>