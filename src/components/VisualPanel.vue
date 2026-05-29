<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    default: 'black',
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="visual-panel" :class="[`theme-${theme}`, { compact }]">
    <div class="visual-product" aria-hidden="true">
      <div class="cap"></div>
      <div class="bottle">
        <span>HR</span>
      </div>
    </div>
    <div class="visual-copy">
      <p>TEST IMAGE</p>
      <h1 v-if="!compact">{{ title }}</h1>
      <h2 v-else>{{ title }}</h2>
      <span>{{ subtitle }}</span>
    </div>
  </div>
</template>
