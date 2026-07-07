<script setup>
import { computed, onMounted, ref } from 'vue'
import { getHelpList } from '../api/help.js'

const helpCenterData = ref([])
const activeId = ref('')
const openQuestion = ref('')

const active = computed(() => helpCenterData.value.find((item) => item.id === activeId.value))

onMounted(async () => {
  try {
    const res = await getHelpList()
    if (res.code === 0 && res.data.length) {
      helpCenterData.value = res.data
      activeId.value = res.data[0].id
      if (res.data[0].type === 'category' && res.data[0].children?.length) {
        openQuestion.value = res.data[0].children[0].id
      }
    }
  } catch (e) {
    console.error('加载帮助中心数据失败', e)
  }
})
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

    <article class="help-content" v-if="active">
      <h1>{{ active.title }}</h1>
      <div v-if="active.type === 'category'" class="faq-list">
        <section v-for="item in active.children" :key="item.id">
          <button type="button" @click="openQuestion = openQuestion === item.id ? '' : item.id">
            {{ item.name }}
            <span>{{ openQuestion === item.id ? '-' : '+' }}</span>
          </button>
          <div v-if="openQuestion === item.id">
            <p v-for="(line, idx) in item.description" :key="idx">{{ line }}</p>
          </div>
        </section>
      </div>
      <p v-else>{{ active.description }}</p>
    </article>
  </section>
</template>
