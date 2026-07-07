<script setup>
import { onMounted, ref } from 'vue'
import { getChannelList } from '../api/channels.js'

const channelList = ref([])

onMounted(async () => {
  try {
    const res = await getChannelList()
    if (res.code === 0) {
      channelList.value = res.data
    }
  } catch (e) {
    console.error('加载渠道数据失败', e)
  }
})
</script>

<template>
  <section class="counter-page">
    <div class="counter-hero">
      <h1>官方渠道查询</h1>
      <p>以下为安捷莉娜官方渠道，请通过对应入口前往店铺。</p>
    </div>

    <div class="channel-grid">
      <a
        v-for="channel in channelList"
        :key="channel.id"
        :href="channel.url"
        target="_blank"
        rel="noreferrer"
      >
        <span>{{ channel.store }}</span>
        <strong>{{ channel.title }}</strong>
      </a>
    </div>
  </section>
</template>
