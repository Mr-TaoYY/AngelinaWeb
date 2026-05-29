<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 0
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <button class="top-button" :class="{ visible }" type="button" aria-label="返回顶部" @click="toTop">
    ↑
  </button>
</template>
