<script setup>
import { onMounted, ref, computed } from 'vue'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, FolderOpen, FileText } from 'lucide-vue-next'
import {
  getHelpCategories,
  createHelpCategory,
  updateHelpCategory,
  deleteHelpCategory,
  getHelpItems,
  createHelpItem,
  updateHelpItem,
  deleteHelpItem,
} from '../../api/help.js'

const categories = ref([])
const items = ref([])
const activeCategoryId = ref(null)
const loading = ref(false)

const catDialogVisible = ref(false)
const editingCategory = ref(null)
const catForm = ref({ title: '', type: 'category', description: '', sortOrder: 0 })
const catFormLoading = ref(false)

const itemDialogVisible = ref(false)
const editingItem = ref(null)
const itemForm = ref({ categoryId: null, name: '', description: '', sortOrder: 0 })
const itemFormLoading = ref(false)

const activeCategory = computed(() =>
  categories.value.find((c) => c.id === activeCategoryId.value)
)

async function fetchCategories() {
  try {
    const res = await getHelpCategories()
    if (res.code === 0) {
      categories.value = res.data
      if (!activeCategoryId.value && res.data.length) {
        activeCategoryId.value = res.data[0].id
        fetchItems(res.data[0].id)
      }
    }
  } catch (e) {
    console.error('加载分类失败', e)
  }
}

async function fetchItems(categoryId) {
  if (!categoryId) return
  loading.value = true
  try {
    const res = await getHelpItems(categoryId)
    if (res.code === 0) {
      items.value = res.data
    }
  } finally {
    loading.value = false
  }
}

function selectCategory(cat) {
  activeCategoryId.value = cat.id
  fetchItems(cat.id)
}

function openAddCategory() {
  editingCategory.value = null
  catForm.value = { title: '', type: 'category', description: '', sortOrder: categories.value.length }
  catDialogVisible.value = true
}

function openEditCategory(cat) {
  editingCategory.value = cat
  catForm.value = {
    title: cat.title || '',
    type: cat.type || 'category',
    description: cat.description || '',
    sortOrder: cat.sortOrder ?? 0,
  }
  catDialogVisible.value = true
}

async function handleCategorySubmit() {
  if (!catForm.value.title) {
    alert('请填写标题')
    return
  }
  catFormLoading.value = true
  try {
    if (editingCategory.value) {
      await updateHelpCategory(editingCategory.value.id, catForm.value)
    } else {
      await createHelpCategory(catForm.value)
    }
    catDialogVisible.value = false
    fetchCategories()
  } catch (e) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    catFormLoading.value = false
  }
}

async function handleDeleteCategory(cat) {
  if (!confirm(`确定删除分类"${cat.title}"吗？该分类下的所有条目也将被删除。`)) return
  try {
    await deleteHelpCategory(cat.id)
    if (activeCategoryId.value === cat.id) {
      activeCategoryId.value = null
      items.value = []
    }
    fetchCategories()
  } catch (e) {
    alert(e.response?.data?.message || '删除失败')
  }
}

function openAddItem() {
  if (!activeCategoryId.value) {
    alert('请先选择一个分类')
    return
  }
  editingItem.value = null
  itemForm.value = {
    categoryId: activeCategoryId.value,
    name: '',
    description: '',
    sortOrder: items.value.length,
  }
  itemDialogVisible.value = true
}

function openEditItem(item) {
  editingItem.value = item
  const desc = Array.isArray(item.description)
    ? item.description.join('\n')
    : ''
  itemForm.value = {
    categoryId: item.categoryId,
    name: item.name || '',
    description: desc,
    sortOrder: item.sortOrder ?? 0,
  }
  itemDialogVisible.value = true
}

async function handleItemSubmit() {
  if (!itemForm.value.name) {
    alert('请填写问题名称')
    return
  }
  itemFormLoading.value = true
  try {
    const descLines = itemForm.value.description
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
    const data = {
      ...itemForm.value,
      description: descLines,
    }
    if (editingItem.value) {
      await updateHelpItem(editingItem.value.id, data)
    } else {
      await createHelpItem(data)
    }
    itemDialogVisible.value = false
    fetchItems(activeCategoryId.value)
  } catch (e) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    itemFormLoading.value = false
  }
}

async function handleDeleteItem(item) {
  if (!confirm(`确定删除"${item.name}"吗？`)) return
  try {
    await deleteHelpItem(item.id)
    fetchItems(activeCategoryId.value)
  } catch (e) {
    alert(e.response?.data?.message || '删除失败')
  }
}

async function moveCategory(cat, direction) {
  const idx = categories.value.findIndex((c) => c.id === cat.id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= categories.value.length) return
  const target = categories.value[targetIdx]
  const oldSort = cat.sortOrder
  const newSort = target.sortOrder
  await updateHelpCategory(cat.id, { ...cat, sortOrder: newSort })
  await updateHelpCategory(target.id, { ...target, sortOrder: oldSort })
  fetchCategories()
}

async function moveItem(item, direction) {
  const idx = items.value.findIndex((i) => i.id === item.id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= items.value.length) return
  const target = items.value[targetIdx]
  const oldSort = item.sortOrder
  const newSort = target.sortOrder
  await updateHelpItem(item.id, { ...item, sortOrder: newSort, description: item.description })
  await updateHelpItem(target.id, { ...target, sortOrder: oldSort, description: target.description })
  fetchItems(activeCategoryId.value)
}

onMounted(fetchCategories)
</script>

<template>
  <div class="help-manage">
    <div class="help-sidebar">
      <div class="sidebar-header">
        <h3>分类列表</h3>
        <button class="btn-add-sm" @click="openAddCategory">
          <Plus :size="14" />
        </button>
      </div>
      <div class="cat-list">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="cat-item"
          :class="{ active: activeCategoryId === cat.id }"
          @click="selectCategory(cat)"
        >
          <div class="cat-info">
            <component :is="cat.type === 'category' ? FolderOpen : FileText" :size="16" />
            <span>{{ cat.title }}</span>
          </div>
          <div class="cat-actions" @click.stop>
            <button class="icon-btn-sm" @click="moveCategory(cat, 'up')" :disabled="categories.indexOf(cat) === 0">
              <ChevronUp :size="12" />
            </button>
            <button class="icon-btn-sm" @click="moveCategory(cat, 'down')" :disabled="categories.indexOf(cat) === categories.length - 1">
              <ChevronDown :size="12" />
            </button>
            <button class="icon-btn-sm edit" @click="openEditCategory(cat)">
              <Pencil :size="12" />
            </button>
            <button class="icon-btn-sm delete" @click="handleDeleteCategory(cat)">
              <Trash2 :size="12" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="help-main">
      <div class="page-header">
        <h2>{{ activeCategory ? activeCategory.title : '请选择分类' }} - 条目管理</h2>
        <button class="btn-primary" :disabled="!activeCategory || activeCategory?.type !== 'category'" @click="openAddItem">
          <Plus :size="16" />
          <span>新增条目</span>
        </button>
      </div>

      <div v-if="activeCategory && activeCategory.type === 'content'" class="content-notice">
        这是一个单页内容分类，直接编辑分类描述即可。
      </div>

      <div v-else-if="activeCategory" class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">排序</th>
              <th>问题</th>
              <th>答案预览</th>
              <th style="width: 160px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <div class="sort-btns">
                  <button class="icon-btn" @click="moveItem(item, 'up')" :disabled="items.indexOf(item) === 0">
                    <ChevronUp :size="14" />
                  </button>
                  <button class="icon-btn" @click="moveItem(item, 'down')" :disabled="items.indexOf(item) === items.length - 1">
                    <ChevronDown :size="14" />
                  </button>
                </div>
              </td>
              <td>{{ item.name }}</td>
              <td class="desc-cell">{{ Array.isArray(item.description) ? item.description[0] : '' }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn-edit" @click="openEditItem(item)">
                    <Pencil :size="14" />
                    编辑
                  </button>
                  <button class="btn-delete" @click="handleDeleteItem(item)">
                    <Trash2 :size="14" />
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && items.length === 0">
              <td colspan="4" class="empty-row">暂无条目</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-tip">请从左侧选择一个分类</div>
    </div>

    <div v-if="catDialogVisible" class="dialog-mask" @click.self="catDialogVisible = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingCategory ? '编辑分类' : '新增分类' }}</h3>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label>标题</label>
            <input v-model="catForm.title" type="text" placeholder="请输入分类标题" />
          </div>
          <div class="form-row">
            <label>类型</label>
            <select v-model="catForm.type">
              <option value="category">分类（有子条目）</option>
              <option value="content">单页内容</option>
            </select>
          </div>
          <div v-if="catForm.type === 'content'" class="form-row">
            <label>内容描述</label>
            <textarea v-model="catForm.description" rows="6" placeholder="请输入内容"></textarea>
          </div>
          <div class="form-row">
            <label>排序</label>
            <input v-model.number="catForm.sortOrder" type="number" placeholder="数字越小越靠前" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-default" @click="catDialogVisible = false">取消</button>
          <button class="btn-primary" :disabled="catFormLoading" @click="handleCategorySubmit">
            {{ catFormLoading ? '保存中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="itemDialogVisible" class="dialog-mask" @click.self="itemDialogVisible = false">
      <div class="dialog" style="width: 600px">
        <div class="dialog-header">
          <h3>{{ editingItem ? '编辑条目' : '新增条目' }}</h3>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label>问题名称</label>
            <input v-model="itemForm.name" type="text" placeholder="请输入问题" />
          </div>
          <div class="form-row">
            <label>答案描述（每行一条）</label>
            <textarea v-model="itemForm.description" rows="8" placeholder="每行一条答案内容"></textarea>
          </div>
          <div class="form-row">
            <label>排序</label>
            <input v-model.number="itemForm.sortOrder" type="number" placeholder="数字越小越靠前" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-default" @click="itemDialogVisible = false">取消</button>
          <button class="btn-primary" :disabled="itemFormLoading" @click="handleItemSubmit">
            {{ itemFormLoading ? '保存中...' : '确定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-manage {
  display: flex;
  gap: 20px;
  min-height: 100%;
}
.help-sidebar {
  width: 260px;
  background: #fff;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}
.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a1a2e;
}
.btn-add-sm {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #c9a96e 0%, #b8945f 100%);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.cat-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.cat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: all 0.2s;
}
.cat-item:hover {
  background: #f5f5f5;
}
.cat-item.active {
  background: rgba(201, 169, 110, 0.1);
  color: #c9a96e;
}
.cat-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}
.cat-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}
.cat-item:hover .cat-actions {
  opacity: 1;
}
.icon-btn-sm {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #999;
}
.icon-btn-sm:hover:not(:disabled) {
  background: #f0f0f0;
  color: #666;
}
.icon-btn-sm.edit:hover:not(:disabled) {
  color: #4a90d9;
}
.icon-btn-sm.delete:hover:not(:disabled) {
  color: #e74c3c;
}
.icon-btn-sm:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.help-main {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-width: 0;
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
  opacity: 0.4;
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
.content-notice {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 6px;
  color: #888;
  font-size: 14px;
}
.empty-tip {
  padding: 60px;
  text-align: center;
  color: #aaa;
  font-size: 14px;
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
.desc-cell {
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
  width: 480px;
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
  max-height: 70vh;
  overflow-y: auto;
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
.form-row input[type='number'],
.form-row select,
.form-row textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}
.form-row input:focus,
.form-row select:focus,
.form-row textarea:focus {
  outline: none;
  border-color: #c9a96e;
}
.form-row textarea {
  resize: vertical;
  min-height: 80px;
}
</style>
