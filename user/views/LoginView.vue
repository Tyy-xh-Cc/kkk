<template>
  <div class="login-page">
    <!-- 顶部背景图 -->
    <div class="login-header">
      <div class="header-content">
        <h1>欢迎回来</h1>
        <p>登录后即可下单享受美食</p>
      </div>
    </div>

    <!-- 登录表单 -->
    <div class="login-form">
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        size="large"
      >
        <!-- 手机号登录 -->
        <div v-if="loginMethod === 'phone'" class="form-section">
          <el-form-item prop="phone">
            <el-input
              v-model="loginForm.phone"
              placeholder="请输入手机号"
              :maxlength="11"
            >
              <template #prefix>
                <el-icon><Iphone /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="sms_code" v-if="showSmsCode">
            <el-input
              v-model="loginForm.sms_code"
              placeholder="请输入短信验证码"
              :maxlength="6"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
              <template #append>
                <el-button 
                  @click="sendSmsCode" 
                  :disabled="smsCountdown > 0"
                  :loading="sendingSms"
                >
                  {{ smsButtonText }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item v-else prop="password">
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              type="password"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!-- 用户名密码登录 -->
        <div v-else class="form-section">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名/手机号"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              type="password"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!-- 登录方式切换 -->
        <div class="login-methods">
          <div class="method-switch">
            <span 
              :class="{ active: loginMethod === 'phone' }"
              @click="changeLoginMethod('phone')"
            >
              手机号登录
            </span>
            <span class="divider">|</span>
            <span 
              :class="{ active: loginMethod === 'account' }"
              @click="changeLoginMethod('account')"
            >
              账号密码登录
            </span>
          </div>

          <div class="login-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-button type="text" @click="forgotPassword">忘记密码？</el-button>
          </div>
        </div>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            @click="handleLogin"
            :loading="loading"
            class="login-btn"
          >
            登录
          </el-button>
        </el-form-item>

        <!-- 第三方登录 -->
        <div class="social-login" v-if="socialLoginEnabled">
          <div class="social-title">
            <span>其他登录方式</span>
          </div>
          <div class="social-buttons">
            <el-button
              class="social-btn wechat"
              circle
              size="large"
              @click="wechatLogin"
            >
              <el-icon><ChatDotRound /></el-icon>
            </el-button>
            <el-button
              class="social-btn qq"
              circle
              size="large"
              @click="qqLogin"
            >
              <span class="qq-icon">QQ</span>
            </el-button>
            <el-button
              class="social-btn alipay"
              circle
              size="large"
              @click="alipayLogin"
            >
              <span class="alipay-icon">支</span>
            </el-button>
          </div>
        </div>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？
          <el-button type="text" @click="goToRegister">立即注册</el-button>
        </div>
      </el-form>
    </div>

    <!-- 协议提示 -->
    <div class="agreement">
      登录即代表同意
      <el-button type="text" @click="showUserAgreement">《用户协议》</el-button>
      和
      <el-button type="text" @click="showPrivacyPolicy">《隐私政策》</el-button>
    </div>

    <!-- 游客登录 -->
    <div class="guest-login">
      <el-button type="text" @click="guestLogin">游客体验</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Iphone, Message, Lock, User, 
  ChatDotRound 
} from '@element-plus/icons-vue'
import api from '../api/index.js'

const router = useRouter()
const route = useRoute()

// 数据定义
const loginFormRef = ref(null)
const loginMethod = ref('phone') // phone: 手机号登录, account: 账号密码登录
const showSmsCode = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const sendingSms = ref(false)
const smsCountdown = ref(0)

// 登录表单
const loginForm = reactive({
  phone: '',
  username: '',
  password: '',
  sms_code: ''
})

// 验证规则
const loginRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  sms_code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ]
}

// 是否启用第三方登录
const socialLoginEnabled = ref(true)

// 计算属性
const smsButtonText = computed(() => {
  if (sendingSms.value) return '发送中...'
  if (smsCountdown.value > 0) return `${smsCountdown.value}秒后重发`
  return '获取验证码'
})

// API: 发送短信验证码
const sendSmsCode = async () => {
  if (!loginForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(loginForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  sendingSms.value = true
  try {
    const res = await api.common.sendSmsCode({
      phone: loginForm.phone,
      type: 'login'
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

// API: 用户登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      let loginData = {}

      if (loginMethod.value === 'phone') {
        if (showSmsCode.value) {
          // 短信验证码登录
          loginData = {
            phone: loginForm.phone,
            sms_code: loginForm.sms_code,
            login_type: 'sms'
          }
        } else {
          // 手机号密码登录
          loginData = {
            phone: loginForm.phone,
            password: loginForm.password,
            login_type: 'password'
          }
        }
      } else {
        // 用户名密码登录
        loginData = {
          username: loginForm.username,
          password: loginForm.password,
          login_type: 'password'
        }
      }

      const res = await api.user.login(loginData)

      if (res.code === 200) {
        // 保存token
        const { token, user } = res.data
        localStorage.setItem('token', token)
        localStorage.setItem('user_info', JSON.stringify(user))

        // 保存记住我状态
        if (rememberMe.value) {
          localStorage.setItem('remember_me', 'true')
          if (loginMethod.value === 'phone') {
            localStorage.setItem('last_phone', loginForm.phone)
          } else {
            localStorage.setItem('last_username', loginForm.username)
          }
        } else {
          localStorage.removeItem('remember_me')
          localStorage.removeItem('last_phone')
          localStorage.removeItem('last_username')
        }

        ElMessage.success('登录成功')

        // 跳转到首页或目标页面
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        ElMessage.error(res.message || '登录失败')
      }
    } catch (error) {
      ElMessage.error('登录失败，请检查网络连接')
      console.error('登录失败:', error)
    } finally {
      loading.value = false
    }
  })
}

// 切换登录方式
const changeLoginMethod = (method) => {
  loginMethod.value = method
  
  // 重置表单验证
  if (loginFormRef.value) {
    loginFormRef.value.clearValidate()
  }

  // 如果是手机号登录，重置验证码显示状态
  if (method === 'phone') {
    showSmsCode.value = false
  }
}

// 切换短信验证码/密码登录
const toggleSmsLogin = () => {
  showSmsCode.value = !showSmsCode.value
  
  // 重置表单验证
  if (loginFormRef.value) {
    loginFormRef.value.clearValidate()
  }

  // 清空验证码
  loginForm.sms_code = ''
}

// 忘记密码
const forgotPassword = () => {
  router.push('/forgot-password')
}

// 第三方登录
const wechatLogin = () => {
  ElMessage.info('微信登录功能开发中')
  // 实际开发中这里会跳转到微信授权页面
}

const qqLogin = () => {
  ElMessage.info('QQ登录功能开发中')
}

const alipayLogin = () => {
  ElMessage.info('支付宝登录功能开发中')
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 游客登录
const guestLogin = () => {
  // 生成临时token
  const guestToken = 'guest_' + Date.now()
  localStorage.setItem('guest_token', guestToken)
  
  // 设置游客标识
  localStorage.setItem('is_guest', 'true')
  
  ElMessage.info('已进入游客模式，部分功能可能受限')
  router.push('/')
}

// 显示用户协议
const showUserAgreement = () => {
  router.push('/agreement/user')
}

// 显示隐私政策
const showPrivacyPolicy = () => {
  router.push('/agreement/privacy')
}

// 页面加载时的初始化
const initLoginForm = () => {
  // 检查是否有记住的账号
  const rememberMeSaved = localStorage.getItem('remember_me') === 'true'
  
  if (rememberMeSaved) {
    rememberMe.value = true
    
    const lastPhone = localStorage.getItem('last_phone')
    const lastUsername = localStorage.getItem('last_username')
    
    if (lastPhone) {
      loginForm.phone = lastPhone
      loginMethod.value = 'phone'
    } else if (lastUsername) {
      loginForm.username = lastUsername
      loginMethod.value = 'account'
    }
  }
}

// 监听键盘事件
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}

// 初始化
onMounted(() => {
  initLoginForm()
  
  // 添加键盘事件监听
  window.addEventListener('keypress', handleKeyPress)
  
  // 清理
  return () => {
    window.removeEventListener('keypress', handleKeyPress)
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.login-header {
  padding: 60px 20px 40px;
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

.login-form {
  flex: 1;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 40px 30px 20px;
  position: relative;
}

.form-section {
  margin-bottom: 20px;
}

.login-methods {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.method-switch {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.method-switch span {
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.method-switch span.active {
  color: #ff6b00;
  font-weight: bold;
}

.divider {
  margin: 0 10px;
  color: #dcdcdc;
}

.login-options {
  display: flex;
  align-items: center;
  gap: 15px;
}

.login-options .el-button {
  padding: 0;
}

.login-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  margin-bottom: 20px;
}

.social-login {
  margin-bottom: 30px;
  text-align: center;
}

.social-title {
  position: relative;
  margin-bottom: 20px;
}

.social-title span {
  display: inline-block;
  padding: 0 10px;
  background: white;
  color: #999;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.social-title::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #f0f0f0;
  transform: translateY(-50%);
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-btn {
  width: 50px;
  height: 50px;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

.social-btn.alipay {
  background: #1677ff;
  color: white;
}

.social-btn.alipay .alipay-icon {
  font-size: 14px;
  font-weight: bold;
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.register-link .el-button {
  padding: 0;
  font-size: 14px;
  color: #ff6b00;
}

.agreement {
  text-align: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.agreement .el-button {
  padding: 0;
  font-size: 12px;
  color: #999;
}

.guest-login {
  text-align: center;
  padding: 20px 0;
}

.guest-login .el-button {
  padding: 0;
  font-size: 14px;
  color: white;
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

:deep(.el-checkbox) {
  color: #666;
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