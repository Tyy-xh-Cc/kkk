import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from './index.js'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      // 将token添加到请求头
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      // 处理401未授权错误
      if (error.response.status === 401) {
        // 清除本地存储的token和用户信息
        localStorage.removeItem('token')
        localStorage.removeItem('user_info')
        
        // 显示错误提示
        ElMessage.error('登录已过期，请重新登录')
        
        // 跳转到登录页面
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
      // 处理其他错误状态码
      else if (error.response.status === 403) {
        ElMessage.error('没有权限访问该资源')
      } else if (error.response.status === 404) {
        ElMessage.error('请求的资源不存在')
      } else if (error.response.status >= 500) {
        ElMessage.error('服务器内部错误')
      } else {
        ElMessage.error(error.response.data.message || '请求失败')
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      // 请求配置错误
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)


export default request