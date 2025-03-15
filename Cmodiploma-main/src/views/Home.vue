<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1>Система массового обслуживания</h1>
        <p class="subtitle">Современное моделирование очередей и каналов обслуживания</p>
        <div class="hero-buttons">
          <router-link to="/simulation" class="button primary">
            Запустить симуляцию
          </router-link>
          <router-link to="/statistics" class="button secondary">
            Просмотр статистики
          </router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-graphic">
          <div class="servers">
            <div class="server active"></div>
            <div class="server"></div>
            <div class="server active"></div>
          </div>
          <div class="connection-lines">
            <div class="line"></div>
            <div class="line"></div>
            <div class="line"></div>
          </div>
          <div class="clients">
            <div class="client"></div>
            <div class="client waiting"></div>
            <div class="client"></div>
            <div class="client waiting"></div>
            <div class="client"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="features-section">
      <h2 class="section-title">Функциональные возможности</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M18.36 5.64L5.64 18.36"/>
            </svg>
          </div>
          <h3>Гибкая настройка</h3>
          <p>Настраивайте количество каналов, интенсивность потока и другие параметры системы</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 14h8"/>
              <path d="M8 10h8"/>
              <path d="M8 6h5"/>
            </svg>
          </div>
          <h3>Визуализация</h3>
          <p>Наблюдайте за работой системы и всеми процессами в реальном времени</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="19" x2="20" y2="19"/>
              <polyline points="4 15 8 9 12 11 16 6 20 10"/>
            </svg>
          </div>
          <h3>Аналитика</h3>
          <p>Получайте подробную статистику и графики для анализа эффективности</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3>Интерактивные графики</h3>
          <p>Исследуйте данные с помощью современных интерактивных графиков ApexCharts</p>
        </div>
      </div>
    </div>
    
    <div class="how-it-works">
      <h2 class="section-title">Как это работает</h2>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Настройка параметров</h3>
            <p>Выберите количество серверов, максимальную длину очереди и интенсивность входящего потока</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Запуск симуляции</h3>
            <p>Наблюдайте за работой системы в реальном времени с наглядной визуализацией</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Анализ результатов</h3>
            <p>Изучайте статистику и графики для оптимизации работы системы</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cta-section">
      <h2>Готовы начать?</h2>
      <p>Исследуйте возможности системы массового обслуживания прямо сейчас</p>
      <router-link to="/simulation" class="button primary large">
        Запустить симуляцию
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
  display: flex;
  align-items: center;
  margin-bottom: 80px;
  gap: 40px;
  min-height: 60vh;
}

.hero-content {
  flex: 1;
}

.hero-image {
  flex: 1;
  position: relative;
}

h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
  background: linear-gradient(135deg, var(--primary-color) 0%, #a8edea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.3rem;
  color: var(--secondary-text);
  margin-bottom: 40px;
  line-height: 1.5;
}

.hero-buttons {
  display: flex;
  gap: 20px;
}

.button {
  padding: 15px 30px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.button.large {
  padding: 20px 40px;
  font-size: 1.2rem;
}

.primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, #35a873 100%);
  color: white;
}

.primary:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.secondary {
  background: linear-gradient(135deg, #384e6a 0%, #2c3e50 100%);
  color: white;
}

.secondary:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.hero-graphic {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: relative;
  padding: 40px;
  border-radius: 20px;
  background: linear-gradient(145deg, #181c26, #1d222d);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

.servers {
  display: flex;
  justify-content: space-around;
}

.server {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(145deg, #181c26, #1d222d);
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2), -5px -5px 10px rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.server.active::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color);
  box-shadow: 0 0 15px var(--primary-color);
  animation: pulse 2s infinite;
}

.connection-lines {
  display: flex;
  justify-content: space-around;
}

.line {
  width: 2px;
  height: 30px;
  background: linear-gradient(to bottom, var(--primary-color), transparent);
}

.clients {
  display: flex;
  justify-content: space-around;
  gap: 10px;
}

.client {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #384e6a;
  box-shadow: 0 0 10px rgba(56, 78, 106, 0.5);
}

.client.waiting {
  background: var(--primary-color);
  box-shadow: 0 0 15px var(--primary-color);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 5px currentColor;
  }
  50% {
    box-shadow: 0 0 20px currentColor;
  }
  100% {
    box-shadow: 0 0 5px currentColor;
  }
}

.section-title {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 60px;
  position: relative;
  padding-bottom: 15px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 2px;
}

.features-section {
  margin-bottom: 80px;
  padding: 60px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  padding: 40px 30px;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, var(--primary-color), transparent);
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-card:hover::before {
  transform: translateX(0);
}

.feature-icon {
  color: var(--primary-color);
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--text-color);
}

.feature-card p {
  color: var(--secondary-text);
  line-height: 1.6;
}

.how-it-works {
  margin-bottom: 80px;
  padding: 60px 0;
  background: var(--bg-color);
  border-radius: 30px;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.05);
}

.steps {
  max-width: 800px;
  margin: 0 auto;
}

.step {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
  position: relative;
}

.step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 25px;
  top: 60px;
  bottom: -20px;
  width: 2px;
  background: linear-gradient(to bottom, var(--primary-color), transparent);
}

.step-number {
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(53, 168, 115, 0.4);
}

.step-content {
  flex: 1;
}

.step-content h3 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: var(--text-color);
}

.step-content p {
  color: var(--secondary-text);
  line-height: 1.6;
}

.cta-section {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, rgba(66, 185, 131, 0.1) 0%, rgba(41, 50, 60, 0.1) 100%);
  border-radius: 20px;
  margin-bottom: 40px;
}

.cta-section h2 {
  font-size: 2.4rem;
  margin-bottom: 20px;
  color: var(--text-color);
}

.cta-section p {
  font-size: 1.2rem;
  color: var(--secondary-text);
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  .subtitle {
    font-size: 1.1rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .step {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
  }
  
  .step:not(:last-child)::after {
    display: none;
  }
}

@media (max-width: 600px) {
  h1 {
    font-size: 2rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .button {
    width: 100%;
  }
  
  .feature-card {
    padding: 30px 20px;
  }
}
</style>