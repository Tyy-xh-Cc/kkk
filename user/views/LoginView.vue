<template>
  <div class="login-page">
    <!-- 登录容器 -->
    <div class="login-container">
      <!-- 左侧品牌区 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF6B00" stroke="#FF6B00" stroke-width="2"/>
              <path d="M2 17L12 22L22 17" stroke="#FF6B00" stroke-width="2"/>
              <path d="M2 12L12 17L22 12" stroke="#FF6B00" stroke-width="2"/>
            </svg>
            <span class="logo-text">FoodHub</span>
          </div>
          <h1>欢迎回来</h1>
          <p class="subtitle">登录后即可下单享受美食</p>
          <div class="brand-image">
            <div class="food-illustration">
              <div class="plate"></div>
              <div class="noodles"></div>
              <div class="chopsticks"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="form-section">
        <div class="form-container">
          <!-- 登录方式切换 -->
          <div class="tab-container">
            <div 
              class="tab-item" 
              :class="{ active: loginMethod === 'phone' }"
              @click="changeLoginMethod('phone')"
            >
              手机号登录
            </div>
            <div 
              class="tab-item" 
              :class="{ active: loginMethod === 'account' }"
              @click="changeLoginMethod('account')"
            >
              账号密码登录
            </div>
            <div class="tab-indicator" :style="tabIndicatorStyle"></div>
          </div>

          <!-- 登录表单 -->
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="0"
            class="login-form"
            size="large"
          >
            <!-- 手机号登录 -->
            <div v-if="loginMethod === 'phone'" class="form-content">
              <el-form-item prop="phone">
                <div class="input-with-label">
                  <label>手机号</label>
                  <el-input
                    v-model="loginForm.phone"
                    placeholder="请输入手机号"
                    :maxlength="11"
                    class="custom-input"
                  >
                    <template #prefix>
                      <el-icon class="input-icon"><Iphone /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="sms_code" v-if="showSmsCode">
                <div class="input-with-label">
                  <label>验证码</label>
                  <el-input
                    v-model="loginForm.sms_code"
                    placeholder="请输入6位验证码"
                    :maxlength="6"
                    class="custom-input"
                  >
                    <template #prefix>
                      <el-icon class="input-icon"><Message /></el-icon>
                    </template>
                    <template #append>
                      <el-button 
                        @click="sendSmsCode" 
                        :disabled="smsCountdown > 0"
                        :loading="sendingSms"
                        class="sms-btn"
                        size="small"
                      >
                        {{ smsButtonText }}
                      </el-button>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item v-else prop="password">
                <div class="input-with-label">
                  <label>密码</label>
                  <el-input
                    v-model="loginForm.password"
                    placeholder="请输入密码"
                    type="password"
                    show-password
                    class="custom-input"
                  >
                    <template #prefix>
                      <el-icon class="input-icon"><Lock /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <div class="method-toggle">
                <el-button 
                  type="text" 
                  @click="showSmsCode = !showSmsCode"
                  class="toggle-btn"
                >
                  {{ showSmsCode ? '使用密码登录' : '使用验证码登录' }}
                </el-button>
              </div>
            </div>

            <!-- 账号密码登录 -->
            <div v-else class="form-content">
              <el-form-item prop="username">
                <div class="input-with-label">
                  <label>用户名/手机号</label>
                  <el-input
                    v-model="loginForm.username"
                    placeholder="请输入用户名或手机号"
                    class="custom-input"
                  >
                    <template #prefix>
                      <el-icon class="input-icon"><User /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="password">
                <div class="input-with-label">
                  <label>密码</label>
                  <el-input
                    v-model="loginForm.password"
                    placeholder="请输入密码"
                    type="password"
                    show-password
                    class="custom-input"
                  >
                    <template #prefix>
                      <el-icon class="input-icon"><Lock /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <div class="form-options">
                <el-checkbox v-model="rememberMe" label="记住我" />
                <el-button type="text" @click="forgotPassword" class="forgot-password">
                  忘记密码？
                </el-button>
              </div>
            </div>

            <!-- 登录按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                @click="handleLogin"
                :loading="loading"
                class="login-button"
                size="large"
              >
                登录
              </el-button>
            </el-form-item>

            <!-- 分割线 -->
            <div class="divider">
              <span class="divider-text"></span>
            </div>

            <!-- 第三方登录 -->
            <div class="social-login">
              <div class="social-buttons">
                <el-button 
                  class="social-btn wechat"
                  @click="wechatLogin"
                >
                  <el-icon><ChatDotRound /></el-icon>
                  <span>微信</span>
                </el-button>
                <el-button 
                  class="social-btn alipay"
                  @click="alipayLogin"
                >
                  <span class="alipay-icon">支</span>
                  <span>支付宝</span>
                </el-button>
                <el-button 
                  class="social-btn qq"
                  @click="qqLogin"
                >
                  <span class="qq-icon">Q</span>
                  <span>QQ</span>
                </el-button>
              </div>
            </div>

            <!-- 注册链接 -->
            <div class="register-section">
              <span>还没有账号？</span>
              <el-button type="text" @click="goToRegister" class="register-btn">
                立即注册
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Iphone, Message, Lock, User, 
  ChatDotRound, View 
} from '@element-plus/icons-vue'
import api from '../api/index.js'

const router = useRouter()
const route = useRoute()

// 数据定义
const loginFormRef = ref(null)
const loginMethod = ref('phone')
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

// 计算属性
const smsButtonText = computed(() => {
  if (sendingSms.value) return '发送中...'
  if (smsCountdown.value > 0) return `${smsCountdown.value}s后重发`
  return '获取验证码'
})

const tabIndicatorStyle = computed(() => {
  const width = '50%'
  const left = loginMethod.value === 'phone' ? '0%' : '50%'
  return {
    width,
    left,
    transform: 'translateX(0)'
  }
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
            passwordHash: loginForm.password,
            login_type: 'password'
          }
        }
      } else {
        // 用户名密码登录
        loginData = {
          username: loginForm.username,
          passwordHash: loginForm.password,
          login_type: 'password'
        }
      }

      const res = await api.user.login(loginData)
      console.log(res.data);
      
      
      if (res.data.success) {
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
        ElMessage.error(res.data.message || '登录失败')
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
  showSmsCode.value = false
  
  // 重置表单验证
  if (loginFormRef.value) {
    loginFormRef.value.clearValidate()
  }
}

// 切换短信验证码/密码登录
watch(showSmsCode, () => {
  if (loginFormRef.value) {
    loginFormRef.value.clearValidate(['sms_code', 'password'])
  }
})

// 忘记密码
const forgotPassword = () => {
  router.push('/forgot-password')
}

// 第三方登录
const wechatLogin = () => {
  ElMessage.info('微信登录功能开发中')
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
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-container {
  flex: 1;
  display: flex;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  padding: 40px 20px;
}

/* 左侧品牌区 */
.brand-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 60px;
}

.brand-content {
  max-width: 400px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.brand-content h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 48px 0;
  line-height: 1.6;
}

.brand-image {
  margin-top: 60px;
}

.food-illustration {
  position: relative;
  width: 280px;
  height: 180px;
}

.plate {
  position: absolute;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  top: 0;
  left: 0;
}

.noodles {
  position: absolute;
  width: 160px;
  height: 120px;
  background: linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%);
  border-radius: 60px;
  top: 40px;
  left: 20px;
  transform: rotate(-15deg);
}

.chopsticks {
  position: absolute;
  width: 160px;
  height: 6px;
  background: #8b4513;
  border-radius: 3px;
  top: 80px;
  left: 100px;
  transform: rotate(15deg);
}

.chopsticks::before {
  content: '';
  position: absolute;
  width: 160px;
  height: 6px;
  background: #a0522d;
  border-radius: 3px;
  top: 8px;
  left: 0;
  transform: rotate(5deg);
}

/* 右侧表单区 */
.form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-container {
  width: 100%;
  max-width: 380px;
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

/* 选项卡样式 */
.tab-container {
  display: flex;
  position: relative;
  margin-bottom: 40px;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  z-index: 1;
}

.tab-item.active {
  color: #1a1a1a;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  height: calc(100% - 8px);
  background: white;
  border-radius: 10px;
  top: 4px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 表单样式 */
.login-form {
  width: 100%;
}

.input-with-label {
  margin-bottom: 8px;
}

.input-with-label label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.custom-input {
  width: 100%;
}

.input-icon {
  color: #999;
  margin-right: 8px;
}

.method-toggle {
  text-align: right;
  margin: -12px 0 24px 0;
}

.toggle-btn {
  padding: 4px 8px;
  font-size: 13px;
  color: #666;
}

.toggle-btn:hover {
  color: #ff6b00;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -12px 0 24px 0;
}

.forgot-password {
  padding: 4px 8px;
  font-size: 13px;
  color: #666;
}

.forgot-password:hover {
  color: #ff6b00;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  margin: 8px 0 32px 0;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 0, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

/* 分割线 */
.divider {
  position: relative;
  text-align: center;
  margin: 32px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #eee;
}

.divider-text {
  display: inline-block;
  padding: 0 16px;
  background: white;
  font-size: 14px;
  color: #999;
  position: relative;
  z-index: 1;
}

/* 第三方登录 */
.social-login {
  margin-bottom: 32px;
}

.social-buttons {
  display: flex;
  gap: 12px;
}

.social-btn {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #eee;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
}

.social-btn:hover {
  border-color: #ddd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.social-btn.wechat:hover {
  border-color: #07c160;
  color: #07c160;
}

.social-btn.alipay:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.social-btn.qq:hover {
  border-color: #12b7f5;
  color: #12b7f5;
}

.alipay-icon {
  font-weight: bold;
  font-size: 16px;
}

.qq-icon {
  font-weight: bold;
  font-size: 14px;
}

/* 注册和游客部分 */
.register-section {
  text-align: center;
  margin: 24px 0;
  font-size: 14px;
  color: #666;
}

.register-btn {
  padding: 4px 8px;
  font-size: 14px;
  font-weight: 600;
  color: #ff6b00;
}

.register-btn:hover {
  color: #e65c00;
}

.guest-section {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.guest-btn {
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.guest-btn:hover {
  color: #ff6b00;
}

/* 底部信息 */
.footer {
  text-align: center;
  padding: 24px 20px;
  border-top: 1px solid #f0f0f0;
  background: white;
}

.footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.footer-links a {
  color: #666;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #ff6b00;
}

.separator {
  color: #ddd;
  font-size: 12px;
}

.copyright {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    padding: 20px;
  }
  
  .brand-section {
    padding-right: 0;
    margin-bottom: 40px;
  }
  
  .brand-content {
    text-align: center;
    max-width: 100%;
  }
  
  .food-illustration {
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .form-container {
    padding: 30px 24px;
  }
  
  .brand-content h1 {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 15px;
  }
  
  .social-buttons {
    flex-direction: column;
  }
}

/* Element Plus 样式覆盖 */
:deep(.el-input__wrapper) {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: none;
  padding: 0 16px;
  height: 48px;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #ff6b00;
  box-shadow: 0 0 0 1px rgba(255, 107, 0, 0.1);
}

:deep(.el-input__inner) {
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 400;
}

:deep(.el-input__inner::placeholder) {
  color: #999;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #ff6b00 0%, #ff8c00 100%);
  border: none;
}

:deep(.el-checkbox__label) {
  font-size: 13px;
  color: #666;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #ff6b00;
  border-color: #ff6b00;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #1a1a1a;
}

:deep(.el-button--text) {
  color: #666;
}

:deep(.el-button--text:hover) {
  color: #ff6b00;
}

/* 短信按钮样式 */
:deep(.sms-btn) {
  background: #ff6b00;
  border-color: #ff6b00;
  color: white;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  height: 32px;
}

:deep(.sms-btn:hover) {
  background: #e65c00;
  border-color: #e65c00;
}

:deep(.sms-btn.is-disabled) {
  background: #ccc;
  border-color: #ccc;
  color: #fff;
}
</style>