<template>
  <div class="forgot-password-page">
    <!-- 顶部背景图 -->
    <div class="forgot-header">
      <div class="header-content">
        <h1>找回密码</h1>
        <p>请验证身份重置密码</p>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="back-btn" @click="router.back()">
      <el-icon><ArrowLeft /></el-icon>
    </div>

    <!-- 步骤条 -->
    <div class="steps" v-if="!success">
      <el-steps :active="currentStep" align-center>
        <el-step title="验证身份" />
        <el-step title="设置新密码" />
        <el-step title="完成" />
      </el-steps>
    </div>

    <!-- 步骤1：验证身份 -->
    <div v-if="currentStep === 1" class="step-content">
      <el-form
        ref="step1FormRef"
        :model="step1Form"
        :rules="step1Rules"
        label-width="0"
        size="large"
        class="forgot-form"
      >
        <el-form-item prop="phone">
          <el-input
            v-model="step1Form.phone"
            placeholder="请输入注册手机号"
            :maxlength="11"
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="sms_code">
          <el-input
            v-model="step1Form.sms_code"
            placeholder="请输入短信验证码"
            :maxlength="6"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
            <template #append>
              <el-button 
                @click="sendForgotSmsCode" 
                :disabled="smsCountdown > 0"
                :loading="sendingSms"
              >
                {{ smsButtonText }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="verifyIdentity"
            :loading="loading"
            class="next-btn"
          >
            下一步
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤2：设置新密码 -->
    <div v-else-if="currentStep === 2" class="step-content">
      <el-form
        ref="step2FormRef"
        :model="step2Form"
        :rules="step2Rules"
        label-width="0"
        size="large"
        class="forgot-form"
      >
        <el-form-item prop="new_password">
          <el-input
            v-model="step2Form.new_password"
            placeholder="请设置新密码"
            type="password"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">6-20个字符，包含字母和数字</div>
        </el-form-item>

        <el-form-item prop="confirm_password">
          <el-input
            v-model="step2Form.confirm_password"
            placeholder="请再次输入新密码"
            type="password"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <div class="button-group">
            <el-button
              @click="previousStep"
              class="prev-btn"
            >
              上一步
            </el-button>
            <el-button
              type="primary"
              size="large"
              @click="resetPassword"
              :loading="loading"
              class="next-btn"
            >
              重置密码
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <!-- 步骤3：完成 -->
    <div v-else-if="currentStep === 3" class="step-content success-content">
      <div class="success-icon">
        <el-icon><CircleCheck /></el-icon>
      </div>
      <div class="success-text">密码重置成功！</div>
      <div class="success-tip">请使用新密码登录</div>
      
      <div class="success-actions">
        <el-button
          type="primary"
          size="large"
          @click="goToLogin"
          class="login-btn"
        >
          立即登录
        </el-button>
        <el-button
          @click="goToHome"
          class="home-btn"
        >
          返回首页
        </el-button>
      </div>
    </div>

    <!-- 成功页面 -->
    <div v-else class="success-page">
      <div class="success-icon">
        <el-icon><CircleCheck /></el-icon>
      </div>
      <div class="success-text">密码重置成功！</div>
      <div class="success-tip">请使用新密码登录</div>
      
      <div class="success-actions">
        <el-button
          type="primary"
          size="large"
          @click="goToLogin"
          class="login-btn"
        >
          立即登录
        </el-button>
        <el-button
          @click="goToHome"
          class="home-btn"
        >
          返回首页
        </el-button>
      </div>
    </div>

    <!-- 帮助链接 -->
    <div class="help-links">
      无法找回？
      <el-button type="text" @click="contactCustomerService">联系客服</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, Iphone, Message, Lock, CircleCheck 
} from '@element-plus/icons-vue'
import api from '../api/index'

const router = useRouter()

// 数据定义
const currentStep = ref(1)
const loading = ref(false)
const sendingSms = ref(false)
const smsCountdown = ref(0)
const success = ref(false)

// 步骤1表单
const step1FormRef = ref(null)
const step1Form = reactive({
  phone: '',
  sms_code: ''
})

const step1Rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  sms_code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ]
}

// 步骤2表单
const step2FormRef = ref(null)
const step2Form = reactive({
  new_password: '',
  confirm_password: ''
})

const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度在6到20个字符'))
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== step2Form.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const step2Rules = {
  new_password: [
    { required: true, validator: validateNewPassword, trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 计算属性
const smsButtonText = computed(() => {
  if (sendingSms.value) return '发送中...'
  if (smsCountdown.value > 0) return `${smsCountdown.value}秒后重发`
  return '获取验证码'
})

// API: 发送忘记密码短信验证码
const sendForgotSmsCode = async () => {
  if (!step1Form.phone) {
    ElMessage.warning('请输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(step1Form.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  sendingSms.value = true
  try {
    const res = await api.common.sendSmsCode({
      phone: step1Form.phone,
      type: 'forgot_password'
    })

    if (res.code === 200) {
      ElMessage.success('验证码发送成功')
      // 开始倒计时
      smsCountdown.value = 60
      const timer = setInterval(() => {
        smsCountdown.value--
        if (smsCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(res.message || '发送失败')
    }
  } catch (error) {
    ElMessage.error('发送失败，请重试')
    console.error('发送短信验证码失败:', error)
  } finally {
    sendingSms.value = false
  }
}

// 验证身份
const verifyIdentity = async () => {
  if (!step1FormRef.value) return

  await step1FormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      // 实际开发中应该调用验证接口
      // 这里简单模拟验证成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      currentStep.value = 2
      ElMessage.success('身份验证成功')
    } catch (error) {
      ElMessage.error('验证失败，请重试')
      console.error('验证身份失败:', error)
    } finally {
      loading.value = false
    }
  })
}

// API: 重置密码
const resetPassword = async () => {
  if (!step2FormRef.value) return

  await step2FormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      const resetData = {
        phone: step1Form.phone,
        sms_code: step1Form.sms_code,
        new_password: step2Form.new_password
      }

      // 实际开发中应该调用重置密码接口
      // 这里简单模拟成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      success.value = true
      currentStep.value = 3
      ElMessage.success('密码重置成功')
    } catch (error) {
      ElMessage.error('重置失败，请重试')
      console.error('重置密码失败:', error)
    } finally {
      loading.value = false
    }
  })
}

// 上一步
const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

// 联系客服
const contactCustomerService = () => {
  ElMessage.info('客服热线：400-123-4567')
  window.location.href = 'tel:400-123-4567'
}

// 监听键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    if (currentStep.value === 1) {
      verifyIdentity()
    } else if (currentStep.value === 2) {
      resetPassword()
    }
  }
}

// 初始化
onMounted(() => {
  // 添加键盘事件监听
  window.addEventListener('keypress', handleKeyPress)
  
  // 清理
  return () => {
    window.removeEventListener('keypress', handleKeyPress)
  }
})
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.forgot-header {
  padding: 60px 20px 30px;
  text-align: center;
  color: white;
}

.header-content h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  font-weight: bold;
}

.header-content p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 15px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 10;
}

.steps {
  background: white;
  padding: 20px;
  border-radius: 10px 10px 0 0;
  margin: 0 20px;
}

.step-content {
  flex: 1;
  background: white;
  padding: 40px 30px 20px;
}

.forgot-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  line-height: 1.4;
}

.next-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  margin-top: 10px;
}

.button-group {
  display: flex;
  gap: 15px;
  width: 100%;
}

.button-group .prev-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
}

.button-group .next-btn {
  flex: 1;
  height: 50px;
  font-size: 16px;
}

.success-content {
  text-align: center;
  padding: 60px 30px;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #52c41a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
}

.success-text {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.success-tip {
  font-size: 14px;
  color: #999;
  margin-bottom: 40px;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 300px;
  margin: 0 auto;
}

.success-actions .login-btn,
.success-actions .home-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
}

.success-actions .home-btn {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #dcdcdc;
}

.success-page {
  flex: 1;
  background: white;
  padding: 80px 30px;
  text-align: center;
}

.help-links {
  padding: 20px;
  text-align: center;
  color: white;
  font-size: 14px;
}

.help-links .el-button {
  padding: 0;
  font-size: 14px;
  color: white;
  text-decoration: underline;
}

/* 表单样式调整 */
:deep(.el-input__wrapper) {
  background: #f8f9fa;
}

:deep(.el-input__inner) {
  background: transparent;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  opacity: 0.9;
}

/* 步骤条样式 */
:deep(.el-step__head) {
  font-size: 12px;
}

:deep(.el-step__title) {
  font-size: 12px;
}

/* 短信验证码按钮样式 */
:deep(.el-input-group__append) {
  padding: 0;
  border: none;
  background: transparent;
}

:deep(.el-input-group__append .el-button) {
  border-radius: 0 4px 4px 0;
  padding: 0 15px;
  height: 100%;
}
</style>