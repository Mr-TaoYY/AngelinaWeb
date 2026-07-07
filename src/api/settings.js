import request from './index.js'

// 公共：获取单个站点配置
export function getSiteConfig(key) {
  return request.get(`/site-config/${key}`)
}

// 管理端：获取全部配置
export function getAdminSettings() {
  return request.get('/admin/settings')
}

// 管理端：更新单个配置
export function updateSetting(key, value) {
  return request.put(`/admin/settings/${key}`, { value })
}
