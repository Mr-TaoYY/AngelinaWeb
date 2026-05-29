<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { routeTitles } from '../data/siteData'

const route = useRoute()

const crumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  if (parts.length < 2 && route.path !== '/history') return []

  if (route.path === '/history') {
    return [
      { title: '品牌故事', path: '/brandStory' },
      { title: '品牌历史', path: '/history' },
    ]
  }

  return parts.map((part, index) => {
    const path = `/${parts.slice(0, index + 1).join('/')}`
    let title = routeTitles[part] || part
    if (part === 'classify') title = routeTitles.classify[route.query.id] || '系列分类'
    return { title, path }
  })
})
</script>

<template>
  <div v-if="crumbs.length > 1" class="breadcrumb-bar">
    <template v-for="(crumb, index) in crumbs" :key="crumb.path">
      <RouterLink v-if="index !== crumbs.length - 1" :to="crumb.path === '/brandStory/classify' ? '/brandStory' : crumb.path">
        {{ crumb.title }}
      </RouterLink>
      <span v-else>{{ crumb.title }}</span>
      <i v-if="index !== crumbs.length - 1">></i>
    </template>
  </div>
</template>
