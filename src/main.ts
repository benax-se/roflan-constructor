import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import PrimeVue from 'primevue/config';
import Ripple from 'primevue/ripple';
import VueKonva from 'vue-konva';
import ToastService from 'primevue/toastservice';


import './assets/styles/main.scss'
import 'primevue/resources/themes/tailwind-light/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(i18n)
app.use(PrimeVue, { ripple: true })
app.use(ToastService)
app.use(VueKonva)

app.directive('ripple', Ripple);

app.mount('#app')
