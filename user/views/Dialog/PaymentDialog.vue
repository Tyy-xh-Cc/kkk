<template>
    <el-dialog
      v-model="visible"
      title="订单支付"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="payment-dialog"
    >
      <!-- 订单信息 -->
      <div class="order-info">
        <div class="order-item">
          <span class="label">订单编号:</span>
          <span class="value">{{ orderId }}</span>
        </div>
        <div class="order-item">
          <span class="label">支付金额:</span>
          <span class="value amount">¥{{ amount.toFixed(2) }}</span>
        </div>
      </div>
      
      <!-- 支付方式选择 -->
      <div class="payment-methods">
        <h3>选择支付方式</h3>
        <el-radio-group v-model="selectedPaymentMethod">
          <div 
            v-for="method in paymentMethods" 
            :key="method.id" 
            class="payment-method-item"
          >
            <el-radio :label="method.id">
              <div class="method-content">
                <div class="method-icon">
                  {{ method.icon }}
                </div>
                <div class="method-info">
                  <div class="method-name">{{ method.name }}</div>
                  <div class="method-desc">{{ method.description }}</div>
                </div>
                <el-icon v-if="selectedPaymentMethod === method.id"><Check /></el-icon>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      
      <!-- 支付提示 -->
      <div class="payment-notice">
        <el-alert
          title="支付提示"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <div>
              <p>1. 支付成功后，订单将自动更新状态</p>
              <p>2. 若支付后订单状态未更新，请联系客服</p>
              <p>3. 支付超时时间：30分钟</p>
            </div>
          </template>
        </el-alert>
      </div>
      
      <!-- 底部操作 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmPayment" 
            :loading="isProcessing"
          >
            {{ isProcessing ? '处理中...' : '立即支付' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Check, CreditCard, Wallet, Qrcode } from '@element-plus/icons-vue'
  import api from '@/api'
  
  // Props
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  })
  
  // Emits
  const emit = defineEmits(['update:visible', 'success'])
  
  // 数据
  const selectedPaymentMethod = ref('alipay')
  const isProcessing = ref(false)
  
  // 支付方式列表
  const paymentMethods = ref([
    {
      id: 'alipay',
      name: '支付宝',
      description: '推荐使用支付宝App扫码支付',
      icon: <Qrcode />
    },
    {
      id: 'wechat',
      name: '微信支付',
      description: '推荐使用微信App扫码支付',
      icon: <Qrcode />
    },
    {
      id: 'credit_card',
      name: '银行卡支付',
      description: '支持国内外主要银行卡',
      icon: <CreditCard />
    },
    {
      id: 'wallet',
      name: '余额支付',
      description: '使用账户余额支付',
      icon: <Wallet />
    }
  ])
  
  // 关闭对话框
  const closeDialog = () => {
    emit('update:visible', false)
    selectedPaymentMethod.value = 'alipay' // 重置支付方式
  }
  
  // 确认支付
  const confirmPayment = async () => {
    try {
      isProcessing.value = true
      
      // 调用支付API
      const res = await api.payment.createPayment({
        order_id: props.orderId,
        amount: props.amount,
        payment_method: selectedPaymentMethod.value
      })
      
      // 模拟支付处理过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 假设支付成功
      if (res.success) {
        // 发射支付成功事件
        emit('success')
        
        // 显示成功消息
        ElMessage.success('支付成功')
        
        // 关闭对话框
        closeDialog()
      } else {
        ElMessage.error(res.message || '支付失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      ElMessage.error('支付失败，请稍后重试')
    } finally {
      isProcessing.value = false
    }
  }
  </script>
  
  <style scoped>
  .payment-dialog {
    .order-info {
      background-color: #f7f8fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      
      .order-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: #606266;
        }
        
        .value {
          font-weight: 500;
          
          &.amount {
            color: #ff6b00;
            font-size: 24px;
            font-weight: bold;
          }
        }
      }
    }
    
    .payment-methods {
      margin-bottom: 20px;
      
      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: bold;
      }
      
      .payment-method-item {
        margin-bottom: 10px;
        border: 1px solid #e4e7ed;
        border-radius: 8px;
        overflow: hidden;
        
        &:hover {
          border-color: #409eff;
        }
        
        .method-content {
          display: flex;
          align-items: center;
          padding: 15px;
          
          .method-icon {
            font-size: 24px;
            margin-right: 15px;
            color: #409eff;
          }
          
          .method-info {
            flex: 1;
            
            .method-name {
              font-weight: 500;
              margin-bottom: 5px;
            }
            
            .method-desc {
              font-size: 12px;
              color: #909399;
            }
          }
          
          .el-icon {
            color: #67c23a;
          }
        }
        
        :deep(.el-radio__input) {
          display: none;
        }
        
        :deep(.is-checked) {
          border-color: #67c23a;
          background-color: #f0f9eb;
        }
      }
    }
    
    .payment-notice {
      margin-bottom: 10px;
      
      :deep(.el-alert__content) {
        padding: 10px 0;
      }
    }
    
    .dialog-footer {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  }
  
  /* 响应式设计 */
  @media (min-width: 768px) {
    .payment-dialog {
      width: 500px;
    }
  }
  </style>