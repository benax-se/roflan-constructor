import { createRouter, createWebHistory } from 'vue-router'
import BackgroundPage from '@/views/BackgroundPage.vue'
import EyesPage from '@/views/EyesPage.vue'
import MouthPage from '@/views/MouthPage.vue'
import AccessoriesPage from '@/views/AccessoriesPage.vue'
import ColorPage from '@/views/ColorPage.vue'
import SettingsPage from '@/views/SettingsPage.vue'

const routes = [
    { path: '/', component: EyesPage },
    { path: '/mouth', component: MouthPage },
    { path: '/background', component: BackgroundPage },
    { path: '/accessories', component: AccessoriesPage },
    { path: '/color', component: ColorPage },
    { path: '/settings', component: SettingsPage },
]

const router = createRouter({
    history: createWebHistory('/roflan-constructor/'),
    routes,
})

export default router
