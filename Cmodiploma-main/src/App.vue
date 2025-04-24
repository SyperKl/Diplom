<template>
  <div :class="['app-container', { 'dark-mode': isDarkMode }]">
    <!-- Добавляем компонент уведомлений -->
    <Notifications />

    <nav class="main-nav">
      <div class="nav-container">
        <div class="logo">
          <span>СМО</span>
        </div>

        <div class="nav-links">
          <router-link to="/" class="nav-link">
            <span class="link-icon">🏠</span>
            <span class="link-text">Главная</span>
          </router-link>
          <router-link to="/simulation" class="nav-link">
            <span class="link-icon">⚙️</span>
            <span class="link-text">Симуляция</span>
          </router-link>
          <router-link to="/statistics" class="nav-link">
            <span class="link-icon">📊</span>
            <span class="link-text">Статистика</span>
          </router-link>
        </div>
        <div class="auth-buttons">
          <template v-if="isAuthenticated">
            <span class="welcome-text">Привет, {{ username || 'пользователь' }}!</span>
            <button @click="logout" class="auth-button logout-btn">Выйти</button>
          </template>
          <template v-else>
            <router-link to="/login" class="auth-button login-btn">Войти</router-link>
            <router-link to="/register" class="auth-button register-btn">Регистрация</router-link>
          </template>
        </div>

        <button @click="toggleDarkMode" class="theme-toggle" :title="isDarkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'">
          <span class="mode-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
        </button>
      </div>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="main-footer">
      <div class="footer-content">
        <div class="footer-logo">
          <img src="@/assets/lightning_mcqueen_angry_by_jtpa2k6_dher6x8-pre.png" alt="Logo" class="footer-logo-img" />
          <span>Система массового обслуживания</span>
        </div>

        <div class="footer-links">
          <router-link to="/">Главная</router-link>
          <router-link to="/simulation">Симуляция</router-link>
          <router-link to="/statistics">Статистика</router-link>
        </div>

        <div class="footer-info">
          <p>Система моделирования СМО © {{ currentYear }}</p>
          <p class="version">Версия 1.1.0</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EVENTS } from '@/constants'
import eventBus from '@/utils/eventBus'
import notificationService from '@/services/notifications'

export default {
  name: 'App',
  setup() {
    const isDarkMode = ref(false);
    const currentYear = computed(() => new Date().getFullYear());
    const isAuthenticated = ref(false);
    const username = ref('');
    const router = useRouter();

    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedUsername = localStorage.getItem('username');
      console.log('Проверка аутентификации, токен:', token ? 'присутствует' : 'отсутствует');

      if (token) {
        isAuthenticated.value = true;
        username.value = savedUsername || '';
        return true;
      }

      isAuthenticated.value = false;
      username.value = '';
      return false;
    };

    // Функция выхода
    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      isAuthenticated.value = false;
      username.value = '';
      router.push('/login');
      notificationService.info('Вы вышли из системы');
    };

    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('darkMode', isDarkMode.value);
      document.documentElement.classList.toggle('dark-theme', isDarkMode.value);
    };

    const setupEventListeners = () => {
      eventBus.on(EVENTS.SIMULATION_STARTED, () => {
        notificationService.info('Симуляция запущена');
      });

      eventBus.on(EVENTS.SIMULATION_STOPPED, () => {
        notificationService.info('Симуляция остановлена');
      });

      eventBus.on(EVENTS.CUSTOMER_REJECTED, () => {
        notificationService.warning('Клиент отклонен: очередь заполнена', 3000);
      });
    };

    onMounted(() => {
      const token = localStorage.getItem('token');
  const currentPath = window.location.pathname;

  if (!token && currentPath !== '/login' && currentPath !== '/register') {
    router.push('/login');
  }
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        isDarkMode.value = savedMode === 'true';
        document.documentElement.classList.toggle('dark-theme', isDarkMode.value);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDarkMode.value = prefersDark;
        document.documentElement.classList.toggle('dark-theme', prefersDark);
      }

      setupEventListeners();
      checkAuth();
      notificationService.success('Приложение успешно загружено');
    });

    return {
      isDarkMode,
      toggleDarkMode,
      currentYear,
      isAuthenticated,
      username,
      logout,
      checkAuth
    };
  }
}
</script>

<style>
/* Base Styles */
:root {
  --primary-color: #42b983;
  --primary-hover: #35a873;
  --secondary-color: #3490dc;
  --accent-color: #9561e2;
  --text-color: #2c3e50;
  --secondary-text: #505a68;
  --bg-color: #f9f9f9;
  --card-bg: #ffffff;
  --nav-bg: #ffffff;
  --border-color: #eaeaea;
  --shadow-color: rgba(0, 0, 0, 0.08);
  --shadow-hover: rgba(0, 0, 0, 0.15);

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 0.2s;
  --transition-normal: 0.3s;
  --transition-slow: 0.5s;

  /* Shadows */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.dark-theme {
  --primary-color: #42d392;
  --primary-hover: #4edfA1;
  --secondary-color: #41a7f5;
  --accent-color: #a855f7;
  --text-color: #e2e8f0;
  --secondary-text: #a0aec0;
  --bg-color: #1a202c;
  --card-bg: #2d3748;
  --nav-bg: #171c26;
  --border-color: #4a5568;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --shadow-hover: rgba(0, 0, 0, 0.4);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  transition: background-color var(--transition-normal), color var(--transition-normal);
  background-color: var(--bg-color);
  color: var(--text-color);
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation */
.main-nav {
  background-color: var(--nav-bg);
  box-shadow: 0 2px 10px var(--shadow-color);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: background-color var(--transition-normal), box-shadow var(--transition-normal);
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 1.4rem;
  transition: transform var(--transition-normal);
}

.logo:hover {
  transform: scale(1.05);
}

.logo-img {
  height: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.nav-links {
  display: flex;
  gap: 25px;
}

.nav-link {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 8px 15px;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.link-icon {
  font-size: 1.1rem;
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width var(--transition-normal), left var(--transition-normal);
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link:hover::before,
.nav-link.router-link-active::before {
  width: 70%;
  left: 15%;
}

.nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color var(--transition-normal), transform var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.theme-toggle:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: rotate(15deg);
}

.dark-mode .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Auth buttons */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  color: var(--text-color);
  font-weight: 500;
}

.auth-button {
  padding: 8px 15px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.login-btn {
  color: var(--primary-color);
  background-color: transparent;
  border: 1px solid var(--primary-color);
}

.login-btn:hover {
  background-color: rgba(66, 185, 131, 0.1);
  transform: translateY(-2px);
}

.register-btn {
  color: white;
  background-color: var(--primary-color);
  border: 1px solid var(--primary-color);
}

.register-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  color: white;
  background-color: #e74c3c;
  border: none;
}

.logout-btn:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
}

/* Main content */
.main-content {
  flex: 1;
  padding: 20px;
}

/* Footer */
.main-footer {
  padding: 40px 20px;
  background-color: var(--nav-bg);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  color: var(--secondary-text);
  transition: background-color var(--transition-normal), color var(--transition-normal);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
  font-size: 1.2rem;
  color: var(--text-color);
}

.footer-logo-img {
  height: 24px;
  opacity: 0.8;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: var(--secondary-text);
  text-decoration: none;
  transition: color var(--transition-normal);
}

.footer-links a:hover {
  color: var(--primary-color);
}

.footer-info {
  text-align: right;
}

.version {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 5px;
}

/* Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
    gap: 15px;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: space-around;
    margin-top: 15px;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-info {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .link-text {
    display: none;
  }

  .nav-link {
    padding: 10px;
  }

  .link-icon {
    font-size: 1.3rem;
  }

  .logo {
    font-size: 1.2rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
