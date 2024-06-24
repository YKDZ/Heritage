import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../api/store/user'
import AboutView from '../components/view/AboutView.vue'
import HomeView from '../components/view/HomeView.vue'
import LoginView from '../components/view/LoginView.vue'
import PostCreateView from '../components/view/PostCreateView.vue'
import PostEditView from '../components/view/PostEditView.vue'
import ProfileView from '../components/view/ProfileView.vue'
import RegisterView from '../components/view/RegisterView.vue'

const routes = [
    { path: '/', name: "HomeView", component: HomeView },
    { path: '/about', name: "AboutView", component: AboutView },
    { path: '/posts/:id', name: "PostView", component: () => import('../components/view/PostView.vue') },
    { path: '/posts/create', name: "PostCreateView", component: PostCreateView, meta: { requiresAuth: true } },
    { path: '/posts/edit/:id', name: "PostEditView", component: PostEditView, meta: { requiresAuth: true } },
    { path: '/login', name: "LoginView", component: LoginView },
    { path: '/register', name: "RegisterView", component: RegisterView },
    { path: '/profile/:id', name: "ProfileView", component: ProfileView, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const auth = useUserStore()
        if (!auth.isAuthenticated) {
            return next({ path: '/login', query: { redirect: to.fullPath } })
        } else {
            return next()
        }
    }
    if (to.name == 'LoginView') {
        const auth = useUserStore()
        if (auth.isAuthenticated) {
            return next({ path: '/' })
        }
    }
    next()
})

export default router