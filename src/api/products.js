import request from './index.js'

// ===== 公共接口 =====
export function getProductCategories() {
  return request.get('/product-categories')
}

export function getProductList(params) {
  return request.get('/products', { params })
}

// ===== 管理端-分类 =====
export function getAdminCategories() {
  return request.get('/admin/products/categories')
}

export function createCategory(data) {
  return request.post('/admin/products/categories', data)
}

export function updateCategory(id, data) {
  return request.put(`/admin/products/categories/${id}`, data)
}

export function deleteCategory(id) {
  return request.delete(`/admin/products/categories/${id}`)
}

// ===== 管理端-产品 =====
export function getAdminProducts(params) {
  return request.get('/admin/products', { params })
}

export function createProduct(data) {
  return request.post('/admin/products', data)
}

export function updateProduct(id, data) {
  return request.put(`/admin/products/${id}`, data)
}

export function deleteProduct(id) {
  return request.delete(`/admin/products/${id}`)
}
