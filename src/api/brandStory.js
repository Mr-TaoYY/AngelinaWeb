import request from './index.js'

export function getBrandStoryList() {
  return request.get('/brand-story')
}

export function getAdminBrandStoryList() {
  return request.get('/admin/brand-story')
}

export function createBrandStory(data) {
  return request.post('/admin/brand-story', data)
}

export function updateBrandStory(id, data) {
  return request.put(`/admin/brand-story/${id}`, data)
}

export function deleteBrandStory(id) {
  return request.delete(`/admin/brand-story/${id}`)
}
