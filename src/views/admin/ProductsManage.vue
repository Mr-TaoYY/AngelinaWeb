<script setup>
import { onMounted, ref, computed } from 'vue'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Search } from 'lucide-vue-next'
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../api/products.js'
import { uploadImage } from '../../api/swiper.js'
import { getAdminSettings, updateSetting } from '../../api/settings.js'

const activeTab = ref('products')

// ===== 分类数据 =====
const categories = ref([])
const categoryLoading = ref(false)
const catDialogVisible = ref(false)
const editingCategory = ref(null)
const catForm = ref({ name: '', type: 'major', parentId: null, sortOrder: 0 })
const catFormLoading = ref(false)

const majorCategories = computed(() => categories.value.filter((c) => c.type === 'major'))

function getMinorCategories(majorId) {
  return categories.value.filter((c) => c.parentId === majorId)
}

async function fetchCategories() {
  categoryLoading.value = true
  try {
    const res = await getAdminCategories()
    if (res.code === 0) categories.value = res.data
  } finally {
    categoryLoading.value = false
  }
}

function openAddCategory(type, parentId = null) {
  editingCategory.value = null
  catForm.value = {
    name: '',
    type,
    parentId,
    sortOrder: type === 'major'
      ? majorCategories.value.length
      : getMinorCategories(parentId).length,
  }
  catDialogVisible.value = true
}

function openEditCategory(item) {
  editingCategory.value = item
  catForm.value = {
    name: item.name,
    type: item.type,
    parentId: item.parentId,
    sortOrder: item.sortOrder ?? 0,
  }
  catDialogVisible.value = true
}

async function handleCategorySubmit() {
  if (!catForm.value.name) {
    alert('请填写分类名称')
    return
  }
  catFormLoading.value = true
  try {
    if (editingCategory.value) {
      await updateCategory(editingCategory.value.id, catForm.value)
    } else {
      await createCategory(catForm.value)
    }
    catDialogVisible.value = false
    fetchCategories()
  } catch (e) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    catFormLoading.value = false
  }
}

async function handleDeleteCategory(item) {
  if (!confirm(`确定删除分类"${item.name}"吗？`)) return
  try {
    await deleteCategory(item.id)
    fetchCategories()
  } catch (e) {
    alert(e.response?.data?.message || '删除失败')
  }
}

async function moveCategory(item, direction) {
  const siblings = item.type === 'major' ? majorCategories.value : getMinorCategories(item.parentId)
  const idx = siblings.findIndex((i) => i.id === item.id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= siblings.length) return
  const target = siblings[targetIdx]
  await updateCategory(item.id, { ...item, sortOrder: target.sortOrder })
  await updateCategory(target.id, { ...target, sortOrder: item.sortOrder })
  fetchCategories()
}

// ===== 产品数据 =====
const products = ref([])
const productLoading = ref(false)
const filterMajorId = ref('')
const filterMinorId = ref('')
const searchKeyword = ref('')

const filteredMinorCategories = computed(() => {
  if (!filterMajorId.value) return []
  return getMinorCategories(Number(filterMajorId.value))
})

async function fetchProducts() {
  productLoading.value = true
  try {
    const params = {}
    if (filterMinorId.value) params.categoryId = filterMinorId.value
    else if (filterMajorId.value) {
      // 获取该大分类下所有小分类的产品
    }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    const res = await getAdminProducts(params)
    if (res.code === 0) {
      // 如果选了大分类但没选小分类，前端过滤
      let data = res.data
      if (filterMajorId.value && !filterMinorId.value) {
        data = data.filter((p) => p.parentCategoryId === Number(filterMajorId.value))
      }
      products.value = data
    }
  } finally {
    productLoading.value = false
  }
}

// 产品弹窗
const prodDialogVisible = ref(false)
const editingProduct = ref(null)
const prodForm = ref({
  categoryId: null,
  name: '',
  license: '妆',
  spec: '',
  price: 0,
  image: '',
  linkUrl: '',
  sortOrder: 0,
})
const prodFormLoading = ref(false)

const prodFormMinorCategories = computed(() => {
  if (!prodForm.value._majorId) return []
  return getMinorCategories(prodForm.value._majorId)
})

function openAddProduct() {
  editingProduct.value = null
  prodForm.value = {
    categoryId: null,
    _majorId: '',
    name: '',
    license: '妆',
    spec: '',
    price: 0,
    image: '',
    linkUrl: '',
    sortOrder: products.value.length,
  }
  prodDialogVisible.value = true
}

function openEditProduct(item) {
  editingProduct.value = item
  prodForm.value = {
    categoryId: item.categoryId,
    _majorId: item.parentCategoryId || '',
    name: item.name,
    license: item.license || '妆',
    spec: item.spec || '',
    price: item.price || 0,
    image: item.image || '',
    linkUrl: item.linkUrl || '',
    sortOrder: item.sortOrder ?? 0,
  }
  prodDialogVisible.value = true
}

async function handleProductSubmit() {
  if (!prodForm.value.name) {
    alert('请填写产品名称')
    return
  }
  if (!prodForm.value.categoryId) {
    alert('请选择小分类')
    return
  }
  prodFormLoading.value = true
  try {
    const { _majorId, ...payload } = prodForm.value
    if (editingProduct.value) {
      await updateProduct(editingProduct.value.id, payload)
    } else {
      await createProduct(payload)
    }
    prodDialogVisible.value = false
    fetchProducts()
  } catch (e) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    prodFormLoading.value = false
  }
}

async function handleDeleteProduct(item) {
  if (!confirm(`确定删除产品"${item.name}"吗？`)) return
  try {
    await deleteProduct(item.id)
    fetchProducts()
  } catch (e) {
    alert(e.response?.data?.message || '删除失败')
  }
}

async function moveProduct(item, direction) {
  const idx = products.value.findIndex((i) => i.id === item.id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (targetIdx < 0 || targetIdx >= products.value.length) return
  const target = products.value[targetIdx]
  await updateProduct(item.id, { ...item, sortOrder: target.sortOrder })
  await updateProduct(target.id, { ...target, sortOrder: item.sortOrder })
  fetchProducts()
}

async function handleProductUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const res = await uploadImage(file)
    if (res.code === 0) {
      prodForm.value.image = res.data.url
    }
  } catch (e) {
    alert('上传失败')
  }
}

function handleFilterMajorChange() {
  filterMinorId.value = ''
  fetchProducts()
}

function handleSearch() {
  fetchProducts()
}

// ===== 通用设置 =====
const defaultLinkUrl = ref('')
const settingsLoading = ref(false)

async function fetchSettings() {
  settingsLoading.value = true
  try {
    const res = await getAdminSettings()
    if (res.code === 0) defaultLinkUrl.value = res.data.product_default_link_url || ''
  } finally {
    settingsLoading.value = false
  }
}

async function handleSaveSettings() {
  settingsLoading.value = true
  try {
    await updateSetting('product_default_link_url', defaultLinkUrl.value)
    alert('保存成功')
  } catch (e) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    settingsLoading.value = false
  }
}

onMounted(async () => {
  await fetchCategories()
  fetchProducts()
  fetchSettings()
})
</script>

<template>
  <div class="manage-page">
    <!-- Tab 切换 -->
    <div class="tab-bar">
      <button :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">产品管理</button>
      <button :class="{ active: activeTab === 'categories' }" @click="activeTab = 'categories'">分类管理</button>
      <button :class="{ active: activeTab === 'settings' }" @click="activeTab = 'settings'">通用设置</button>
    </div>

    <!-- ===== 产品管理 ===== -->
    <template v-if="activeTab === 'products'">
      <div class="page-header">
        <div class="filter-bar">
          <select v-model="filterMajorId" @change="handleFilterMajorChange" class="filter-select">
            <option value="">全部大分类</option>
            <option v-for="m in majorCategories" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <select v-model="filterMinorId" @change="fetchProducts" class="filter-select" :disabled="!filterMajorId">
            <option value="">全部小分类</option>
            <option v-for="m in filteredMinorCategories" :key="m.id" :value="m.id">{{ m.name }}</option>
          </select>
          <div class="search-box">
            <Search :size="16" />
            <input v-model="searchKeyword" type="text" placeholder="搜索产品名称" @keyup.enter="handleSearch" />
          </div>
        </div>
        <button class="btn-primary" @click="openAddProduct">
          <Plus :size="16" />
          <span>新增产品</span>
        </button>
      </div>

      <div class="table-wrapper" v-loading="productLoading">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">排序</th>
              <th style="width: 70px">图片</th>
              <th>产品名称</th>
              <th style="width: 120px">大分类</th>
              <th style="width: 120px">小分类</th>
              <th style="width: 60px">资质</th>
              <th style="width: 80px">规格</th>
              <th style="width: 80px">价格</th>
              <th style="width: 160px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in products" :key="item.id">
              <td>
                <div class="sort-btns">
                  <button class="icon-btn" @click="moveProduct(item, 'up')" :disabled="idx === 0">
                    <ChevronUp :size="14" />
                  </button>
                  <button class="icon-btn" @click="moveProduct(item, 'down')" :disabled="idx === products.length - 1">
                    <ChevronDown :size="14" />
                  </button>
                </div>
              </td>
              <td>
                <img v-if="item.image" :src="item.image" class="thumb" alt="" />
                <span v-else class="empty">-</span>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.parentCategoryName || '-' }}</td>
              <td>{{ item.categoryName || '-' }}</td>
              <td>{{ item.license }}</td>
              <td>{{ item.spec }}</td>
              <td>¥{{ item.price }}</td>
              <td>
                <a
                  v-if="item.linkUrl"
                  :href="item.linkUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-cell"
                  :title="item.linkUrl"
                >{{ item.linkUrl }}</a>
                <span v-else class="empty">-</span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-edit" @click="openEditProduct(item)">
                    <Pencil :size="14" />
                    编辑
                  </button>
                  <button class="btn-delete" @click="handleDeleteProduct(item)">
                    <Trash2 :size="14" />
                    删除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!productLoading && products.length === 0">
              <td colspan="9" class="empty-row">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ===== 分类管理 ===== -->
    <template v-if="activeTab === 'categories'">
      <div class="page-header">
        <h2>分类管理</h2>
        <button class="btn-primary" @click="openAddCategory('major')">
          <Plus :size="16" />
          <span>新增大分类</span>
        </button>
      </div>

      <div v-loading="categoryLoading">
        <div v-for="major in majorCategories" :key="major.id" class="category-block">
          <div class="category-row major-row">
            <div class="sort-btns">
              <button class="icon-btn" @click="moveCategory(major, 'up')" :disabled="majorCategories.indexOf(major) === 0">
                <ChevronUp :size="14" />
              </button>
              <button class="icon-btn" @click="moveCategory(major, 'down')" :disabled="majorCategories.indexOf(major) === majorCategories.length - 1">
                <ChevronDown :size="14" />
              </button>
            </div>
            <span class="category-name">{{ major.name }}</span>
            <span class="category-tag">大分类</span>
            <div class="action-btns">
              <button class="btn-edit" @click="openEditCategory(major)">
                <Pencil :size="14" />
                编辑
              </button>
              <button class="btn-delete" @click="handleDeleteCategory(major)">
                <Trash2 :size="14" />
                删除
              </button>
              <button class="btn-add-sub" @click="openAddCategory('minor', major.id)">
                <Plus :size="14" />
                添加小分类
              </button>
            </div>
          </div>
          <div v-for="minor in getMinorCategories(major.id)" :key="minor.id" class="category-row minor-row">
            <div class="sort-btns">
              <button class="icon-btn" @click="moveCategory(minor, 'up')" :disabled="getMinorCategories(major.id).indexOf(minor) === 0">
                <ChevronUp :size="14" />
              </button>
              <button class="icon-btn" @click="moveCategory(minor, 'down')" :disabled="getMinorCategories(major.id).indexOf(minor) === getMinorCategories(major.id).length - 1">
                <ChevronDown :size="14" />
              </button>
            </div>
            <span class="category-name indent">{{ minor.name }}</span>
            <span class="category-tag minor">小分类</span>
            <div class="action-btns">
              <button class="btn-edit" @click="openEditCategory(minor)">
                <Pencil :size="14" />
                编辑
              </button>
              <button class="btn-delete" @click="handleDeleteCategory(minor)">
                <Trash2 :size="14" />
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ===== 通用设置 ===== -->
    <template v-if="activeTab === 'settings'">
      <div class="page-header">
        <h2>通用设置</h2>
      </div>
      <div class="settings-card" v-loading="settingsLoading">
        <div class="form-row">
          <label>产品通用跳转链接</label>
          <input v-model="defaultLinkUrl" type="text" placeholder="留空则不可点击，如：https://anjielina.tmall.com/xxx" />
          <p class="form-tip">当产品未单独设置跳转链接时，将使用此地址。若此处也为空，则产品卡片不可点击。</p>
        </div>
        <div class="settings-footer">
          <button class="btn-primary" :disabled="settingsLoading" @click="handleSaveSettings">
            {{ settingsLoading ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>
    </template>

    <!-- 分类弹窗 -->
    <div v-if="catDialogVisible" class="dialog-mask" @click.self="catDialogVisible = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>{{ editingCategory ? '编辑分类' : '新增分类' }}</h3>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label>分类名称</label>
            <input v-model="catForm.name" type="text" placeholder="请输入分类名称" />
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

    <!-- 产品弹窗 -->
    <div v-if="prodDialogVisible" class="dialog-mask" @click.self="prodDialogVisible = false">
      <div class="dialog dialog-large">
        <div class="dialog-header">
          <h3>{{ editingProduct ? '编辑产品' : '新增产品' }}</h3>
        </div>
        <div class="dialog-body">
          <div class="form-row">
            <label>大分类</label>
            <select v-model="prodForm._majorId" class="form-select">
              <option value="">请选择大分类</option>
              <option v-for="m in majorCategories" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label>小分类</label>
            <select v-model="prodForm.categoryId" class="form-select" :disabled="!prodForm._majorId">
              <option value="">请选择小分类</option>
              <option v-for="m in prodFormMinorCategories" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="form-row">
            <label>产品名称</label>
            <input v-model="prodForm.name" type="text" placeholder="请输入产品名称" />
          </div>
          <div class="form-row-inline">
            <div class="form-row">
              <label>资质类型</label>
              <select v-model="prodForm.license" class="form-select">
                <option value="妆">妆</option>
                <option value="械">械</option>
              </select>
            </div>
            <div class="form-row">
              <label>规格</label>
              <input v-model="prodForm.spec" type="text" placeholder="如：150ml" />
            </div>
            <div class="form-row">
              <label>零售价</label>
              <input v-model.number="prodForm.price" type="number" placeholder="0" />
            </div>
          </div>
          <div class="form-row">
            <label>产品图片</label>
            <div class="upload-area">
              <img v-if="prodForm.image" :src="prodForm.image" class="preview-img" alt="" />
              <label class="upload-btn">
                <input type="file" accept="image/*" @change="handleProductUpload" />
                {{ prodForm.image ? '重新上传' : '点击上传' }}
              </label>
            </div>
          </div>
          <div class="form-row">
            <label>跳转链接</label>
            <input v-model="prodForm.linkUrl" type="text" placeholder="留空则不可点击跳转，如：https://anjielina.tmall.com/xxx" />
          </div>
          <div class="form-row">
            <label>排序</label>
            <input v-model.number="prodForm.sortOrder" type="number" placeholder="数字越小越靠前" />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-default" @click="prodDialogVisible = false">取消</button>
          <button class="btn-primary" :disabled="prodFormLoading" @click="handleProductSubmit">
            {{ prodFormLoading ? '保存中...' : '确定' }}
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
.tab-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}
.tab-bar button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  font-size: 15px;
  color: #999;
  transition: all 0.2s;
}
.tab-bar button.active {
  color: #c9a96e;
  border-bottom-color: #c9a96e;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}
.page-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1a1a2e;
}
.filter-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}
.filter-select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
}
.filter-select:focus {
  outline: none;
  border-color: #c9a96e;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  height: 34px;
  color: #999;
}
.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 160px;
  background: transparent;
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
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}
.empty {
  color: #ccc;
}
.link-cell {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
  color: #4a90d9;
  text-decoration: none;
}
.link-cell:hover {
  text-decoration: underline;
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
.btn-add-sub {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: #fff;
  color: #c9a96e;
  border: 1px solid #c9a96e;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.btn-add-sub:hover {
  background: #c9a96e;
  color: #fff;
}
.category-block {
  margin-bottom: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}
.category-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}
.category-row:last-child {
  border-bottom: none;
}
.major-row {
  background: #fafafa;
  font-weight: 600;
}
.minor-row {
  padding-left: 48px;
}
.category-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}
.category-name.indent {
  font-weight: 400;
  color: #555;
}
.category-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #c9a96e;
  color: #fff;
}
.category-tag.minor {
  background: #4a90d9;
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
  max-height: 90vh;
  overflow-y: auto;
}
.dialog-large {
  width: 600px;
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
.form-select {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  background: #fff;
  cursor: pointer;
}
.form-select:focus {
  outline: none;
  border-color: #c9a96e;
}
.form-row-inline {
  display: flex;
  gap: 16px;
}
.form-row-inline .form-row {
  flex: 1;
}
.upload-area {
  display: flex;
  align-items: center;
  gap: 16px;
}
.preview-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #eee;
}
.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px dashed #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
}
.upload-btn:hover {
  border-color: #c9a96e;
  color: #c9a96e;
}
.upload-btn input {
  display: none;
}
.settings-card {
  max-width: 600px;
}
.form-tip {
  margin: 6px 0 0;
  font-size: 12px;
  color: #999;
}
.settings-footer {
  margin-top: 16px;
}
</style>
