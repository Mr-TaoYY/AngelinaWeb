<script setup>
import { ref, computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { Image, Store, HelpCircle, BookOpen, LogOut, Menu, X, Package, Trash2, Loader2, HardDrive } from 'lucide-vue-next'
import { getOrphanFiles, deleteOrphanFiles } from '../../api/upload.js'

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(true)

const menuItems = [
  { path: '/admin/swiper', label: '轮播图管理', icon: Image },
  { path: '/admin/products', label: '产品管理', icon: Package },
  { path: '/admin/brand-story', label: '品牌故事', icon: BookOpen },
  { path: '/admin/channels', label: '渠道管理', icon: Store },
  { path: '/admin/help', label: '帮助中心', icon: HelpCircle },
]

const username = computed(() => localStorage.getItem('admin_username') || '管理员')

const activePath = computed(() => {
  for (const item of menuItems) {
    if (route.path.startsWith(item.path)) return item.path
  }
  return ''
})

function handleLogout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_username')
  router.push('/admin/login')
}

function goTo(path) {
  router.push(path)
}

// ===== 孤儿文件清理 =====
const cleanupVisible = ref(false)
const cleanupLoading = ref(false)
const cleanupDeleting = ref(false)
const orphanList = ref([])
const orphanTotalSize = ref(0)
const cleanupResult = ref(null)
// 只读模式：仅查看大小，不显示清理按钮
const viewOnlyMode = ref(false)

function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

async function openCleanup() {
  viewOnlyMode.value = false
  cleanupVisible.value = true
  cleanupResult.value = null
  await fetchOrphans()
}

async function openViewOnly() {
  viewOnlyMode.value = true
  cleanupVisible.value = true
  cleanupResult.value = null
  await fetchOrphans()
}

async function fetchOrphans() {
  cleanupLoading.value = true
  try {
    const res = await getOrphanFiles()
    if (res.code === 0) {
      orphanList.value = res.data.list
      orphanTotalSize.value = res.data.totalSize
    }
  } catch (e) {
    alert(e.response?.data?.message || '扫描失败')
  } finally {
    cleanupLoading.value = false
  }
}

async function handleCleanup() {
  if (!orphanList.value.length) return
  if (!confirm(`确定清理 ${orphanList.value.length} 个孤儿文件吗？此操作不可恢复。`)) return
  cleanupDeleting.value = true
  try {
    const res = await deleteOrphanFiles()
    if (res.code === 0) {
      cleanupResult.value = res.data
      await fetchOrphans()
    }
  } catch (e) {
    alert(e.response?.data?.message || '清理失败')
  } finally {
    cleanupDeleting.value = false
  }
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar" :class="{ collapsed: !sidebarOpen }">
      <div class="sidebar-header">
        <h1 v-if="sidebarOpen">安捷莉娜</h1>
        <button class="toggle-btn" @click="sidebarOpen = !sidebarOpen">
          <X v-if="sidebarOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>
      <nav class="sidebar-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="menu-item"
          :class="{ active: activePath === item.path }"
          @click="goTo(item.path)"
        >
          <component :is="item.icon" :size="20" />
          <span v-if="sidebarOpen">{{ item.label }}</span>
        </div>
      </nav>
    </aside>

    <div class="admin-main">
      <header class="admin-header">
        <div class="header-title">
          {{ menuItems.find((m) => activePath === m.path)?.label || '管理后台' }}
        </div>
        <div class="header-right">
          <span class="admin-user">{{ username }}</span>
          <button class="view-size-btn" @click="openViewOnly">
            <HardDrive :size="16" />
            <span>孤儿文件大小</span>
          </button>
          <button class="cleanup-btn" @click="openCleanup">
            <Trash2 :size="16" />
            <span>清理孤儿文件</span>
          </button>
          <button class="logout-btn" @click="handleLogout">
            <LogOut :size="16" />
            <span>退出</span>
          </button>
        </div>
      </header>
      <main class="admin-content">
        <RouterView />
      </main>
    </div>

    <!-- 孤儿文件清理弹窗 -->
    <div v-if="cleanupVisible" class="cleanup-mask" @click.self="cleanupVisible = false">
      <div class="cleanup-dialog">
        <div class="cleanup-header">
          <h3>{{ viewOnlyMode ? '孤儿文件大小查看' : '清理孤儿文件' }}</h3>
          <button class="cleanup-close" @click="cleanupVisible = false">
            <X :size="18" />
          </button>
        </div>
        <div class="cleanup-body">
          <p class="cleanup-desc">
            扫描 uploads 目录中未被数据库引用的文件（图片/视频）。<br />
            扫描范围：轮播图、品牌故事、产品图片的所有引用。
          </p>

          <div v-if="cleanupResult" class="cleanup-result">
            已删除 <strong>{{ cleanupResult.deleted }}</strong> 个文件，释放
            <strong>{{ formatSize(cleanupResult.freedBytes) }}</strong> 磁盘空间。
          </div>

          <div class="cleanup-stats" v-if="!cleanupLoading">
            <span>孤儿文件：<strong>{{ orphanList.length }}</strong> 个</span>
            <span>占用空间：<strong>{{ formatSize(orphanTotalSize) }}</strong></span>
            <button class="rescan-btn" @click="fetchOrphans">
              <Loader2 v-if="cleanupLoading" :size="14" class="spin" />
              重新扫描
            </button>
          </div>

          <div class="cleanup-list" v-if="orphanList.length">
            <div v-for="item in orphanList" :key="item.filename" class="cleanup-item">
              <span class="cleanup-filename" :title="item.filename">{{ item.filename }}</span>
              <span class="cleanup-size">{{ formatSize(item.size) }}</span>
            </div>
          </div>

          <div v-else-if="!cleanupLoading && !cleanupResult" class="cleanup-empty">
            没有发现孤儿文件，uploads 目录很干净。
          </div>

          <div v-if="cleanupLoading" class="cleanup-loading">
            <Loader2 :size="24" class="spin" />
            <span>扫描中...</span>
          </div>
        </div>
        <div class="cleanup-footer">
          <button class="btn-default" @click="cleanupVisible = false">关闭</button>
          <button
            v-if="!viewOnlyMode"
            class="btn-danger"
            :disabled="!orphanList.length || cleanupDeleting"
            @click="handleCleanup"
          >
            <Trash2 :size="14" />
            {{ cleanupDeleting ? '清理中...' : `清理全部 (${orphanList.length})` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f6fa;
}
.admin-sidebar {
  width: 220px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  transition: width 0.3s;
  flex-shrink: 0;
}
.admin-sidebar.collapsed {
  width: 64px;
}
.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.sidebar-header h1 {
  font-size: 18px;
  margin: 0;
  color: #c9a96e;
  font-weight: 600;
}
.toggle-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.sidebar-menu {
  padding: 12px 0;
}
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}
.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.menu-item.active {
  background: rgba(201, 169, 110, 0.2);
  color: #c9a96e;
  border-right: 3px solid #c9a96e;
}
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.admin-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.admin-user {
  font-size: 14px;
  color: #666;
}
.logout-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}
.logout-btn:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}
.admin-content {
  flex: 1;
  padding: 24px;
  overflow: auto;
}

/* 清理孤儿文件按钮 */
.cleanup-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}
.cleanup-btn:hover {
  color: #e67e22;
  border-color: #e67e22;
}
/* 孤儿文件大小查看按钮 */
.view-size-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}
.view-size-btn:hover {
  color: #4a90d9;
  border-color: #4a90d9;
}

/* 弹窗 */
.cleanup-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.cleanup-dialog {
  width: 640px;
  max-width: 92vw;
  max-height: 80vh;
  background: #fff;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.cleanup-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cleanup-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1a1a2e;
}
.cleanup-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.cleanup-close:hover {
  background: #f5f5f5;
  color: #333;
}
.cleanup-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}
.cleanup-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #888;
  line-height: 1.6;
}
.cleanup-result {
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #eaf7ee;
  border: 1px solid #c7e9d0;
  border-radius: 4px;
  font-size: 13px;
  color: #2e7d32;
}
.cleanup-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;
  color: #555;
}
.cleanup-stats strong {
  color: #e67e22;
}
.rescan-btn {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #666;
}
.rescan-btn:hover {
  border-color: #c9a96e;
  color: #c9a96e;
}
.cleanup-list {
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
}
.cleanup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 13px;
}
.cleanup-item:last-child {
  border-bottom: none;
}
.cleanup-filename {
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 12px;
}
.cleanup-size {
  color: #999;
  flex-shrink: 0;
}
.cleanup-empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
.cleanup-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #999;
}
.cleanup-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.cleanup-footer .btn-default {
  padding: 8px 16px;
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.cleanup-footer .btn-default:hover {
  border-color: #c9a96e;
  color: #c9a96e;
}
.cleanup-footer .btn-danger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.cleanup-footer .btn-danger:hover:not(:disabled) {
  background: #d43d2e;
}
.cleanup-footer .btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
