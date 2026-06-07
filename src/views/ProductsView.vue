<script setup>
import { computed, ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import productData from '../data/productData.json'
import productPlaceholder from '../assets/product-placeholder.png'

const majorCategories = ['脸部护理', '肌肤需求', '产品系列']
const activeMajor = ref(majorCategories[0])
const activeMinor = ref('全部')
const keyword = ref('')

const minorCategories = computed(() => [
  '全部',
  ...new Set(
    productData
      .filter((product) => product.majorCategory === activeMajor.value)
      .map((product) => product.minorCategory),
  ),
])

const filteredProducts = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  return productData.filter((product) => {
    const matchesMajor = product.majorCategory === activeMajor.value
    const matchesMinor = activeMinor.value === '全部' || product.minorCategory === activeMinor.value
    const matchesKeyword =
      !normalizedKeyword ||
      `${product.name} ${product.license} ${product.spec}`.toLowerCase().includes(normalizedKeyword)

    return matchesMajor && matchesMinor && matchesKeyword
  })
})

watch(activeMajor, () => {
  activeMinor.value = '全部'
})
</script>

<template>
  <section class="products-page">
    <header class="products-heading">
      <div>
        <p>PRODUCT CATALOG</p>
        <h1>产品中心</h1>
      </div>
      <label class="product-search">
        <Search :size="18" aria-hidden="true" />
        <input v-model="keyword" type="search" placeholder="搜索产品名称、证号或规格" />
        <button v-if="keyword" type="button" aria-label="清空搜索" title="清空搜索" @click="keyword = ''">
          <X :size="17" />
        </button>
      </label>
    </header>

    <nav class="major-category-tabs" aria-label="产品大分类">
      <button
        v-for="category in majorCategories"
        :key="category"
        type="button"
        :class="{ active: activeMajor === category }"
        @click="activeMajor = category"
      >
        {{ category }}
      </button>
    </nav>

    <nav class="minor-category-tabs" aria-label="产品小分类">
      <button
        v-for="category in minorCategories"
        :key="category"
        type="button"
        :class="{ active: activeMinor === category }"
        @click="activeMinor = category"
      >
        {{ category }}
      </button>
    </nav>

    <div class="products-result-bar">
      <span>{{ activeMajor }} / {{ activeMinor }}</span>
      <strong>{{ filteredProducts.length }} 件产品</strong>
    </div>

    <div v-if="filteredProducts.length" class="product-grid">
      <article v-for="product in filteredProducts" :key="product.id" class="product-card">
        <div class="product-card-image">
          <img :src="productPlaceholder" :alt="product.name" loading="lazy" />
        </div>
        <div class="product-card-topline">
          <span>{{ product.minorCategory }}</span>
          <small>{{ product.license }}</small>
        </div>
        <h2>{{ product.name }}</h2>
        <dl>
          <div>
            <dt>规格</dt>
            <dd>{{ product.spec }}</dd>
          </div>
          <div>
            <dt>零售价</dt>
            <dd>¥{{ product.price }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <div v-else class="products-empty">
      <Search :size="28" aria-hidden="true" />
      <p>没有找到匹配的产品</p>
      <button type="button" @click="keyword = ''; activeMinor = '全部'">清除筛选</button>
    </div>
  </section>
</template>
