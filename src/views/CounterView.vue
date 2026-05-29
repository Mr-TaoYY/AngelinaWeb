<script setup>
import { channelList } from '../data/siteData'
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

    <div class="store-query">
      <h2>线下柜台查询</h2>
      <div>
        <select aria-label="选择城市">
          <option>上海</option>
          <option>北京</option>
          <option>广州</option>
        </select>
        <input type="text" placeholder="输入商圈或地址" />
        <button type="button">查询</button>
      </div>
    </div>
  </section>
</template>
