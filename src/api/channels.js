import request from './index.js'

export function getChannelList() {
  return request.get('/channels')
}

export function getAdminChannelList() {
  return request.get('/admin/channels')
}

export function createChannel(data) {
  return request.post('/admin/channels', data)
}

export function updateChannel(id, data) {
  return request.put(`/admin/channels/${id}`, data)
}

export function deleteChannel(id) {
  return request.delete(`/admin/channels/${id}`)
}
