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



export default request