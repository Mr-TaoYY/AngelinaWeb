import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import HomeView from './views/HomeView.vue'
import ActivityView from './views/ActivityView.vue'
import BrandStoryView from './views/BrandStoryView.vue'
import HistoryView from './views/HistoryView.vue'
import ClassifyView from './views/ClassifyView.vue'
import CounterView from './views/CounterView.vue'
import HelpView from './views/HelpView.vue'
import ProductsView from './views/ProductsView.vue'
import NotFoundView from './views/NotFoundView.vue'

import AdminLogin from './views/admin/AdminLogin.vue'
import AdminLayout from './views/admin/AdminLayout.vue'
import SwiperManage from './views/admin/SwiperManage.vue'
import BrandStoryManage from './views/admin/BrandStoryManage.vue'
import ProductsManage from './views/admin/ProductsManage.vue'
import ChannelsManage from './views/admin/ChannelsManage.vue'
import HelpManage from './views/admin/HelpManage.vue'

import './styles.css'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/home/activity', name: 'activity', component: ActivityView },
  { path: '/brandStory', name: 'brand-story', component: BrandStoryView },
  { path: '/brandStory/classify', name: 'classify', component: ClassifyView },
  { path: '/history', name: 'history', component: HistoryView },
  { path: '/counter', name: 'counter', component: CounterView },
  { path: '/products', name: 'products', component: ProductsView },
  { path: '/help', name: 'help', component: HelpView },
  { path: '/admin/login', name: 'admin-login', component: AdminLogin },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    redirect: '/admin/swiper',
    children: [
      { path: 'swiper', name: 'admin-swiper', component: SwiperManage },
      { path: 'brand-story', name: 'admin-brand-story', component: BrandStoryManage },
      { path: 'products', name: 'admin-products', component: ProductsManage },
      { path: 'channels', name: 'admin-channels', component: ChannelsManage },
      { path: 'help', name: 'admin-help', component: HelpManage },
    ],
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      next({ path: '/admin/login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

createApp(App).use(router).mount('#app')
