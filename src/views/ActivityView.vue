<script setup>
import VisualPanel from '../components/VisualPanel.vue'
import { activityBlocks } from '../data/siteData'
</script>

<template>
  <section class="stack-page">
    <component
      :is="block.href ? 'a' : 'div'"
      v-for="block in activityBlocks"
      :key="block.id"
      :href="block.href || undefined"
      :target="block.href ? '_blank' : undefined"
      class="stack-link"
    >
      <VisualPanel :title="block.title" :subtitle="block.subtitle" :theme="block.theme" />
    </component>
  </section>
</template>
