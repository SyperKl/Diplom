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
                <svg v-if="status" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 9l4-4 4 4"/>
                  <path d="M16 15l-4 4-4-4"/>
                  <rect x="2" y="3" width="20" height="18" rx="2"/>
                  <line x1="12" y1="12" x2="12" y2="12" class="server-pulse"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
          
          <!-- Показываем сообщение, если нет серверов -->
          <div v-if="serverStatus.length === 0" class="no-servers">
            Настройте количество серверов и запустите симуляцию
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
          <div v-for="(client, index) in queue" 
               :key="index" 
               :class="['client', { 'high-priority': client.priority === 'high', 'medium-priority': client.priority === 'medium', 'low-priority': client.priority === 'low' }]">
            <div class="client-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="7" r="4"/>
                <path d="M5 21v-2a7 7 0 0 1 14 0v2"/>
              </svg>
            </div>
            <div class="client-position">#{{ index + 1 }}</div>
            <div v-if="client.priority" class="client-priority">
              {{ getPriorityLabel(client.priority) }}
            </div>
          </div>
          <div v-if="queue.length === 0" class="empty-queue">
            Очередь пуста
          </div>
        </div>
      </div>
    </div>

    <div class="simulation-stats">
      <h3>Статистика симуляции</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.totalCustomers }}</div>
            <div class="stat-label">Всего клиентов</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.servedCustomers }}</div>
            <div class="stat-label">Обслужено</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <div class="stat-value">{{ statistics.rejectedCustomers }}</div>
            <div class="stat-label">Отказов</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-value">{{ formatTime(statistics.averageWaitTime) }}</div>
            <div class="stat-label">Среднее время ожидания</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ (statistics.serverUtilization * 100).toFixed(1) }}%</div>
            <div class="stat-label">Загрузка серверов</div>
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
    const store = useQueueStore();
    const { queue, serverStatus, maxQueueLength, statistics } = storeToRefs(store);

    // Форматирование времени ожидания
    const formatTime = (milliseconds) => {
      if (!milliseconds) return '0.00 сек';
      
      if (milliseconds < 1000) {
        return `${milliseconds.toFixed(0)} мс`;
      } else {
        return `${(milliseconds / 1000).toFixed(2)} сек`;
      }
    };
    
    // Получение метки для приоритета
    const getPriorityLabel = (priority) => {
      switch(priority) {
        case 'high':
          return 'Высокий';
        case 'medium':
          return 'Средний';
        case 'low':
          return 'Низкий';
        default:
          return '';
      }
    };

    return {
      queue,
      serverStatus,
      maxQueueLength,
      statistics,
      formatTime,
      getPriorityLabel
    };
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

.servers-visualization h3,
.queue-visualization h3 {
  margin-bottom: 20px;
  font-size: 1.25rem;
  color: var(--text-color);
}

.servers-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.server-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background: var(--server-card-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.server-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px var(--shadow-color);
}

.server-icon {
  margin-right: 15px;
}

.server-icon-inner svg {
  display: block;
}

.server-info {
  flex-grow: 1;
}

.server-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
}

.server-status {
  font-size: 0.875rem;
  color: var(--text-secondary-color);
}

.server-status.busy {
  color: var(--error-color);
}

.server-status.idle {
  color: var(--success-color);
}

.no-servers {
  text-align: center;
  color: var(--text-secondary-color);
  font-size: 0.875rem;
  padding: 20px;
}

/* Queue Visualization */
.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.queue-counter {
  font-size: 0.875rem;
  color: var(--text-secondary-color);
}

.queue-progress {
  height: 10px;
  background: var(--progress-bg);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 20px;
}

.queue-progress-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.3s ease;
}

.queue-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.client {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: var(--client-card-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.client:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px var(--shadow-color);
}

.client-icon {
  margin-right: 10px;
}

.client-icon svg {
  display: block;
}

.client-position {
  font-size: 0.875rem;
  color: var(--text-secondary-color);
  margin-right: auto;
}

.client-priority {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  background: var(--priority-bg);
  color: var(--priority-text-color);
}

.high-priority {
  --priority-bg: var(--error-color);
  --priority-text-color: white;
}

.medium-priority {
  --priority-bg: var(--warning-color);
  --priority-text-color: white;
}

.low-priority {
  --priority-bg: var(--success-color);
  --priority-text-color: white;
}

.empty-queue {
  text-align: center;
  color: var(--text-secondary-color);
  font-size: 0.875rem;
  padding: 20px;
}

/* Simulation Stats */
.simulation-stats {
  margin-top: 40px;
}

.simulation-stats h3 {
  margin-bottom: 20px;
  font-size: 1.25rem;
  color: var(--text-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background: var(--card-bg);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px var(--shadow-color);
}

.stat-icon {
  font-size: 1.5rem;
  margin-right: 15px;
}

.stat-content {
  flex-grow: 1;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-color);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary-color);
}

/* Charts Section */
.charts-section {
  margin-top: 40px;
}
</style>
