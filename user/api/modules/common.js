import request from './request.js'

// 公共接口
export default {
  // 上传文件
  uploadFile(data) {
    return request({
      url: '/api/common/upload',
      method: 'post',
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 获取配置信息
  getConfig(key) {
    return request({
      url: '/api/common/config',
      method: 'get',
      params: { key }
    })
  },
  
  // 获取验证码
  getCaptcha() {
    return request({
      url: '/api/common/captcha',
      method: 'get',
      responseType: 'blob'
    })
  },
  
  // 发送短信验证码
  sendSmsCode(data) {
    return request({
      url: '/api/common/sms',
      method: 'post',
      data
    })
  },
  
  // 发送邮箱验证码
  sendEmailCode(data) {
    return request({
      url: '/api/common/email',
      method: 'post',
      data
    })
  },
  
  // 获取轮播图
  getBanners(params) {
    return request({
      url: '/api/common/banners',
      method: 'get',
      params
    })
  },
  
  // 获取公告列表
  getNotices(params) {
    return request({
      url: '/api/common/notices',
      method: 'get',
      params
    })
  },
  
  // 获取系统版本
  getSystemVersion() {
    return request({
      url: '/api/common/version',
      method: 'get'
    })
  },
  
  // 反馈建议
  submitFeedback(data) {
    return request({
      url: '/api/common/feedback',
      method: 'post',
      data
    })
  },
  
  // 获取地理位置
  getLocation(ip) {
    return request({
      url: '/api/common/location',
      method: 'get',
      params: { ip }
    })
  }
}