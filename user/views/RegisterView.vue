<template>
  <div class="register-page">
    <!-- 注册表单 -->
    <div class="register-form">
      <!-- 标题部分 -->
      <div class="form-header">
        <h1>创建账号</h1>
        <p>注册后享受更多会员权益</p>
      </div>
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="0"
        size="large"
      >
        <!-- 手机号 -->
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            placeholder="请输入手机号"
            :maxlength="11"
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 短信验证码 -->
        <el-form-item prop="sms_code">
          <el-input
            v-model="registerForm.sms_code"
            placeholder="请输入短信验证码"
            :maxlength="6"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
            <template #append>
              <el-button 
                @click="sendRegisterSmsCode" 
                :disabled="smsCountdown > 0"
                :loading="sendingSms"
              >
                {{ smsButtonText }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请设置用户名"
            :maxlength="20"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">3-20个字符，支持中文、英文、数字</div>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            placeholder="请设置密码"
            type="password"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">6-20个字符，包含字母和数字</div>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirm_password">
          <el-input
            v-model="registerForm.confirm_password"
            placeholder="请再次输入密码"
            type="password"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleRegister"
            :loading="loading"
            class="register-btn"
          >
            注册
          </el-button>
        </el-form-item>

        <!-- 已有账号 -->
        <div class="login-link">
          已有账号？
          <el-button type="text" @click="goToLogin">立即登录</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Iphone, Message, User, Lock} from '@element-plus/icons-vue'
import api from '../api/index'

const router = useRouter()

// 数据定义
const registerFormRef = ref(null)
const loading = ref(false)
const sendingSms = ref(false)
const smsCountdown = ref(0)
const checkingPhone = ref(false)
const checkingUsername = ref(false)

// 注册表单
const registerForm = reactive({
  phone: '',
  sms_code: '',
  username: '',
  password: '',
  confirm_password: '',
  invite_code: '',
  agreement: false
})

// 自定义验证规则
const validatePassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error('密码长度在6到20个字符'))
  }  else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请先阅读并同意用户协议'))
  } else {
    callback()
  }
}

// 验证规则
const registerRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  sms_code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: '用户名只能包含中文、英文、数字', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { required: true, validator: validateAgreement, trigger: 'change' }
  ]
}

// 计算属性
const smsButtonText = computed(() => {
  if (sendingSms.value) return '发送中...'
  if (smsCountdown.value > 0) return `${smsCountdown.value}秒后重发`
  return '获取验证码'
})

// API: 发送注册短信验证码
const sendRegisterSmsCode = async () => {
  if (!registerForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  sendingSms.value = true
  try {
    const res = await api.common.sendSmsCode({
      phone: registerForm.phone,
      type: 'register'
    })
    console.log(res.data);
    
    if (res.data !=null) {
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

// API: 用户注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      const registerData = {
        phone: registerForm.phone,
        sms_code: registerForm.sms_code,
        username: registerForm.username,
        passwordHash: registerForm.password,
        invite_code: registerForm.invite_code || undefined
      }

      const res = await api.user.register(registerData)
      console.log(res.data);
      
      if (res.data.success) {
        ElMessage.success('注册成功！')

        // 自动登录
        const loginRes = await api.user.login({
          phone: registerForm.phone,
          passwordHash: registerForm.password,
          login_type: 'phone_password'
        })
        console.log(loginRes.data);
        
        if (loginRes.data.success) {
          const { token, user } = loginRes.data
          localStorage.setItem('token', token)
          localStorage.setItem('user_info', JSON.stringify(user))
          
          // 跳转到欢迎页面或首页
          router.push('/welcome')
        } else {
          // 注册成功但自动登录失败，跳转到登录页面
          ElMessage.info('注册成功，请登录')
          router.push('/login')
        }
      } else {
        ElMessage.error(res.message || '注册失败')
      }
    } catch (error) {
      ElMessage.error('注册失败，请检查网络连接')
      console.error('注册失败:', error)
    } finally {
      loading.value = false
    }
  })
}
// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
// 监听键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleRegister()
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
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #fce4ec 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
}

.register-header {
  padding: 40px 20px;
  text-align: center;
  color: #333;
}

.header-content h1 {
  font-size: 32px;
  font-weight: bold;
  margin: 0 0 8px 0;
}

.header-content p {
  font-size: 14px;
  color: #666;
}

.back-btn {
  position: absolute;
  top: 15px;
  left: 10px;
  width: 35px;
  height: 35px;
  background: rgba(255, 255, 255, 0.3); /* 更浅的背景色 */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333; /* 更深的图标颜色 */
  cursor: pointer;
  z-index: 10;
}
.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.form-header p {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0;
}
.register-form {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
.form-tip {
  font-size: 12px;
  color: #666; /* 更柔和的提示文字颜色 */
  margin-top: 4px;
  line-height: 1.4;
}

.register-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8c00 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: white;
  margin-top: 16px;
}

.register-btn:hover {
  background: linear-gradient(135deg, #ff8c00 0%, #ff6b6b 100%);
}

.login-link {
  text-align: center;
  color: #555; /* 更深的文字颜色 */
  font-size: 13px;
  margin-top: 15px;
}

.login-link .el-button {
  padding: 0;
  font-size: 13px;
  color: #ff6b6b; /* 更鲜明的链接颜色 */
}

.other-register {
  padding: 15px 20px;
  background: #f9f9f9; /* 更浅的背景色 */
  border-top: 1px solid #eee;
}

.other-title {
  position: relative;
  margin-bottom: 12px;
  text-align: center;
}

.other-title span {
  display: inline-block;
  padding: 0 8px;
  background: #f9f9f9;
  color: #888; /* 更柔和的文字颜色 */
  font-size: 13px;
  position: relative;
  z-index: 1;
}

.other-title::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
  transform: translateY(-50%);
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.social-btn {
  width: 45px;
  height: 45px;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.social-btn.wechat {
  background: #07c160;
  color: white;
}

.social-btn.qq {
  background: #12b7f5;
  color: white;
}

.social-btn.qq .qq-icon {
  font-size: 12px;
  font-weight: bold;
}

/* 表单样式调整 */
:deep(.el-input__wrapper) {
  background: #f5f5f5; /* 更浅的输入框背景色 */
}

:deep(.el-input__inner) {
  background: transparent;
}

:deep(.el-form-item) {
  margin-bottom: 15px; /* 调整表单项间距 */
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  border: none;
}

:deep(.el-button--primary:hover) {
  opacity: 0.9;
}

:deep(.el-checkbox) {
  color: #555; /* 更深的文字颜色 */
  font-size: 13px;
}

:deep(.el-checkbox .el-button) {
  padding: 0;
  font-size: 13px;
  color: #555;
}

:deep(.el-checkbox .el-button:hover) {
  color: #ff6b6b; /* 更鲜明的链接颜色 */
}

:deep(.el-input-group__append) {
  display: flex;
  align-items: center; /* 垂直居中 */
}

/* 调整“获取验证码”按钮样式 */
:deep(.el-input-group__append .el-button) {
  height: 40px; /* 调高按钮 */
  font-size: 14px; /* 调大字体 */
  padding: 0 16px; /* 增加内边距 */
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  border-radius: 4px;
  color: white;
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

:deep(.el-input-group__append .el-button:hover) {
  background: linear-gradient(135deg, #fad0c4 0%, #ff9a9e 100%);
}
</style>