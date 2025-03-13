<template>
  <div class="home">
    <div class="hero">
      <h1>Система массового обслуживания</h1>
      <p class="subtitle">Современное моделирование очередей и каналов обслуживания</p>
    </div>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🔄</div>
        <h3>Гибкая настройка</h3>
        <p>Настраивайте количество каналов, интенсивность потока и другие параметры системы</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Визуализация</h3>
        <p>Наблюдайте за работой системы и всеми процессами в реальном времени</p>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon">📈</div>
        <h3>Аналитика</h3>
        <p>Получайте подробную статистику и графики для анализа эффективности</p>
      </div>
    </div>
    
    <div class="cta-container">
      <router-link to="/simulation" class="button primary">
        Запустить симуляцию
      </router-link>
      <router-link to="/statistics" class="button secondary">
        Просмотр статистики
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  color: #2c3e50;
}

.subtitle {
  font-size: 1.2rem;
  color: #505a68;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.feature-card p {
  color: #505a68;
  line-height: 1.6;
}

.cta-container {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.button {
  padding: 15px 30px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
}

.primary {
  background: linear-gradient(135deg, #42b983 0%, #35a873 100%);
  color: white;
}

.primary:hover {
  background: linear-gradient(135deg, #35a873 0%, #2d8f62 100%);
}

.secondary {
  background: linear-gradient(135deg, #384e6a 0%, #2c3e50 100%);
  color: white;
}

.secondary:hover {
  background: linear-gradient(135deg, #2c3e50 0%, #1e2a36 100%);
}

@media (max-width: 768px) {
  .hero {
    padding: 30px 15px;
    margin-bottom: 40px;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .cta-container {
    flex-direction: column;
  }
  
  .button {
    width: 100%;
    text-align: center;
  }
}
</style>