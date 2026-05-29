<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { classifyData } from '../data/siteData'

const route = useRoute()
const page = computed(() => classifyData.find((item) => item.id === route.query.id) || classifyData[0])
</script>

<template>
  <section class="classify-page" :class="`theme-${page.theme}`">
    <div class="classify-hero">
      <p>TEST CATEGORY</p>
      <h1>{{ page.title }}</h1>
      <span>模拟原站系列页：整屏背景图 + 多个商品热点按钮</span>
    </div>
    <div class="hotspot-grid">
      <a v-for="(product, index) in page.products" :key="product" href="https://example.com/product" target="_blank">
        <small>{{ String(index + 1).padStart(2, '0') }}</small>
        {{ product }}
      </a>
    </div>
  </section>
</template>
