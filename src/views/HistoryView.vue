<script setup>
import VisualPanel from '../components/VisualPanel.vue'
import { historyBlocks } from '../data/siteData'
</script>

<template>
  <section class="stack-page">
    <VisualPanel
      v-for="block in historyBlocks"
      :key="block.id"
      :title="block.title"
      :subtitle="block.subtitle"
      :theme="block.theme"
    />
  </section>
</template>
