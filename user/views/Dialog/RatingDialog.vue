<template>
    <el-dialog
      :model-value="visible"
      title="评价订单"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @update:model-value="$emit('update:visible', $event)"
      class="rating-dialog"
    >
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
      
      <!-- 菜品评分（如果有） -->
      <div class="dishes-rating" v-if="orderItems && orderItems.length">
        <h3>菜品评分</h3>
        <div class="dishes-list">
          <div
            v-for="(item, index) in orderItems"
            :key="index"
            class="dish-item"
          >
            <div class="dish-info">
              <img :src="item.product_image || defaultImage" class="dish-image" />
              <div class="dish-name">{{ item.product_name }}</div>
            </div>
            <el-rate
              v-model="item.rating"
              :max="5"
              :show-score="true"
              score-template="{value}"
              size="small"
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
          :rows="4"
          placeholder="请输入您的评价..."
          maxlength="200"
          show-word-limit
        />
      </div>
      
      <!-- 图片上传 -->
      <div class="rating-images">
        <h3>上传图片（可选）</h3>
        <el-upload
          v-model:file-list="imageFiles"
          action="#"
          list-type="picture-card"
          :auto-upload="false"
          :on-change="handleImageChange"
          :on-remove="handleImageRemove"
          :limit="5"
        >
          <el-icon><Plus /></el-icon>
          <template #tip>
            <div class="el-upload__tip">
              最多上传5张图片，每张不超过2MB
            </div>
          </template>
        </el-upload>
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
  import { Plus } from '@element-plus/icons-vue'
  import api from '../../api/index'
  
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
    restaurantId: {
      type: String,
      required: true
    }
  })
  
  // Emits
  const emit = defineEmits(['update:visible', 'success'])
  
  // 数据
  const overallRating = ref(0)
  const ratingContent = ref('')
  const imageFiles = ref([])
  const isAnonymous = ref(false)
  const isSubmitting = ref(false)
  const orderItems = ref([])
  const defaultImage = 'https://via.placeholder.com/80x80?text=Product'
  
  // 生命周期钩子
  onMounted(() => {
    // 获取订单商品列表（用于菜品评分）
    getOrderItems()
  })
  
  // 获取订单商品
  const getOrderItems = async () => {
    try {
      const res = await api.order.getOrderItems(props.orderId)
      if (res.success) {
        // 为每个商品添加rating字段
        orderItems.value = res.data.map(item => ({
          ...item,
          rating: 5 // 默认五星
        }))
      }
    } catch (error) {
      console.error('获取订单商品失败:', error)
      ElMessage.error('获取订单商品失败')
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
  
  // 图片上传处理
  const handleImageChange = (file) => {
    // 这里可以添加图片预览处理
    return true
  }
  
  // 图片删除处理
  const handleImageRemove = (file) => {
    // 这里可以添加图片删除逻辑
    return true
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
    imageFiles.value = []
    isAnonymous.value = false
    orderItems.value = []
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
        order_id: props.orderId,
        restaurant_id: props.restaurantId,
        overall_rating: overallRating.value,
        content: ratingContent.value,
        is_anonymous: isAnonymous.value,
        dish_ratings: orderItems.value.map(item => ({
          product_id: item.product_id,
          rating: item.rating
        })),
        // images: imageFiles.value.map(file => file.url) // 如果需要上传图片，这里处理
      }
      
      // 调用评价API
      const res = await api.order.submitRating(ratingData)
      
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
  .rating-dialog {
    .overall-rating {
      margin-bottom: 25px;
      
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
    
    .dishes-rating {
      margin-bottom: 25px;
      
      h3 {
        margin: 0 0 15px 0;
        font-size: 16px;
        font-weight: bold;
      }
      
      .dishes-list {
        max-height: 200px;
        overflow-y: auto;
      }
      
      .dish-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .dish-info {
          display: flex;
          align-items: center;
          
          .dish-image {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            margin-right: 15px;
          }
          
          .dish-name {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
    
    .rating-images {
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
    .rating-dialog {
      width: 500px;
    }
    
    .dishes-rating .dish-info .dish-name {
      max-width: 300px;
    }
  }
  </style>