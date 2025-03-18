import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import Notifications from './components/Notifications.vue'
import './assets/custom.css'

const app = createApp(App)

// Регистрация глобальных компонентов
app.component('Notifications', Notifications)

app.use(createPinia())
app.use(VueApexCharts)
app.use(router)

// Глобальная обработка ошибок
app.config.errorHandler = (err, vm, info) => {
  console.error(`Error: ${err.toString()}\nInfo: ${info}`);
  // Импортируем сервис уведомлений здесь, чтобы избежать циклических зависимостей
  const notificationService = import('./services/notifications').then(module => {
    const service = module.default;
    service.error(`Произошла ошибка: ${err.message}`);
  });
};

app.mount('#app')