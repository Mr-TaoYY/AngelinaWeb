import request from './index.js'

export function getHelpList() {
  return request.get('/help')
}

export function getHelpCategories() {
  return request.get('/admin/help/categories')
}

export function createHelpCategory(data) {
  return request.post('/admin/help/categories', data)
}

export function updateHelpCategory(id, data) {
  return request.put(`/admin/help/categories/${id}`, data)
}

export function deleteHelpCategory(id) {
  return request.delete(`/admin/help/categories/${id}`)
}

export function getHelpItems(categoryId) {
  const url = categoryId
    ? `/admin/help/items?categoryId=${categoryId}`
    : '/admin/help/items'
  return request.get(url)
}

export function createHelpItem(data) {
  return request.post('/admin/help/items', data)
}

export function updateHelpItem(id, data) {
  return request.put(`/admin/help/items/${id}`, data)
}

export function deleteHelpItem(id) {
  return request.delete(`/admin/help/items/${id}`)
}
