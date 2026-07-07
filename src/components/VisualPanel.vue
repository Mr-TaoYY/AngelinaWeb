<script setup>
defineProps({
  title: {
    type: String,
    default: '',
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
  imagePc: {
    type: String,
    default: '',
  },
  imageTablet: {
    type: String,
    default: '',
  },
  imageMobile: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="visual-panel" :class="[`theme-${theme}`, { compact, 'has-image-tablet': !!imageTablet }]">
    <template v-if="imagePc || imageTablet || imageMobile">
      <img v-if="imagePc" :src="imagePc" alt="" class="visual-image visual-image-pc" />
      <img v-if="imageTablet" :src="imageTablet" alt="" class="visual-image visual-image-tablet" />
      <img v-if="imageMobile" :src="imageMobile" alt="" class="visual-image visual-image-mobile" />
    </template>
    <div v-else class="visual-product" aria-hidden="true">
      <div class="cap"></div>
      <div class="bottle">
        <span>HR</span>
      </div>
    </div>
    <div v-if="title && !(imagePc || imageTablet || imageMobile)" class="visual-copy">
      <p>TEST IMAGE</p>
      <h1 v-if="!compact">{{ title }}</h1>
      <h2 v-else>{{ title }}</h2>
      <span>{{ subtitle }}</span>
    </div>
  </div>
</template>
