<template>
  <div :class="['app-container', { 'dark-mode': isDarkMode }]">
    <nav class="main-nav">
      <div class="nav-container">
        <div class="logo">
          <img src="@/assets/logo.svg" alt="Logo" class="logo-img" />
          <span>QueueSim</span>
        </div>
        
        <div class="nav-links">
          <router-link to="/">Главная</router-link>
          <router-link to="/simulation">Симуляция</router-link>
          <router-link to="/statistics">Статистика</router-link>
        </div>
        
        <button @click="toggleDarkMode" class="theme-toggle">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <footer class="main-footer">
      <p>Система моделирования СМО © {{ currentYear }}</p>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'App',
  setup() {
    const isDarkMode = ref(false);
    const currentYear = computed(() => new Date().getFullYear());
    
    const toggleDarkMode = () => {
      isDarkMode.value = !isDarkMode.value;
      localStorage.setItem('darkMode', isDarkMode.value);
      document.documentElement.classList.toggle('dark-theme', isDarkMode.value);
    };
    
    onMounted(() => {
      // Check for saved preference
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        isDarkMode.value = savedMode === 'true';
        document.documentElement.classList.toggle('dark-theme', isDarkMode.value);
      } else {
        // Check for system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDarkMode.value = prefersDark;
        document.documentElement.classList.toggle('dark-theme', prefersDark);
      }
    });
    
    return {
      isDarkMode,
      toggleDarkMode,
      currentYear
    };
  }
}
</script>

<style>
/* Base Styles */
:root {
  --primary-color: #42b983;
  --primary-hover: #35a873;
  --text-color: #2c3e50;
  --secondary-text: #505a68;
  --bg-color: #f9f9f9;
  --card-bg: #ffffff;
  --nav-bg: #ffffff;
  --border-color: #eaeaea;
  --shadow-color: rgba(0, 0, 0, 0.08);
  --shadow-hover: rgba(0, 0, 0, 0.15);
}

.dark-theme {
  --primary-color: #42d392;
  --primary-hover: #4edfA1;
  --text-color: #e2e8f0;
  --secondary-text: #a0aec0;
  --bg-color: #1a202c;
  --card-bg: #2d3748;
  --nav-bg: #2d3748;
  --border-color: #4a5568;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --shadow-hover: rgba(0, 0, 0, 0.4);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  line-height: 1.6;
  transition: background-color 0.3s, color 0.3s;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  color: var(--text-color);
}

/* Navigation */
.main-nav {
  background-color: var(--nav-bg);
  box-shadow: 0 2px 10px var(--shadow-color);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
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
  font-size: 1.3rem;
}

.logo-img {
  height: 28px;
}

.nav-links {
  display: flex;
  gap: 25px;
}

.nav-links a {
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  padding: 5px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-links a:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--primary-color);
}

.nav-links a:hover:after,
.nav-links a.router-link-active:after {
  width: 100%;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.theme-toggle:hover {
  background-color: var(--border-color);
}

/* Main content */
.main-content {
  flex: 1;
  padding: 20px;
}

/* Footer */
.main-footer {
  text-align: center;
  padding: 20px;
  background-color: var(--nav-bg);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  color: var(--secondary-text);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-between;
  }
  
  .theme-toggle {
    position: absolute;
    top: 15px;
    right: 20px;
  }
}
</style>