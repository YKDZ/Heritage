import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import { createPinia } from 'pinia'
import 'vditor/dist/index.css'
import { createApp } from 'vue'
import App from './App.vue'
import { useUserStore } from './api/store/user'
import Footer from './components/footer/Footer.vue'
import Header from './components/header/Header.vue'
import './index.css'
import router from './router/router'
import { register } from 'swiper/element/bundle';

const pinia = createPinia()

// Font Awesome Icon
library.add(fas, far, fab)

// Swiper
register()

const app = createApp(App)
  .use(pinia)

const initAuthStore = async () => {
  const userStore = useUserStore()
  await userStore.initializeAuth()
}

app.use(router)
  .use(FloatingVue)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('Header', Header)
  .component('Footer', Footer)
  .mount('#app')