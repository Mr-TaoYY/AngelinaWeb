<script setup>
import { ref, onMounted } from 'vue'
import VisualPanel from '../components/VisualPanel.vue'
import { getBrandStoryList } from '../api/brandStory.js'

const blocks = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await getBrandStoryList()
    if (res.code === 0) {
      blocks.value = res.data
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="stack-page brand-story-page" v-loading="loading">
    <article v-for="block in blocks" :key="block.id" class="story-block">

      <!-- 视频区块：背景图 + 视频叠加 -->
      <div v-if="block.type === 'video'" class="video-stage">
        <div class="video-bg">
          <img
            v-if="block.imageMobile"
            :src="block.imageMobile"
            alt=""
            class="visual-image visual-image-mobile"
          />
          <img
            v-else-if="block.imageTablet"
            :src="block.imageTablet"
            alt=""
            class="visual-image visual-image-tablet"
          />
          <img
            v-else-if="block.imagePc"
            :src="block.imagePc"
            alt=""
            class="visual-image visual-image-pc"
          />
        </div>
        <div class="video-wrap">
          <video
            v-if="block.videoUrl"
            :src="block.videoUrl"
            controls
            muted
            autoplay
            loop
            playsinline
          ></video>
        </div>
      </div>

      <!-- 图片区块：纯背景图 -->
      <VisualPanel
        v-else
        :image-pc="block.imagePc"
        :image-tablet="block.imageTablet"
        :image-mobile="block.imageMobile"
      />

    </article>
  </section>
</template>

<style scoped>
.stack-page {
  width: 100%;
}
.story-block {
  width: 100%;
}
.video-stage {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}
.video-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.video-bg .visual-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.video-wrap {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-wrap video {
  max-width: 80vw;
  max-height: 80vh;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
</style>
