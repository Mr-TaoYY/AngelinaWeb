import request from './index.js'

export function adminLogin(data) {
  return request.post('/admin/login', data)
}
