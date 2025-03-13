<template>
  <div class="statistics-page">
    <div class="page-header">
      <h1>Статистика СМО</h1>
      <p class="subtitle">История и анализ проведенных симуляций</p>
    </div>

    <div class="stats-content">
      <div class="content-header">
        <h2>Сохраненные результаты</h2>
        <button @click="fetchSimulations" class="refresh-btn">
          <span class="refresh-icon">🔄</span>
          Обновить
        </button>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>

      <div v-else-if="simulations.length === 0" class="empty-state">
        <div class="empty-icon">📊</div>
        <h3>Нет данных для отображения</h3>
        <p>Пока нет сохраненных результатов симуляций. Запустите симуляцию и сохраните результаты.</p>
        <router-link to="/simulation" class="action-link">
          Запустить симуляцию
        </router-link>
      </div>

      <div v-else>
        <div class="summary-stats">
          <div class="summary-card">
            <div class="summary-icon">🔢</div>
            <div class="summary-info">
              <div class="summary-value">{{ simulations.length }}</div>
              <div class="summary-label">Всего симуляций</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon">👥</div>
            <div class="summary-info">
              <div class="summary-value">{{ totalCustomers }}</div>
              <div class="summary-label">Всего клиентов</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon">✅</div>
            <div class="summary-info">
              <div class="summary-value">{{ avgServiceRate.toFixed(1) }}%</div>
              <div class="summary-label">Средний процент обслуживания</div>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon">⚡</div>
            <div class="summary-info">
              <div class="summary-value">{{ avgUtilization.toFixed(1) }}%</div>
              <div class="summary-label">Средняя загрузка серверов</div>
            </div>
          </div>
        </div>
        
        <div class="simulations-grid">
          <div v-for="simulation in simulations" :key="simulation._id" class="simulation-card">
            <div class="simulation-header">
              <div class="timestamp">
                <div class="date">{{ formatDate(simulation.createdAt) }}</div>
                <div class="time">{{ formatTime(simulation.createdAt) }}</div>
              </div>
              <div class="simulation-actions">
                <button @click="showDetails(simulation)" class="action-button">
                  Детали
                </button>
              </div>
            </div>

            <div class="simulation-body">
              <div class="parameters">
                <h3>Параметры</h3>
                <div class="param-grid">
                  <div class="param-item">
                    <div class="param-icon">🖥️</div>
                    <div class="param-details">
                      <div class="param-label">Серверов</div>
                      <div class="param-value">{{ simulation.parameters.servers }}</div>
                    </div>
                  </div>
                  
                  <div class="param-item">
                    <div class="param-icon">📋</div>
                    <div class="param-details">
                      <div class="param-label">Макс. очередь</div>
                      <div class="param-value">{{ simulation.parameters.maxQueueLength }}</div>
                    </div>
                  </div>
                  
                  <div class="param-item">
                    <div class="param-icon">⏱️</div>
                    <div class="param-details">
                      <div class="param-label">Интенсивность</div>
                      <div class="param-value">{{ (simulation.parameters.arrivalRate * 100).toFixed(0) }}%</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="results">
                <h3>Результаты</h3>
                <div class="result-progress">
                  <div class="progress-label">
                    <span>Обработано:</span>
                    <span>{{ getServicePercentage(simulation) }}%</span>
                  </div>
                  <div class="progress-bar-container">
                    <div class="progress-bar" :style="{ width: getServicePercentage(simulation) + '%' }"></div>
                  </div>
                </div>
                
                <div class="result-stats">
                  <div class="result-item">
                    <span>Всего:</span>
                    <span>{{ simulation.statistics.totalCustomers }}</span>
                  </div>
                  <div class="result-item">
                    <span>Обслужено:</span>
                    <span>{{ simulation.statistics.servedCustomers }}</span>
                  </div>
                  <div class="result-item">
                    <span>Отказы:</span>
                    <span>{{ simulation.statistics.rejectedCustomers }}</span>
                  </div>
                  <div class="result-item">
                    <span>Загрузка:</span>
                    <span>{{ (simulation.statistics.serverUtilization * 100).toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно с деталями -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Детали симуляции</h2>
          <button @click="closeModal" class="close-button">×</button>
        </div>
        
        <div v-if="selectedSimulation" class="modal-body">
          <div class="detail-section">
            <h3>Информация о симуляции</h3>
            <div class="detail-item">
              <span>Дата и время:</span>
              <span>{{ new Date(selectedSimulation.createdAt).toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span>ID симуляции:</span>
              <span>{{ selectedSimulation._id }}</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Параметры симуляции</h3>
            <div class="detail-item">
              <span>Количество серверов:</span>
              <span>{{ selectedSimulation.parameters.servers }}</span>
            </div>
            <div class="detail-item">
              <span>Максимальная длина очереди:</span>
              <span>{{ selectedSimulation.parameters.maxQueueLength }}</span>
            </div>
            <div class="detail-item">
              <span>Интенсивность прихода (λ):</span>
              <span>{{ (selectedSimulation.parameters.arrivalRate * 100).toFixed(1) }}%</span>
            </div>
            <div class="detail-item">
              <span>Интенсивность обслуживания (μ):</span>
              <span>{{ (selectedSimulation.parameters.serviceRate * 100).toFixed(1) }}%</span>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Результаты симуляции</h3>
            <div class="detail-item">
              <span>Всего клиентов:</span>
              <span>{{ selectedSimulation.statistics.totalCustomers }}</span>
            </div>
            <div class="detail-item">
              <span>Обслужено клиентов:</span>
              <span>{{ selectedSimulation.statistics.servedCustomers }}</span>
            </div>
            <div class="detail-item">
              <span>Отказов:</span>
              <span>{{ selectedSimulation.statistics.rejectedCustomers }}</span>
            </div>
            <div class="detail-item">
              <span>Процент обслуженных:</span>
              <span>{{ getServicePercentage(selectedSimulation) }}%</span>
            </div>
            <div class="detail-item">
              <span>Среднее время ожидания:</span>
              <span>{{ (selectedSimulation.statistics.averageWaitTime / 1000).toFixed(2) }} сек</span>
            </div>
            <div class="detail-item">
              <span>Загрузка серверов:</span>
              <span>{{ (selectedSimulation.statistics.serverUtilization * 100).toFixed(1) }}%</span>
            </div>
          </div>
          
          <div class="detail-actions">
            <button @click="closeModal" class="modal-button">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'StatisticsView',

  setup() {
    const simulations = ref([])
    const loading = ref(true)
    const showModal = ref(false)
    const selectedSimulation = ref(null)

    // Computed values for summary statistics
    const totalCustomers = computed(() => {
      return simulations.value.reduce((sum, sim) => sum + sim.statistics.totalCustomers, 0);
    });
    
    const avgServiceRate = computed(() => {
      if (simulations.value.length === 0) return 0;
      
      const totalRate = simulations.value.reduce((sum, sim) => {
        const total = sim.statistics.totalCustomers;
        const served = sim.statistics.servedCustomers;
        return sum + (total > 0 ? (served / total) * 100 : 0);
      }, 0);
      
      return totalRate / simulations.value.length;
    });
    
    const avgUtilization = computed(() => {
      if (simulations.value.length === 0) return 0;
      
      const totalUtilization = simulations.value.reduce((sum, sim) => {
        return sum + (sim.statistics.serverUtilization * 100);
      }, 0);
      
      return totalUtilization / simulations.value.length;
    });

    const fetchSimulations = async () => {
      loading.value = true;
      try {
        const response = await fetch('http://localhost:3000/api/simulations')
        const data = await response.json()
        simulations.value = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      } catch (error) {
        console.error('Error fetching simulations:', error)
      } finally {
        loading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };
    
    const formatTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString();
    };
    
    const getServicePercentage = (simulation) => {
      const total = simulation.statistics.totalCustomers;
      if (total === 0) return 0;
      return ((simulation.statistics.servedCustomers / total) * 100).toFixed(1);
    };
    
    const showDetails = (simulation) => {
      selectedSimulation.value = simulation;
      showModal.value = true;
    };
    
    const closeModal = () => {
      showModal.value = false;
    };

    onMounted(() => {
      fetchSimulations()
    })

    return {
      simulations,
      loading,
      showModal,
      selectedSimulation,
      totalCustomers,
      avgServiceRate,
      avgUtilization,
      fetchSimulations,
      formatDate,
      formatTime,
      getServicePercentage,
      showDetails,
      closeModal
    }
  },
}
</script>

<style scoped>
.statistics-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: var(--text-color);
  margin-bottom: 10px;
  font-size: 2rem;
}

.subtitle {
  color: var(--secondary-text);
  font-size: 1.1rem;
}

.stats-content {
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px var(--shadow-color);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.content-header h2 {
  color: var(--text-color);
  font-size: 1.5rem;
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.refresh-icon {
  font-size: 1.1rem;
}

/* Loading state */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: var(--secondary-text);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  margin-bottom: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--secondary-text);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-state h3 {
  margin-bottom: 15px;
  color: var(--text-color);
}

.empty-state p {
  max-width: 500px;
  margin: 0 auto 30px;
  line-height: 1.6;
}

.action-link {
  display: inline-block;
  padding: 10px 20px;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.action-link:hover {
  background: var(--primary-hover);
  transform: translateY(-3px);
}

/* Summary stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.summary-card {
  background: var(--bg-color);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px var(--shadow-color);
}

.summary-icon {
  font-size: 1.8rem;
  color: var(--primary-color);
}

.summary-info {
  flex: 1;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 5px;
}

.summary-label {
  color: var(--secondary-text);
  font-size: 0.9rem;
}

/* Simulations grid */
.simulations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
}

.simulation-card {
  background: var(--bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 3px 10px var(--shadow-color);
  transition: all 0.3s;
}

.simulation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px var(--shadow-hover);
}

.simulation-header {
  padding: 15px 20px;
  background: var(--card-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.timestamp {
  display: flex;
  flex-direction: column;
}

.date {
  font-weight: 600;
  color: var(--text-color);
}

.time {
  font-size: 0.85rem;
  color: var(--secondary-text);
  margin-top: 5px;
}

.simulation-actions {
  display: flex;
}

.action-button {
  padding: 6px 12px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.action-button:hover {
  background: var(--primary-hover);
}

.simulation-body {
  padding: 20px;
}

.parameters, .results {
  margin-bottom: 25px;
}

.parameters h3, .results h3 {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: var(--text-color);
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.param-icon {
  color: var(--primary-color);
}

.param-label {
  font-size: 0.8rem;
  color: var(--secondary-text);
}

.param-value {
  font-weight: 600;
  color: var(--text-color);
}

.result-progress {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: var(--text-color);
}

.progress-bar-container {
  height: 8px;
  background: var(--card-bg);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  border-radius: 4px;
  transition: width 0.5s;
}

.result-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 0.9rem;
  color: var(--text-color);
  border-bottom: 1px solid var(--border-color);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: var(--card-bg);
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--text-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--secondary-text);
  cursor: pointer;
  transition: color 0.3s;
}

.close-button:hover {
  color: var(--primary-color);
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: var(--text-color);
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-button {
  padding: 10px 20px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.modal-button:hover {
  background: var(--primary-hover);
}

@media (max-width: 768px) {
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .simulations-grid {
    grid-template-columns: 1fr;
  }
  
  .param-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    max-height: 95vh;
    width: 95%;
  }
}
</style>