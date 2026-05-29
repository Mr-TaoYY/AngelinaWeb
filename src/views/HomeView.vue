<script setup>
import HeroSwiper from '../components/HeroSwiper.vue'
import { homeSwiper } from '../data/siteData'
</script>

<template>
  <HeroSwiper :slides="homeSwiper" />
</template>
