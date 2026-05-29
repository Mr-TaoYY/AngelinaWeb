<script setup>
import { RouterView } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import BreadcrumbBar from './components/BreadcrumbBar.vue'
import SiteFooter from './components/SiteFooter.vue'
import ToppingButton from './components/ToppingButton.vue'
</script>

<template>
  <SiteHeader />
  <main class="page-main">
    <BreadcrumbBar />
    <RouterView />
  </main>
  <SiteFooter />
  <ToppingButton />
</template>
