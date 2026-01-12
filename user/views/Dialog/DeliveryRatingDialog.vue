<template>
   <el-dialog
      :model-value="visible"
      title="评价骑手"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @update:model-value="$emit('update:visible', $event)"
      class="delivery-rating-dialog"
    >
      <!-- 骑手信息 -->
      <div class="delivery-person-info" v-if="deliveryInfo">
        <img :src="deliveryInfo.avatar || defaultAvatar" class="avatar" />
        <div class="info">
          <div class="name">{{ deliveryInfo.name }}</div>
          <div class="rating">
            <el-rate :model-value="deliveryInfo.rating" disabled size="small" />
            <span class="rating-text">{{ deliveryInfo.rating || 0 }}分</span>
          </div>
        </div>
      </div>
      
      <!-- 整体评分 -->
      <div class="overall-rating">
        <h3>总体评分</h3>
        <div class="rating-stars">
          <el-rate
            v-model="overallRating"
            :max="5"
            :show-score="true"
            score-template="{value} 分"
            size="large"
          />
        </div>
        <div class="rating-desc" v-if="overallRating">
          {{ getRatingDescription(overallRating) }}
        </div>
      </div>
      
      <!-- 维度评分 -->
      <div class="dimension-rating">
        <h3>服务维度</h3>
        <div class="dimensions">
          <div class="dimension-item">
            <div class="dimension-name">配送速度</div>
            <el-rate
              v-model="dimensions.speed"
              :max="5"
              :show-score="true"
              score-template="{value}"
            />
          </div>
          <div class="dimension-item">
            <div class="dimension-name">服务态度</div>
            <el-rate
              v-model="dimensions.service"
              :max="5"
              :show-score="true"
              score-template="{value}"
            />
          </div>
          <div class="dimension-item">
            <div class="dimension-name">餐品完好</div>
            <el-rate
              v-model="dimensions.package"
              :max="5"
              :show-score="true"
              score-template="{value}"
            />
          </div>
          <div class="dimension-item">
            <div class="dimension-name">准时送达</div>
            <el-rate
              v-model="dimensions.timely"
              :max="5"
              :show-score="true"
              score-template="{value}"
            />
          </div>
        </div>
      </div>
      
      <!-- 评价内容 -->
      <div class="rating-content">
        <h3>评价内容</h3>
        <el-input
          v-model="ratingContent"
          type="textarea"
          :rows="3"
          placeholder="请输入您对骑手的评价..."
          maxlength="100"
          show-word-limit
        />
      </div>
      
      <!-- 匿名评价选项 -->
      <div class="anonymous-option">
        <el-checkbox v-model="isAnonymous">匿名评价</el-checkbox>
      </div>
      
      <!-- 底部操作 -->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeDialog">取消</el-button>
          <el-button
            type="primary"
            @click="submitRating"
            :disabled="!overallRating"
            :loading="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '提交评价' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import api from '../../api/index'
  
  // Props
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    deliveryId: {
      type: String,
      required: true
    },
    orderId: {
      type: String,
      required: true
    }
  })
  
  // Emits
  const emit = defineEmits(['update:visible', 'success'])
  
  // 数据
  const overallRating = ref(0)
  const ratingContent = ref('')
  const isAnonymous = ref(false)
  const isSubmitting = ref(false)
  const defaultAvatar = 'https://via.placeholder.com/80x80?text=Rider'
  const deliveryInfo = ref({})
  
  // 维度评分
  const dimensions = ref({
    speed: 5,     // 配送速度
    service: 5,   // 服务态度
    package: 5,   // 餐品完好
    timely: 5     // 准时送达
  })
  
  // 生命周期钩子
  onMounted(() => {
    // 获取骑手信息（如果需要）
    getDeliveryInfo()
  })
  
  // 获取骑手信息
  const getDeliveryInfo = async () => {
    try {
      const res = await api.delivery.getDeliveryInfo(props.deliveryId)
      if (res.success) {
        deliveryInfo.value = res.data
      }
    } catch (error) {
      console.error('获取骑手信息失败:', error)
      // 可以忽略错误，继续显示评价界面
    }
  }
  
  // 获取评分描述
  const getRatingDescription = (rating) => {
    const descriptions = {
      1: '非常差',
      2: '差',
      3: '一般',
      4: '好',
      5: '非常好'
    }
    return descriptions[rating] || ''
  }
  
  // 关闭对话框
  const closeDialog = () => {
    emit('update:visible', false)
    resetForm()
  }
  
  // 重置表单
  const resetForm = () => {
    overallRating.value = 0
    ratingContent.value = ''
    isAnonymous.value = false
    Object.keys(dimensions.value).forEach(key => {
      dimensions.value[key] = 5
    })
  }
  
  // 提交评价
  const submitRating = async () => {
    try {
      isSubmitting.value = true
      
      // 验证评分
      if (!overallRating.value) {
        ElMessage.warning('请选择总体评分')
        return
      }
      
      // 准备评价数据
      const ratingData = {
        delivery_id: props.deliveryId,
        order_id: props.orderId,
        overall_rating: overallRating.value,
        content: ratingContent.value,
        is_anonymous: isAnonymous.value,
        dimension_ratings: {
          speed: dimensions.value.speed,
          service: dimensions.value.service,
          package: dimensions.value.package,
          timely: dimensions.value.timely
        }
      }
      
      // 调用评价API
      const res = await api.delivery.submitRating(ratingData)
      
      if (res.success) {
        // 发射成功事件
        emit('success')
        
        // 显示成功消息
        ElMessage.success('评价提交成功')
        
        // 关闭对话框
        closeDialog()
      } else {
        ElMessage.error(res.message || '评价提交失败')
      }
    } catch (error) {
      console.error('评价提交失败:', error)
      ElMessage.error('评价提交失败，请稍后重试')
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <style scoped>
  .delivery-rating-dialog {
    .delivery-person-info {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 25px;
      padding: 15px;
      background-color: #f7f8fa;
      border-radius: 8px;
      
      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin-right: 20px;
      }
      
      .info {
        text-align: left;
        
        .name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .rating {
          display: flex;
          align-items: center;
          
          .rating-text {
            margin-left: 10px;
            color: #909399;
          }
        }
      }
    }
    
    .overall-rating {
      margin-bottom: 25px;
      text-align: center;
      
      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: bold;
      }
      
      .rating-stars {
        margin-bottom: 10px;
      }
      
      .rating-desc {
        color: #409eff;
        font-size: 14px;
      }
    }
    
    .dimension-rating {
      margin-bottom: 25px;
      
      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: bold;
      }
      
      .dimensions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        
        .dimension-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          
          .dimension-name {
            margin-bottom: 10px;
            font-size: 14px;
            color: #606266;
          }
        }
      }
    }
    
    .rating-content {
      margin-bottom: 25px;
      
      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: bold;
      }
    }
    
    .anonymous-option {
      margin-bottom: 15px;
      text-align: center;
    }
    
    .dialog-footer {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  }
  
  /* 响应式设计 */
  @media (min-width: 768px) {
    .delivery-rating-dialog {
      width: 500px;
    }
  }
  </style>