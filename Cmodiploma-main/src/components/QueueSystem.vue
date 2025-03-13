<template>
  <div class="queue-system">
    <UI />
    
    <div class="visualization">
      <!-- Визуализация серверов -->
      <div class="servers-visualization">
        <h3>Каналы обслуживания</h3>
        <div class="servers-container">
          <div v-for="(status, index) in serverStatus" 
               :key="index"
               :class="['server-card', { 'is-busy': status }]">
            <div class="server-icon">
              <div class="server-icon-inner">
                <svg v-if="status" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none">
                  <path d="M8 9l4-4 4 4"/>
                  <path d="M16 15l-4 4-4-4"/>
                  <rect x="2" y="3" width="20" height="18" rx="2"/>
                  <line x1="12" y1="12" x2="12" y2="12" class="server-pulse"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none">
                  <rect x="2" y="3" width="20" height="18" rx="2"/>
                  <line x1="8" y1="10" x2="16" y2="10"/>
                  <line x1="8" y1="14" x2="16" y2="14"/>
                </svg>
              </div>
            </div>
            <div class="server-info">
              <div class="server-name">Сервер {{ index + 1 }}</div>
              <div :class="['server-status', status ? 'busy' : 'idle']">
                {{ status ? 'Обработка запроса' : 'Ожидание' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Визуализация очереди -->
      <div class="queue-visualization">
        <div class="queue-header">
          <h3>Очередь запросов</h3>
          <div class="queue-counter">{{ queue.length }} / {{ maxQueueLength }}</div>
        </div>
        
        <div class="queue-progress">
          <div class="queue-progress-bar" :style="{ width: `${(queue.length / maxQueueLength) * 100}%` }"></div>
        </div>
        
        <div class="queue-container">
          <div v-for="(_, index) in queue" 
               :key="index" 
               class="client">
            <div class="client-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                <circle cx="12" cy="7" r="4"/>
                <path d="M5 21v-2a7 7 0 0 1 14 0v2"/>
              </svg>
            </div>
            <div class="client-position">#{{ index + 1 }}</div>
          </div>
          <div v-if="queue.length === 0" class="empty-queue">
            Очередь пуста
          </div>
        </div>
      </div>
    </div>

    <Charts class="charts-section" />
  </div>
</template>

<script>
import { useQueueStore } from '../stores/queue'
import { storeToRefs } from 'pinia'
import Charts from './Charts.vue'
import UI from './UI.vue'

export default {
  name: 'QueueSystem',
  
  components: {
    Charts,
    UI
  },

  setup() {
    const store = useQueueStore()
    const { queue, serverStatus, maxQueueLength } = storeToRefs(store)

    return {
      queue,
      serverStatus,
      maxQueueLength
    }
  }
}
</script>

<style scoped>
.queue-system {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.visualization {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 40px 0;
}

/* Servers Visualization */
.servers-visualization, 
.queue-visualization {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px var(--shadow-color);
}

.servers-visualization h3,
.queue-visualization h3 {
  margin-bottom: 20px;
  color: var(--text-color);
  font-size: 1.2rem;
}

.servers-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.server-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  background: linear-gradient(145deg, var(--bg-color), var(--card-bg));
  box-shadow: 0 3px 10px var(--shadow-color);
  transition: all 0.3s;
}

.server-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px var(--shadow-hover);
}

.server-card.is-busy {
  border-left: 4px solid var(--primary-color);
}

.server-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bg-color);
  margin-right: 15px;
}

.server-icon-inner {
  color: var(--secondary-text);
  transition: color 0.3s;
}

.is-busy .server-icon-inner {
  color: var(--primary-color);
}

.server-pulse {
  stroke-width: 4;
  stroke-linecap: round;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 1, 150; stroke-dashoffset: -140; }
}

.server-info {
  flex: 1;
}

.server-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 5px;
}

.server-status {
  font-size: 0.85rem;
  transition: color 0.3s;
}

.server-status.idle {
  color: var(--secondary-text);
}

.server-status.busy {
  color: var(--primary-color);
  font-weight: 500;
}

/* Queue Visualization */
.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.queue-counter {
  background: var(--bg-color);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--secondary-text);
}

.queue-progress {
  height: 6px;
  width: 100%;
  background: var(--bg-color);
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
}

.queue-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-hover));
  border-radius: 3px;
  transition: width 0.3s ease;
}

.queue-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  min-height: 100px;
}

.client {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 6px var(--shadow-color);
  transition: all 0.3s;
  animation: fadeIn 0.4s ease;
}

.client:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 12px var(--shadow-hover);
}

.client-icon {
  margin-bottom: 8px;
  color: var(--secondary-text);
}

.client-position {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-color);
}

.empty-queue {
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px;
  color: var(--secondary-text);
  font-style: italic;
}

.charts-section {
  margin-top: 40px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 900px) {
  .visualization {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .servers-container {
    grid-template-columns: 1fr;
  }
}
</style>