<template>
  <div class="ui-controls">
    <div class="control-panel">
      <div class="panel-header">
        <h2>Управление системой</h2>
        <div class="simulation-status" :class="{ active: isRunning }">
          {{ isRunning ? 'Симуляция запущена' : 'Симуляция остановлена' }}
        </div>
      </div>
      
      <div class="controls-grid">
        <div class="control-card">
          <div class="control-icon">🖥️</div>
          <div class="control-label">Количество серверов</div>
          <div class="control-input">
            <div class="number-input">
              <button @click="decrementServers" :disabled="isRunning || servers <= 1" class="input-button">-</button>
              <input type="number" v-model.number="servers" min="1" max="5" :disabled="isRunning" />
              <button @click="incrementServers" :disabled="isRunning || servers >= 5" class="input-button">+</button>
            </div>
          </div>
        </div>

        <div class="control-card">
          <div class="control-icon">⏱️</div>
          <div class="control-label">Интенсивность прихода (λ)</div>
          <div class="control-input">
            <div class="slider-container">
              <input type="range" v-model.number="arrivalRate" min="0.1" max="1" step="0.1" class="slider" />
            </div>
            <div class="slider-value">{{ (arrivalRate * 100).toFixed(0) }}%</div>
          </div>
        </div>

        <div class="control-card">
          <div class="control-icon">📋</div>
          <div class="control-label">Макс. длина очереди</div>
          <div class="control-input">
            <div class="number-input">
              <button @click="decrementQueueLength" :disabled="isRunning || maxQueueLength <= 1" class="input-button">-</button>
              <input type="number" v-model.number="maxQueueLength" min="1" max="20" :disabled="isRunning" />
              <button @click="incrementQueueLength" :disabled="isRunning || maxQueueLength >= 20" class="input-button">+</button>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="toggleSimulation" :class="['action-button', { 'is-running': isRunning }]">
          <span class="button-icon">{{ isRunning ? '⏹️' : '▶️' }}</span>
          <span>{{ isRunning ? 'Остановить' : 'Запустить' }}</span>
        </button>

        <button @click="resetSimulation" class="action-button reset-btn" :disabled="isRunning">
          <span class="button-icon">🔄</span>
          <span>Сбросить</span>
        </button>
        
        <button @click="saveSimulation" class="action-button save-btn" :disabled="!statistics.totalCustomers || isRunning">
          <span class="button-icon">💾</span>
          <span>Сохранить</span>
        </button>
      </div>
    </div>

    <div class="statistics-panel">
      <div class="stat-card">
        <div class="stat-header">
          <h3>Общая статистика</h3>
          <div class="stat-indicator" :style="getProcessedPercentageStyle">
            {{ getProcessedPercentage }}%
          </div>
        </div>
        
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-icon total">👥</div>
            <div class="stat-info">
              <div class="stat-label">Всего клиентов</div>
              <div class="stat-value">{{ statistics.totalCustomers }}</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon served">✅</div>
            <div class="stat-info">
              <div class="stat-label">Обслужено</div>
              <div class="stat-value">{{ statistics.servedCustomers }}</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon rejected">❌</div>
            <div class="stat-info">
              <div class="stat-label">Отказов</div>
              <div class="stat-value">{{ statistics.rejectedCustomers }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <h3>Эффективность системы</h3>
          <div class="stat-indicator" :style="getUtilizationStyle">
            {{ getServerUtilization }}%
          </div>
        </div>
        
        <div class="stat-grid">
          <div class="stat-item">
            <div class="stat-icon load">📊</div>
            <div class="stat-info">
              <div class="stat-label">Загрузка серверов</div>
              <div class="stat-value">{{ getServerUtilization }}%</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon time">⏳</div>
            <div class="stat-info">
              <div class="stat-label">Среднее время ожидания</div>
              <div class="stat-value">{{ getAverageWaitTime }}</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon queue">📝</div>
            <div class="stat-info">
              <div class="stat-label">Длина очереди</div>
              <div class="stat-value">{{ statistics.queueLength }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useQueueStore } from '../stores/queue'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, computed } from 'vue'

export default {
  name: 'UIControls',

  setup() {
    const store = useQueueStore()
    const simulationInterval = ref(null);

    const { servers, maxQueueLength, arrivalRate, isRunning, statistics } = storeToRefs(store)

    // Increment/decrement helpers
    const incrementServers = () => {
      if (servers.value < 5) servers.value++;
    }
    
    const decrementServers = () => {
      if (servers.value > 1) servers.value--;
    }
    
    const incrementQueueLength = () => {
      if (maxQueueLength.value < 20) maxQueueLength.value++;
    }
    
    const decrementQueueLength = () => {
      if (maxQueueLength.value > 1) maxQueueLength.value--;
    }

    // Computed properties for statistics display
    const getProcessedPercentage = computed(() => {
      if (statistics.value.totalCustomers === 0) return "0";
      const percentage = (statistics.value.servedCustomers / statistics.value.totalCustomers) * 100;
      return percentage.toFixed(1);
    });
    
    const getProcessedPercentageStyle = computed(() => {
      const percentage = getProcessedPercentage.value;
      let color = '#42b983'; // Default green
      
      if (percentage < 70) color = '#ff7675'; // Red for low processing
      else if (percentage < 85) color = '#fdcb6e'; // Yellow for medium
      
      return {
        background: color
      };
    });
    
    const getServerUtilization = computed(() => {
      return (statistics.value.serverUtilization * 100).toFixed(1);
    });
    
    const getUtilizationStyle = computed(() => {
      const utilization = parseFloat(getServerUtilization.value);
      let color = '#fdcb6e'; // Yellow for medium utilization
      
      if (utilization < 30) color = '#ff7675'; // Red for low utilization
      else if (utilization > 75) color = '#42b983'; // Green for high utilization
      
      return {
        background: color
      };
    });
    
    const getAverageWaitTime = computed(() => {
      const seconds = statistics.value.averageWaitTime / 1000;
      
      if (seconds < 60) {
        return `${seconds.toFixed(2)} сек`;
      } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}м ${remainingSeconds.toFixed(0)}с`;
      }
    });

    const saveSimulation = async () => {
      try {
        const simulationData = {
          parameters: {
            servers: servers.value,
            maxQueueLength: maxQueueLength.value,
            arrivalRate: arrivalRate.value,
            serviceRate: store.serviceRate,
          },
          statistics: {
            totalCustomers: statistics.value.totalCustomers,
            servedCustomers: statistics.value.servedCustomers,
            rejectedCustomers: statistics.value.rejectedCustomers,
            averageWaitTime: statistics.value.averageWaitTime,
            serverUtilization: statistics.value.serverUtilization,
          },
        }

        const response = await fetch('http://localhost:3000/api/simulations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(simulationData),
        })

        const data = await response.json()
        console.log('Simulation saved:', data)
        
        // Show notification
        alert('Результаты симуляции успешно сохранены');
      } catch (error) {
        console.error('Error saving simulation:', error)
        alert('Ошибка при сохранении результатов. Проверьте работу сервера.');
      }
    }

    onMounted(() => {
      store.initialize()
    })

    const toggleSimulation = () => {
      // Просто вызываем метод переключения в сторе
      store.toggleSimulation()
    }

    const resetSimulation = () => {
      store.initialize()
    }

    onUnmounted(() => {
      // Останавливаем все интервалы при размонтировании компонента
      if (simulationInterval.value) {
        clearInterval(simulationInterval.value);
        simulationInterval.value = null;
      }
      store.stopChartUpdates();
    })

    return {
      // State
      servers,
      maxQueueLength,
      arrivalRate,
      isRunning,
      statistics,
      
      // Methods
      toggleSimulation,
      resetSimulation,
      saveSimulation,
      incrementServers,
      decrementServers,
      incrementQueueLength,
      decrementQueueLength,
      
      // Computed
      getProcessedPercentage,
      getProcessedPercentageStyle,
      getServerUtilization,
      getUtilizationStyle,
      getAverageWaitTime
    }
  },
}
</script>
<style scoped>
.ui-controls {
  max-width: 1200px;
  margin: 0 auto;
}

.control-panel {
  background: var(--card-bg);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--shadow-color);
  margin-bottom: 30px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

h2, h3 {
  color: var(--text-color);
  font-weight: 600;
}

.simulation-status {
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 500;
  background: #f0f0f0;
  color: #666;
  transition: all 0.3s;
}

.simulation-status.active {
  background: var(--primary-color);
  color: white;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.control-card {
  padding: 20px;
  background: var(--bg-color);
  border-radius: 10px;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s;
}

.control-card:hover {
  box-shadow: 0 4px 12px var(--shadow-hover);
}

.control-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.control-label {
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 15px;
}

.control-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.number-input {
  display: flex;
  align-items: center;
  max-width: 180px;
}

.number-input input {
  flex: 1;
  padding: 8px 10px;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-bg);
  color: var(--text-color);
  margin: 0 5px;
}

.input-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s;
}

.input-button:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
}

.input-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-container {
  width: 100%;
  padding: 5px 0;
}

.slider {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  background: var(--bg-color);
  border-radius: 3px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.slider-value {
  text-align: center;
  margin-top: 10px;
  font-weight: 600;
  color: var(--text-color);
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 3px 8px var(--shadow-color);
}

.action-button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px var(--shadow-hover);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-icon {
  font-size: 1.2rem;
}

.action-button:not(.reset-btn):not(.save-btn) {
  background: var(--primary-color);
  color: white;
}

.action-button.is-running {
  background: #ff7675;
}

.reset-btn {
  background: #2c3e50;
  color: white;
}

.save-btn {
  background: #3498db;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #2980b9;
}

/* Statistics Panel */
.statistics-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
}

.stat-card {
  background: var(--card-bg);
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--shadow-color);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.stat-indicator {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  background: #42b983;
}

.stat-grid {
  display: grid;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--bg-color);
  border-radius: 10px;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 12px var(--shadow-hover);
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.stat-icon.total {
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
}

.stat-icon.served {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.stat-icon.rejected {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.stat-icon.load {
  background: rgba(155, 89, 182, 0.15);
  color: #9b59b6;
}

.stat-icon.time {
  background: rgba(241, 196, 15, 0.15);
  color: #f1c40f;
}

.stat-icon.queue {
  background: rgba(52, 73, 94, 0.15);
  color: #34495e;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--secondary-text);
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

@media (max-width: 768px) {
  .controls-grid,
  .statistics-panel {
    grid-template-columns: 1fr;
  }
  
  .panel-header,
  .stat-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>