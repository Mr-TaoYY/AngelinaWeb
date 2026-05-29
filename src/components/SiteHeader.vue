<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { navList } from '../data/siteData'
import navLogo from '../assets/nav-logo.png'

const route = useRoute()
const open = ref(false)
const isClosing = ref(false)

watch(open, (value) => {
  if (value) {
    isClosing.value = false
    document.body.style.overflow = 'hidden'
  } else {
    isClosing.value = true
    // 保持 wrapper 直到动画结束，再彻底隐藏并恢复滚动
    setTimeout(() => {
      document.body.style.overflow = ''
      isClosing.value = false
    }, 340) // 应与 CSS transition 保持一致（略大于动画时长）
  }
})

const closeMenu = () => {
  open.value = false
}
</script>

<template>
  <header class="site-header">
    <div class="desktop-header">
      <RouterLink class="header-logo" to="/" aria-label="返回首页">
        <img :src="navLogo" alt="返回首页" />
      </RouterLink>
      <nav class="header-nav" aria-label="主导航">
        <RouterLink
          v-for="item in navList"
          :key="item.id"
          :to="item.url"
          :class="{ active: route.path === item.url || (item.url !== '/' && route.path.startsWith(item.url)) }"
        >
          {{ item.title }}
        </RouterLink>
      </nav>
    </div>

    <div class="mobile-header">
      <button class="menu-button" type="button" aria-label="打开菜单" @click="open = true">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <RouterLink class="mobile-logo" to="/" aria-label="返回首页">
        <img :src="navLogo" alt="返回首页" />
      </RouterLink>
    </div>

    <div v-if="open || isClosing" :class="['mobile-drawer-wrapper', { closing: isClosing }]">
      <div class="drawer-backdrop" @click="closeMenu"></div>
      <div class="mobile-drawer" role="dialog" aria-modal="true" aria-label="移动端导航">
        <div class="drawer-header">
          <button class="drawer-close" type="button" aria-label="关闭菜单" @click="closeMenu">×</button>
        </div>
        <nav class="drawer-nav">
          <RouterLink v-for="item in navList" :key="item.id" :to="item.url" @click="closeMenu">
            {{ item.title }}
          </RouterLink>
        </nav>
        <div class="drawer-footer"></div>
      </div>
    </div>
  </header>
</template>
