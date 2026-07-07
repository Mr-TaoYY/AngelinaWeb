<script setup>
import { onMounted, ref } from 'vue'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-vue-next'
import {
  getAdminSwiperList,
  createSwiper,
  updateSwiper,
  deleteSwiper,
  uploadImage,
} from '../../api/swiper.js'

const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const editingItem = ref(null)
const form = ref({
  imagePc: '',
  imageTablet: '',
  imageMobile: '',
  sortOrder: 0,
})
const formLoading = ref(false)

async function fetchList() {
  loading.value = true
  try {
    const res = await getAdminSwiperList()
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
    imagePc: '',
    imageTablet: '',
    imageMobile: '',
    sortOrder: list.value.length,
  }
  dialogVisible.value = true
}

function openEdit(item) {
  editingItem.value = item
  form.value = {
    imagePc: item.imagePc || '',
    imageTablet: item.imageTablet || '',
    imageMobile: item.imageMobile || '',
    sortOrder: item.sortOrder ?? 0,
  }
  dialogVisible.value = true
}

async function handleSubmit() {
  formLoading.value = true
  try {
    if (editingItem.value) {
      await updateSwiper(editingItem.value.id, form.value)
    } else {
      await createSwiper(form.value)
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
  if (!confirm('确定删除这张轮播图吗？')) return
  try {
    await deleteSwiper(item.id)
    fetchList()
  } catch (e) {
    alert(e.response?.data?.message || '删除失败')
  }
}

async function handleUpload(field, event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const res = await uploadImage(file)
    if (res.code === 0) {
      form.value[field] = res.data.url
    }
  } catch (e) {
    alert('上传失败')
  }
}

async function moveItem(item, direction) {
  const idx = list.value.findIndex((i) => i.id === item.id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= list.value.length) return
  const target = list.value[targetIdx]
  const oldSort = item.sortOrder
  const newSort = target.sortOrder
  await updateSwiper(item.id, { ...item, sortOrder: newSort })
  await updateSwiper(target.id, { ...target, sortOrder: oldSort })
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div class="manage-page">
    <div class="page-header">
      <h2>轮播图管理</h2>
      <button class="btn-primary" @click="openAdd">
        <Plus :size="16" />
        <span>新增轮播图</span>
      </button>
    </div>

    <div class="table-wrapper" v-loading="loading">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 60px">排序</th>
            <th style="width: 80px">序号</th>
            <th>PC端图</th>
            <th>iPad端图</th>
            <th>手机端图</th>
            <th style="width: 160px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in list" :key="item.id">
            <td>
              <div class="sort-btns">
                <button class="icon-btn" @click="moveItem(item, 'up')" :disabled="idx === 0">
                  <ChevronUp :size="14" />
                </button>
                <button class="icon-btn" @click="moveItem(item, 'down')" :disabled="idx === list.length - 1">
                  <ChevronDown :size="14" />
                </button>
              </div>
            </td>
            <td>{{ idx + 1 }}</td>
            <td>
              <img v-if="item.imagePc" :src="item.imagePc" class="thumb" alt="" />
              <span v-else class="empty">-</span>
            </td>
            <td>
              <img v-if="item.imageTablet" :src="item.imageTablet" class="thumb" alt="" />
              <span v-else class="empty">-</span>
            </td>
            <td>
              <img v-if="item.imageMobile" :src="item.imageMobile" class="thumb" alt="" />
              <span v-else class="empty">-</span>
            </td>
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
            <td colspan="6" class="empty-row">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="dialogVisible" class="dialog-mask" @click.self="dialogVisible = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingItem ? '编辑轮播图' : '新增轮播图' }}</h3>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label>排序</label>
            <input v-model.number="form.sortOrder" type="number" placeholder="数字越小越靠前" />
          </div>
          <div class="form-row upload-row">
            <label>PC端图片</label>
            <div class="upload-area">
              <img v-if="form.imagePc" :src="form.imagePc" class="preview-img" alt="" />
              <label class="upload-btn">
                <input type="file" accept="image/*" @change="(e) => handleUpload('imagePc', e)" />
                {{ form.imagePc ? '重新上传' : '点击上传' }}
              </label>
            </div>
          </div>
          <div class="form-row upload-row">
            <label>iPad端图片</label>
            <div class="upload-area">
              <img v-if="form.imageTablet" :src="form.imageTablet" class="preview-img" alt="" />
              <label class="upload-btn">
                <input type="file" accept="image/*" @change="(e) => handleUpload('imageTablet', e)" />
                {{ form.imageTablet ? '重新上传' : '点击上传' }}
              </label>
            </div>
          </div>
          <div class="form-row upload-row">
            <label>手机端图片</label>
            <div class="upload-area">
              <img v-if="form.imageMobile" :src="form.imageMobile" class="preview-img" alt="" />
              <label class="upload-btn">
                <input type="file" accept="image/*" @change="(e) => handleUpload('imageMobile', e)" />
                {{ form.imageMobile ? '重新上传' : '点击上传' }}
              </label>
            </div>
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
.thumb {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}
.empty {
  color: #ccc;
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
  width: 520px;
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
  overflow-y: auto;
  flex: 1;
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
.upload-area {
  display: flex;
  align-items: center;
  gap: 12px;
}
.preview-img {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border: 1px solid #eee;
  border-radius: 4px;
}
.upload-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
}
.upload-btn:hover {
  border-color: #c9a96e;
  color: #c9a96e;
}
.upload-btn input {
  display: none;
}
</style>
