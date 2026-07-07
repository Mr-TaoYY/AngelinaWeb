import request from './index.js'

export function getSwiperList() {
  return request.get('/swiper')
}

export function getAdminSwiperList() {
  return request.get('/admin/swiper')
}

export function createSwiper(data) {
  return request.post('/admin/swiper', data)
}

export function updateSwiper(id, data) {
  return request.put(`/admin/swiper/${id}`, data)
}

export function deleteSwiper(id) {
  return request.delete(`/admin/swiper/${id}`)
}

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  })
}
