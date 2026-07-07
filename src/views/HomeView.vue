<script setup>
import { onMounted, ref } from 'vue'
import HeroSwiper from '../components/HeroSwiper.vue'
import { getSwiperList } from '../api/swiper.js'

const slides = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getSwiperList()
    if (res.code === 0) {
      slides.value = res.data
    }
  } catch (e) {
    console.error('加载轮播图失败', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-if="!loading && slides.length">
    <HeroSwiper :slides="slides" />
  </div>
</template>
