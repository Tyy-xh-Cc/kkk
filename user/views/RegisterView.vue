<template>
  <div class="register-page">
    <!-- 顶部背景图 -->
    <div class="register-header">
      <div class="header-content">
        <h1>创建账号</h1>
        <p>注册后享受更多会员权益</p>
      </div>
    </div>

    <!-- 返回按钮 -->
    <div class="back-btn" @click="router.back()">
      <el-icon><ArrowLeft /></el-icon>
    </div>

    <!-- 注册表单 -->
    <div class="register-form">
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
            @blur="checkPhoneExists"
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
            @blur="checkUsernameExists"
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

        <!-- 邀请码（可选） -->
        <el-form-item prop="invite_code">
          <el-input
            v-model="registerForm.invite_code"
            placeholder="邀请码（选填）"
            :maxlength="10"
          >
            <template #prefix>
              <el-icon><Promotion /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 协议同意 -->
        <el-form-item prop="agreement">
          <el-checkbox v-model="registerForm.agreement">
            我已阅读并同意
            <el-button type="text" @click="showUserAgreement">《用户协议》</el-button>
            和
            <el-button type="text" @click="showPrivacyPolicy">《隐私政策》</el-button>
          </el-checkbox>
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

    <!-- 其他注册方式 -->
    <div class="other-register" v-if="socialRegisterEnabled">
      <div class="other-title">
        <span>其他注册方式</span>
      </div>
      <div class="social-buttons">
        <el-button
          class="social-btn wechat"
          circle
          size="large"
          @click="wechatRegister"
        >
          <el-icon><ChatDotRound /></el-icon>
        </el-button>
        <el-button
          class="social-btn qq"
          circle
          size="large"
          @click="qqRegister"
        >
          <span class="qq-icon">QQ</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, Iphone, Message, User, Lock, 
  Promotion, ChatDotRound 
} from '@element-plus/icons-vue'
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
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
    callback(new Error('密码必须包含字母和数字'))
  } else {
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

// 是否启用社交注册
const socialRegisterEnabled = ref(true)

// 计算属性
const smsButtonText = computed(() => {
  if (sendingSms.value) return '发送中...'
  if (smsCountdown.value > 0) return `${smsCountdown.value}秒后重发`
  return '获取验证码'
})

// API: 检查手机号是否已注册
const checkPhoneExists = async () => {
  if (!registerForm.phone || !/^1[3-9]\d{9}$/.test(registerForm.phone)) {
    return
  }

  checkingPhone.value = true
  try {
    const res = await api.user.getUserInfo() // 这里假设有检查手机号的接口
    // 实际开发中应该有专门的检查接口
    // 这里简单模拟
    const registeredPhones = ['13800138000', '13900139000']
    if (registeredPhones.includes(registerForm.phone)) {
      ElMessage.warning('该手机号已被注册')
      registerForm.phone = ''
    }
  } catch (error) {
    // 忽略检查错误
  } finally {
    checkingPhone.value = false
  }
}

// API: 检查用户名是否已存在
const checkUsernameExists = async () => {
  if (!registerForm.username || registerForm.username.length < 3) {
    return
  }

  checkingUsername.value = true
  try {
    // 实际开发中应该有专门的检查接口
    // 这里简单模拟
    const registeredUsernames = ['admin', 'test', 'user']
    if (registeredUsernames.includes(registerForm.username)) {
      ElMessage.warning('该用户名已被占用')
      registerForm.username = ''
    }
  } catch (error) {
    // 忽略检查错误
  } finally {
    checkingUsername.value = false
  }
}

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
        password: registerForm.password,
        invite_code: registerForm.invite_code || undefined
      }

      const res = await api.user.register(registerData)

      if (res.code === 200) {
        ElMessage.success('注册成功！')

        // 自动登录
        const loginRes = await api.user.login({
          phone: registerForm.phone,
          password: registerForm.password,
          login_type: 'password'
        })

        if (loginRes.code === 200) {
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

// 微信注册
const wechatRegister = () => {
  ElMessage.info('微信注册功能开发中')
  // 实际开发中这里会跳转到微信授权页面
}

// QQ注册
const qqRegister = () => {
  ElMessage.info('QQ注册功能开发中')
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 显示用户协议
const showUserAgreement = () => {
  router.push('/agreement/user')
}

// 显示隐私政策
const showPrivacyPolicy = () => {
  router.push('/agreement/privacy')
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

.register-header {
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

.register-form {
  flex: 1;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 40px 30px 20px;
  position: relative;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  line-height: 1.4;
}

.register-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 20px;
}

.login-link .el-button {
  padding: 0;
  font-size: 14px;
  color: #ff6b00;
}

.other-register {
  padding: 20px 30px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.other-title {
  position: relative;
  margin-bottom: 15px;
  text-align: center;
}

.other-title span {
  display: inline-block;
  padding: 0 10px;
  background: white;
  color: #999;
  font-size: 14px;
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
  font-size: 14px;
}

:deep(.el-checkbox .el-button) {
  padding: 0;
  font-size: 14px;
  color: #666;
}

:deep(.el-checkbox .el-button:hover) {
  color: #ff6b00;
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