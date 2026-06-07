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
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

createApp(App).use(router).mount('#app')
