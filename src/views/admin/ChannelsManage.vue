<script setup>
import { onMounted, ref } from 'vue'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-vue-next'
import {
  getAdminChannelList,
  createChannel,
  updateChannel,
  deleteChannel,
} from '../../api/channels.js'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingItem = ref(null)
const form = ref({
  store: '',
  title: '',
  type: 'href',
  url: '',
  sortOrder: 0,
})
const formLoading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const res = await getAdminChannelList()
    if (res.code === 0) {
      list.value = res.data
    }
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingItem.value = null
  form.value = {
    store: '',
    title: '',
    type: 'href',
    url: '',
    sortOrder: list.value.length,
  }
  dialogVisible.value = true
}

function openEdit(item) {
  editingItem.value = item
  form.value = {
    store: item.store || '',
    title: item.title || '',
    type: item.type || 'href',
    url: item.url || '',
    sortOrder: item.sortOrder ?? 0,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!form.value.store || !form.value.title) {
    alert('请填写渠道名称和店铺名称')
    return
  }
  formLoading.value = true
  try {
    if (editingItem.value) {
      await updateChannel(editingItem.value.id, form.value)
    } else {
      await createChannel(form.value)
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    formLoading.value = false
  }
}

async function handleDelete(item) {
  if (!confirm(`确定删除"${item.title}"吗？`)) return
  try {
    await deleteChannel(item.id)
    fetchList()
  } catch (e) {
    alert(e.response?.data?.message || '删除失败')
  }
}

async function moveItem(item, direction) {
  const idx = list.value.findIndex((i) => i.id === item.id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= list.value.length) return
  const target = list.value[targetIdx]
  const oldSort = item.sortOrder
  const newSort = target.sortOrder
  await updateChannel(item.id, { ...item, sortOrder: newSort })
  await updateChannel(target.id, { ...target, sortOrder: oldSort })
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>渠道管理</h2>
      <button class="btn-primary" @click="openAdd">
        <Plus :size="16" />
        <span>新增渠道</span>
      </button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 60px">排序</th>
            <th>渠道名称</th>
            <th>店铺名称</th>
            <th>链接地址</th>
            <th style="width: 160px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>
              <div class="sort-btns">
                <button class="icon-btn" @click="moveItem(item, 'up')" :disabled="list.indexOf(item) === 0">
                  <ChevronUp :size="14" />
                </button>
                <button class="icon-btn" @click="moveItem(item, 'down')" :disabled="list.indexOf(item) === list.length - 1">
                  <ChevronDown :size="14" />
                </button>
              </div>
            </td>
            <td>{{ item.store }}</td>
            <td>{{ item.title }}</td>
            <td class="url-cell">{{ item.url }}</td>
            <td>
              <div class="action-btns">
                <button class="btn-edit" @click="openEdit(item)">
                  <Pencil :size="14" />
                  编辑
                </button>
                <button class="btn-delete" @click="handleDelete(item)">
                  <Trash2 :size="14" />
                  删除
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && list.length === 0">
            <td colspan="5" class="empty-row">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="dialogVisible" class="dialog-mask" @click.self="dialogVisible = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingItem ? '编辑渠道' : '新增渠道' }}</h3>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label>渠道名称</label>
            <input v-model="form.store" type="text" placeholder="如：【京东】" />
          </div>
          <div class="form-row">
            <label>店铺名称</label>
            <input v-model="form.title" type="text" placeholder="请输入店铺名称" />
          </div>
          <div class="form-row">
            <label>链接地址</label>
            <input v-model="form.url" type="text" placeholder="请输入店铺链接地址" />
          </div>
          <div class="form-row">
            <label>排序</label>
            <input v-model.number="form.sortOrder" type="number" placeholder="数字越小越靠前" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-default" @click="dialogVisible = false">取消</button>
          <button class="btn-primary" :disabled="formLoading" @click="handleSubmit">
            {{ formLoading ? '保存中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manage-page {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: 100%;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1a1a2e;
}
.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #c9a96e 0%, #b8945f 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-default {
  padding: 8px 16px;
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.btn-default:hover {
  border-color: #c9a96e;
  color: #c9a96e;
}
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.data-table th {
  text-align: left;
  padding: 12px 16px;
  background: #fafafa;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #eee;
}
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #555;
}
.data-table tbody tr:hover {
  background: #fafafa;
}
.url-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #999;
  font-size: 13px;
}
.empty-row {
  text-align: center;
  padding: 40px !important;
  color: #999;
}
.sort-btns {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.icon-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
}
.icon-btn:hover:not(:disabled) {
  background: #c9a96e;
  color: #fff;
  border-color: #c9a96e;
}
.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.action-btns {
  display: flex;
  gap: 8px;
}
.btn-edit {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: #fff;
  color: #4a90d9;
  border: 1px solid #4a90d9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-edit:hover {
  background: #4a90d9;
  color: #fff;
}
.btn-delete {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: #fff;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-delete:hover {
  background: #e74c3c;
  color: #fff;
}
.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.dialog {
  width: 500px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dialog-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
}
.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1a1a2e;
}
.dialog-body {
  padding: 20px 24px;
}
.dialog-footer {
  padding: 14px 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.form-row {
  margin-bottom: 16px;
}
.form-row label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
  font-weight: 500;
}
.form-row input[type='text'],
.form-row input[type='number'] {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}
.form-row input:focus {
  outline: none;
  border-color: #c9a96e;
}
</style>
