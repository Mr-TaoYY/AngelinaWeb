<script setup>
import { RouterLink } from 'vue-router'
import VisualPanel from '../components/VisualPanel.vue'
import { brandStory } from '../data/siteData'
</script>

<template>
  <section class="stack-page">
    <article v-for="block in brandStory" :key="block.id" class="story-block">
      <RouterLink v-if="block.href" :to="block.href" class="stack-link">
        <VisualPanel :title="block.title" :subtitle="block.subtitle" :theme="block.theme" />
      </RouterLink>

      <div v-else-if="block.type === 'video'" class="video-stage">
        <div class="video-frame">
          <span></span>
        </div>
        <div class="video-copy">
          <p>TEST VIDEO</p>
          <h1>{{ block.title }}</h1>
          <span>{{ block.subtitle }}</span>
        </div>
      </div>

      <div v-else-if="block.type === 'split'" class="split-hotspot">
        <VisualPanel :title="block.title" :subtitle="block.subtitle" :theme="block.theme" />
        <RouterLink class="hotspot left" :to="block.leftHref">{{ block.leftLabel }}</RouterLink>
        <RouterLink class="hotspot right" :to="block.rightHref">{{ block.rightLabel }}</RouterLink>
      </div>

      <VisualPanel v-else :title="block.title" :subtitle="block.subtitle" :theme="block.theme" />
    </article>
  </section>
</template>
