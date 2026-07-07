import request from './index.js'

// 上传文件
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  })
}

// 扫描孤儿文件
export function getOrphanFiles() {
  return request.get('/admin/upload/orphans', { timeout: 60000 })
}

// 清理孤儿文件（不传 filenames 则清理全部）
export function deleteOrphanFiles(filenames) {
  return request.delete('/admin/upload/orphans', {
    data: filenames ? { filenames } : {},
    timeout: 120000,
  })
}
