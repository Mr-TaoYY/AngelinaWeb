<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import BreadcrumbBar from './components/BreadcrumbBar.vue'
import SiteFooter from './components/SiteFooter.vue'
import ToppingButton from './components/ToppingButton.vue'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <template v-if="isAdmin">
    <RouterView />
  </template>
  <template v-else>
    <SiteHeader />
    <main class="page-main">
      <BreadcrumbBar />
      <RouterView />
    </main>
    <SiteFooter />
    <ToppingButton />
  </template>
</template>
