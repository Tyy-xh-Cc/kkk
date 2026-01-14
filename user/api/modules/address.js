import request from '../request.js'

// 地址管理相关接口
export default {
  // 获取地址列表
  getAddressList() {
    return request({
      url: '/api/addresses/my',
      method: 'get'
    })
  },
  
  // 添加地址
  addAddress(data) {
    console.log(data);
    
    return request({
      url: '/api/addresses',
      method: 'post',
      data
    })
  },
  
  // 更新地址
  updateAddress(addressId, data) {
    return request({
      url: `/api/addresses/${addressId}`,
      method: 'put',
      data
    })
  },
  
  // 删除地址
  deleteAddress(addressId) {
    return request({
      url: `/api/addresses/${addressId}`,
      method: 'delete'
    })
  },
  
  // 设为默认地址
  setDefaultAddress(addressId) {
    return request({
      url: `/api/addresses/${addressId}/default`,
      method: 'put'
    })
  },
  
  // 获取默认地址
  getDefaultAddress() {
    return request({
      url: '/api/addresses/default',
      method: 'get'
    })
  },
  
  // 获取地址详情
  getAddressDetail(addressId) {
    return request({
      url: `/api/addresses/${addressId}`,
      method: 'get'
    })
  },
  
  // 获取省市区列表
  getRegionList(parentId = 0) {
    return request({
      url: '/api/regions',
      method: 'get',
      params: { parent_id: parentId }
    })
  },
  
  // 地址搜索（地理编码）
  searchAddress(keyword) {
    return request({
      url: '/api/addresses/search',
      method: 'get',
      params: { keyword }
    })
  }
}