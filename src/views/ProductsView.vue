<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { getProductCategories, getProductList } from '../api/products.js'
import { getSiteConfig } from '../api/settings.js'
import productPlaceholder from '../assets/product-placeholder.png'

const categories = ref([])
const products = ref([])
const defaultLinkUrl = ref('')
const loading = ref(false)
const activeMajor = ref(null)
const activeMinor = ref(null) // null 表示"全部"
const keyword = ref('')

const minorOptions = computed(() => [
  { id: null, name: '全部' },
  ...((activeMajor.value && activeMajor.value.children) || []),
])

const filteredProducts = computed(() => {
  if (!activeMajor.value) return []
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  return products.value.filter((product) => {
    const matchesMajor = product.majorId === activeMajor.value.id
    const matchesMinor = !activeMinor.value || product.minorId === activeMinor.value.id
    const matchesKeyword =
      !normalizedKeyword ||
      `${product.name} ${product.license} ${product.spec}`.toLowerCase().includes(normalizedKeyword)
    return matchesMajor && matchesMinor && matchesKeyword
  })
})

watch(activeMajor, () => {
  activeMinor.value = null
})

async function fetchData() {
  loading.value = true
  try {
    const [catRes, prodRes, cfgRes] = await Promise.all([
      getProductCategories(),
      getProductList(),
      getSiteConfig('product_default_link_url'),
    ])
    if (catRes.code === 0) {
      categories.value = catRes.data
      if (categories.value.length && !activeMajor.value) {
        activeMajor.value = categories.value[0]
      }
    }
    if (prodRes.code === 0) {
      products.value = prodRes.data
    }
    if (cfgRes.code === 0) {
      defaultLinkUrl.value = cfgRes.data || ''
    }
  } finally {
    loading.value = false
  }
}

function selectMajor(major) {
  activeMajor.value = major
}

function selectMinor(minor) {
  activeMinor.value = minor
}

onMounted(fetchData)
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
      </label>
    </header>

    <nav class="major-category-tabs" aria-label="产品大分类">
      <button
        v-for="category in categories"
        :key="category.id"
        type="button"
        :class="{ active: activeMajor && activeMajor.id === category.id }"
        @click="selectMajor(category)"
      >
        {{ category.name }}
      </button>
    </nav>

    <nav class="minor-category-tabs" aria-label="产品小分类">
      <button
        v-for="(minor, idx) in minorOptions"
        :key="minor.id ?? `all-${idx}`"
        type="button"
        :class="{ active: !activeMinor ? !minor.id : activeMinor.id === minor.id }"
        @click="selectMinor(minor.id ? minor : null)"
      >
        {{ minor.name }}
      </button>
    </nav>

    <div class="products-result-bar">
      <span>{{ activeMajor ? activeMajor.name : '' }} / {{ activeMinor ? activeMinor.name : '全部' }}</span>
      <strong>{{ filteredProducts.length }} 件产品</strong>
    </div>

    <div v-if="filteredProducts.length" class="product-grid">
      <a
        v-for="product in filteredProducts"
        :key="product.id"
        :href="(product.linkUrl || defaultLinkUrl) || undefined"
        :target="(product.linkUrl || defaultLinkUrl) ? '_blank' : undefined"
        :rel="(product.linkUrl || defaultLinkUrl) ? 'noopener noreferrer' : undefined"
        class="product-card"
        :class="{ clickable: product.linkUrl || defaultLinkUrl }"
      >
        <div class="product-card-image">
          <img :src="product.image || productPlaceholder" :alt="product.name" loading="lazy" />
        </div>
        <!-- <div class="product-card-topline">
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
        </dl> -->
      </a>
    </div>

    <div v-else class="products-empty">
      <Search :size="28" aria-hidden="true" />
      <p>{{ loading ? '加载中...' : '没有找到匹配的产品' }}</p>
      <button v-if="!loading" type="button" @click="keyword = ''; activeMinor = null">清除筛选</button>
    </div>
  </section>
</template>
