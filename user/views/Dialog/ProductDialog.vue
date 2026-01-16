<template>
  <el-dialog
    :model-value="visible"
    :title="safeProduct.name"
    width="90%"
    :close-on-click-modal="true"  
    :close-on-press-escape="true"  
    :show-close="true" 
    @update:model-value="$emit('update:visible', $event)"
    @close="closeDialog"  
    class="product-dialog"
  >
    <div class="product-detail">
      <!-- 产品图片 -->
      <div class="product-image">
        <img :src="safeProduct.imageUrl || defaultImage" :alt="safeProduct.name" />
      </div>
      
      <!-- 产品信息 -->
      <div class="product-info">
        <h3 class="product-name">{{ safeProduct.name }}</h3>
        
        <!-- 价格 -->
        <div class="product-price">
          <span class="current-price">¥{{ safeProduct.price }}</span>
          <span v-if="safeProduct.originalPrice" class="original-price">¥{{ safeProduct.originalPrice }}</span>
        </div>
        
        <!-- 描述 -->
        <div class="product-desc" v-if="safeProduct.description">
          {{ safeProduct.description }}
        </div>
        
        <!-- 库存 -->
        <div class="product-stock" v-if="safeProduct.stock !== undefined">
          库存：{{ safeProduct.stock }}份
        </div>
        
        <!-- 销量 -->
        <div class="product-sales" v-if="safeProduct.sales">
          月售{{ safeProduct.sales }}份
        </div>
        
        <!-- 口味选择（如果有） -->
        <div class="product-options" v-if="safeProduct.options && safeProduct.options.length">
          <h4>选择口味</h4>
          <div class="options-list">
            <el-radio-group v-model="selectedOption">
              <el-radio-button
                v-for="option in safeProduct.options"
                :key="option.id"
                :label="option.id"
                >
                  {{ option.name }}
                  <span v-if="option.price"> +¥{{ option.price }}</span>
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>
          
          <!-- 数量选择 -->
          <div class="product-quantity">
            <h4>数量</h4>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="product.stock || 999"
              size="large"
            />
          </div>
        </div>
      </div>
      
 <!-- 底部操作 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="addToCart" :disabled="quantity > (product.stock || 999)">
          添加到购物车
        </el-button>
         <!-- <el-button type="success" @click="buyNow" :disabled="quantity > (product.stock || 999)">
          直接购买
        </el-button> -->
      </div>
    </template>
  </el-dialog>
</template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  
  // Props
  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    product: {
      type: Object,
      default: () => ({})
    }
  })
  // Emits
  const emit = defineEmits(['update:visible', 'add-to-cart', 'buy-now'])
  
  // 数据
  const quantity = ref(1)
  const selectedOption = ref('')
  const defaultImage = 'https://via.placeholder.com/300x300?text=Product'
  
// 监听产品变化，重置选项和数量
watch(() => props.product, (newProduct) => {
  // 添加null检查
  if (!newProduct) return;
  
  quantity.value = 1
  selectedOption.value = newProduct.options?.[0]?.id || ''
}, { immediate: true })
  // 关闭对话框
  const closeDialog = () => {
    emit('update:visible', false)
  }

const safeProduct = computed(() => {
  return props.product || {}
})
  // 添加到购物车
  const addToCart = () => {
    // 检查库存
    if (props.product.stock !== undefined && quantity.value > props.product.stock) {
      ElMessage.warning('库存不足')
      return
    }
    
    // 准备添加到购物车的数据
    const cartItem = {
      productId: props.product.id,
      name: props.product.name,
      price: props.product.price,
      imageUrl: props.product.imageUrl,
      quantity: quantity.value,
      optionId: selectedOption.value
    }
    
    // 发送添加到购物车事件
    emit('add-to-cart', cartItem)
    
    // 关闭对话框
    closeDialog()
    
    // 显示成功消息
    ElMessage.success('已添加到购物车')
  }
  // 直接购买
const buyNow = () => {
  // 检查库存
  if (props.product.stock !== undefined && quantity.value > props.product.stock) {
    ElMessage.warning('库存不足')
    return
  }
  
  // 准备直接购买的数据
  const orderItem = {
    productId: props.product.id,
    name: props.product.name,
    price: props.product.price,
    imageUrl: props.product.imageUrl,
    quantity: quantity.value,
    optionId: selectedOption.value
  }
  
  // 发送直接购买事件
  emit('buy-now', orderItem)
  
  // 关闭对话框
  closeDialog()
  
  // 显示成功消息
  ElMessage.success('即将跳转到结算页面')
}
  </script>
  
  <style scoped>
    .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 0;
}
  .product-dialog {
    .product-detail {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 10px 0;
    }
    
    .product-image {
      text-align: center;
      img {
        width: 100%;
        max-width: 300px;
        border-radius: 8px;
      }
    }
    
    .product-info {
      .product-name {
        margin: 0 0 10px 0;
        font-size: 20px;
        font-weight: bold;
      }
      
      .product-price {
        margin-bottom: 15px;
        .current-price {
          font-size: 24px;
          font-weight: bold;
          color: #ff6b00;
        }
        
        .original-price {
          margin-left: 10px;
          font-size: 16px;
          color: #999;
          text-decoration: line-through;
        }
      }
      
      .product-desc {
        margin-bottom: 15px;
        color: #666;
        line-height: 1.5;
      }
      
      .product-stock,
      .product-sales {
        margin-bottom: 10px;
        color: #666;
      }
      
      .product-options {
        margin-bottom: 20px;
        h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: bold;
        }
        
        .options-list {
          max-width: 100%;
          overflow-x: auto;
        }
      }
      
      .product-quantity {
        margin-bottom: 20px;
        h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: bold;
        }
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
    .product-dialog {
      .product-detail {
        flex-direction: row;
      }
      
      .product-image {
        flex: 1;
      }
      
      .product-info {
        flex: 1;
      }
    }
  }
  </style>