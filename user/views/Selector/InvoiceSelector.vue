<template>
    <div class="invoice-selector">
      <!-- 发票类型选择 -->
      <div class="invoice-type-section">
        <h3>发票类型</h3>
        <el-radio-group v-model="invoiceType" @change="handleTypeChange">
          <div class="radio-option">
            <el-radio :label="0">
              <div class="option-content">
                <el-icon><Close /></el-icon>
                <span class="option-text">不开发票</span>
              </div>
            </el-radio>
          </div>
          <div class="radio-option">
            <el-radio :label="1">
              <div class="option-content">
                <el-icon><User /></el-icon>
                <span class="option-text">个人发票</span>
              </div>
            </el-radio>
          </div>
          <div class="radio-option">
            <el-radio :label="2">
              <div class="option-content">
                <el-icon><OfficeBuilding /></el-icon>
                <span class="option-text">单位发票</span>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
  
      <!-- 个人发票信息 -->
      <div class="invoice-form" v-if="invoiceType === 1">
        <el-form
          ref="personalForm"
          :model="personalInvoice"
          :rules="personalRules"
          label-position="top"
        >
          <el-form-item label="发票抬头" prop="title">
            <el-input
              v-model="personalInvoice.title"
              placeholder="请输入个人发票抬头"
              maxlength="50"
            />
          </el-form-item>
        </el-form>
      </div>
  
      <!-- 单位发票信息 -->
      <div class="invoice-form" v-if="invoiceType === 2">
        <el-form
          ref="companyForm"
          :model="companyInvoice"
          :rules="companyRules"
          label-position="top"
        >
          <el-form-item label="单位名称" prop="companyName">
            <el-input
              v-model="companyInvoice.companyName"
              placeholder="请输入单位名称"
              maxlength="100"
            />
          </el-form-item>
          <el-form-item label="纳税人识别号" prop="taxNumber">
            <el-input
              v-model="companyInvoice.taxNumber"
              placeholder="请输入纳税人识别号"
              maxlength="20"
            />
            <div class="form-hint">
              注：请确保税号正确无误，发票一旦开出将无法修改
            </div>
          </el-form-item>
          <el-form-item label="开户行及账号" prop="bankInfo">
            <el-input
              v-model="companyInvoice.bankInfo"
              placeholder="请输入开户行及账号（选填）"
              maxlength="100"
            />
          </el-form-item>
          <el-form-item label="注册地址及电话" prop="addressInfo">
            <el-input
              v-model="companyInvoice.addressInfo"
              placeholder="请输入注册地址及电话（选填）"
              maxlength="100"
            />
          </el-form-item>
        </el-form>
      </div>
  
      <!-- 保存按钮 -->
      <div class="dialog-footer">
        <el-button @click="resetInvoice">重置</el-button>
        <el-button
          type="primary"
          @click="saveInvoice"
        >
          保存
        </el-button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Close, User, OfficeBuilding } from '@element-plus/icons-vue'
  
  // 定义props
  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    }
  })
  
  // 定义事件
  const emit = defineEmits(['update:modelValue'])
  
  // 数据定义
  const invoiceType = ref(0) // 0: 不开发票, 1: 个人发票, 2: 单位发票
  
  // 个人发票信息
  const personalInvoice = reactive({
    title: ''
  })
  
  // 单位发票信息
  const companyInvoice = reactive({
    companyName: '',
    taxNumber: '',
    bankInfo: '',
    addressInfo: ''
  })
  
  // 表单引用
  const personalForm = ref(null)
  const companyForm = ref(null)
  
  // 表单验证规则
  const personalRules = {
    title: [
      { required: true, message: '请输入个人发票抬头', trigger: 'blur' },
      { min: 2, max: 50, message: '发票抬头长度在 2 到 50 个字符', trigger: 'blur' }
    ]
  }
  
  const companyRules = {
    companyName: [
      { required: true, message: '请输入单位名称', trigger: 'blur' },
      { min: 2, max: 100, message: '单位名称长度在 2 到 100 个字符', trigger: 'blur' }
    ],
    taxNumber: [
      { required: true, message: '请输入纳税人识别号', trigger: 'blur' },
      { pattern: /^[A-Z0-9]{15,20}$/, message: '请输入正确的纳税人识别号', trigger: 'blur' }
    ]
  }
  
  // 监听外部modelValue变化
  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        try {
          const parsed = JSON.parse(newValue)
          invoiceType.value = parsed.type
          
          if (parsed.type === 1) {
            personalInvoice.title = parsed.title || ''
          } else if (parsed.type === 2) {
            companyInvoice.companyName = parsed.companyName || ''
            companyInvoice.taxNumber = parsed.taxNumber || ''
            companyInvoice.bankInfo = parsed.bankInfo || ''
            companyInvoice.addressInfo = parsed.addressInfo || ''
          }
        } catch (error) {
          // 如果解析失败，重置为不开发票
          invoiceType.value = 0
        }
      } else {
        invoiceType.value = 0
      }
    },
    { immediate: true }
  )
  
  // 处理发票类型变化
  const handleTypeChange = () => {
    // 类型变化时重置对应表单
    if (invoiceType.value === 1) {
      if (personalForm.value) {
        personalForm.value.resetFields()
      }
    } else if (invoiceType.value === 2) {
      if (companyForm.value) {
        companyForm.value.resetFields()
      }
    }
  }
  
  // 保存发票信息
  const saveInvoice = async () => {
    let invoiceData = ''
    
    if (invoiceType.value === 0) {
      // 不开发票
      invoiceData = ''
    } else if (invoiceType.value === 1) {
      // 个人发票
      await personalForm.value.validate(async (valid) => {
        if (valid) {
          invoiceData = JSON.stringify({
            type: 1,
            title: personalInvoice.title,
            typeName: '个人发票'
          })
          emit('update:modelValue', invoiceData)
          ElMessage.success('个人发票信息保存成功')
        }
      })
    } else if (invoiceType.value === 2) {
      // 单位发票
      await companyForm.value.validate(async (valid) => {
        if (valid) {
          invoiceData = JSON.stringify({
            type: 2,
            companyName: companyInvoice.companyName,
            taxNumber: companyInvoice.taxNumber,
            bankInfo: companyInvoice.bankInfo,
            addressInfo: companyInvoice.addressInfo,
            typeName: '单位发票'
          })
          emit('update:modelValue', invoiceData)
          ElMessage.success('单位发票信息保存成功')
        }
      })
    }
  }
  
  // 重置发票信息
  const resetInvoice = () => {
    invoiceType.value = 0
    
    if (personalForm.value) {
      personalForm.value.resetFields()
    }
    
    if (companyForm.value) {
      companyForm.value.resetFields()
    }
    
    emit('update:modelValue', '')
    ElMessage.info('发票信息已重置')
  }
  </script>
  
  <style scoped>
  .invoice-selector {
    padding: 10px 0;
  }
  
  .invoice-type-section h3,
  .invoice-form h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }
  
  .radio-option {
    margin-bottom: 15px;
  }
  
  .option-content {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid #e8e8e8;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .option-content:hover {
    border-color: #ff6b00;
    background-color: #fff8f3;
  }
  
  :deep(.el-radio__input.is-checked + .el-radio__label .option-content) {
    border-color: #ff6b00;
    background-color: #fff8f3;
  }
  
  .option-content .el-icon {
    font-size: 20px;
    margin-right: 10px;
    color: #ff6b00;
  }
  
  .option-text {
    font-size: 15px;
    color: #333;
  }
  
  .invoice-form {
    margin-top: 25px;
    padding-top: 25px;
    border-top: 1px solid #f0f0f0;
  }
  
  .form-hint {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
  }
  
  .dialog-footer {
    margin-top: 30px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .dialog-footer .el-button {
    min-width: 100px;
  }
  
  /* 响应式设计 */
  @media (max-width: 480px) {
    .invoice-selector {
      padding: 5px 0;
    }
    
    .invoice-type-section h3,
    .invoice-form h3 {
      font-size: 15px;
      margin-bottom: 12px;
    }
    
    .option-content {
      padding: 10px;
    }
    
    .option-content .el-icon {
      font-size: 18px;
      margin-right: 8px;
    }
    
    .option-text {
      font-size: 14px;
    }
    
    .invoice-form {
      margin-top: 20px;
      padding-top: 20px;
    }
    
    .dialog-footer {
      margin-top: 20px;
      flex-direction: column;
    }
    
    .dialog-footer .el-button {
      width: 100%;
      min-width: auto;
    }
  }
  </style>