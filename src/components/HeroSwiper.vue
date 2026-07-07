<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import VisualPanel from './VisualPanel.vue'

const props = defineProps({
  slides: {
    type: Array,
    required: true,
  },
})

const index = ref(0)
let timer = null

const current = computed(() => props.slides[index.value])

function next() {
  index.value = (index.value + 1) % props.slides.length
}

function prev() {
  index.value = (index.value + props.slides.length - 1) % props.slides.length
}

onMounted(() => {
  timer = window.setInterval(next, 3000)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
})
</script>

<template>
  <section class="hero-swiper">
    <VisualPanel :image-pc="current.imagePc" :image-tablet="current.imageTablet" :image-mobile="current.imageMobile" />

    <button class="swiper-arrow prev" type="button" aria-label="上一张" @click="prev">‹</button>
    <button class="swiper-arrow next" type="button" aria-label="下一张" @click="next">›</button>

    <div class="swiper-dots" aria-label="轮播进度">
      <button
        v-for="(_, dotIndex) in slides"
        :key="dotIndex"
        type="button"
        :class="{ active: dotIndex === index }"
        :aria-label="`切换到第 ${dotIndex + 1} 张`"
        @click="index = dotIndex"
      ></button>
    </div>
  </section>
</template>
