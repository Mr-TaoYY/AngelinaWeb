<script setup>
import { computed, ref } from 'vue'
import { helpCenterData } from '../data/siteData'

const activeId = ref(helpCenterData[0].id)
const openQuestion = ref(helpCenterData[0].children[0].id)

const active = computed(() => helpCenterData.find((item) => item.id === activeId.value))
</script>

<template>
  <section class="help-page">
    <aside class="help-tabs">
      <button
        v-for="item in helpCenterData"
        :key="item.id"
        type="button"
        :class="{ active: activeId === item.id }"
        @click="activeId = item.id"
      >
        {{ item.title }}
      </button>
    </aside>

    <article class="help-content">
      <h1>{{ active.title }}</h1>
      <div v-if="active.type === 'category'" class="faq-list">
        <section v-for="item in active.children" :key="item.id">
          <button type="button" @click="openQuestion = openQuestion === item.id ? '' : item.id">
            {{ item.name }}
            <span>{{ openQuestion === item.id ? '-' : '+' }}</span>
          </button>
          <div v-if="openQuestion === item.id">
            <p v-for="line in item.description" :key="line">{{ line }}</p>
          </div>
        </section>
      </div>
      <p v-else>{{ active.description }}</p>
    </article>
  </section>
</template>
