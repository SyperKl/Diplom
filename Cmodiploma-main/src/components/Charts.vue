<template>
  <div class="charts-container">
    <div class="charts-header">
      <h2>Данные для графиков</h2>
      <div class="charts-controls">
        <button @click="autoUpdateToggle" :class="['auto-update-btn', { active: autoUpdate }]">
          {{ autoUpdate ? 'Остановить обновление' : 'Автообновление' }}
        </button>
        <button @click="refreshData" class="refresh-btn">
          Обновить данные
        </button>
        <button @click="exportData" class="export-btn">
          Экспорт CSV
        </button>
      </div>
    </div>

    <div class="summary-stats" v-if="store.history.timestamps.length > 0">
      <div class="summary-card">
        <div class="summary-icon">📊</div>
        <div class="summary-info">
          <div class="summary-value">{{ avgServerLoad }}%</div>
          <div class="summary-label">Средняя загрузка</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">⬆️</div>
        <div class="summary-info">
          <div class="summary-value">{{ maxServerLoad }}%</div>
          <div class="summary-label">Максимальная загрузка</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">📝</div>
        <div class="summary-info">
          <div class="summary-value">{{ avgQueueLength }}</div>
          <div class="summary-label">Средняя длина очереди</div>
        </div>
      </div>
      
      <div class="summary-card">
        <div class="summary-icon">📈</div>
        <div class="summary-info">
          <div class="summary-value">{{ dataPoints }}</div>
          <div class="summary-label">Точек данных</div>
        </div>
      </div>
    </div>

    <div class="charts-visualization" v-if="store.history.timestamps.length > 0">
      <div class="chart-wrapper">
        <h3>Загрузка серверов</h3>
        <canvas ref="serverLoadChart" width="400" height="200"></canvas>
      </div>
      
      <div class="chart-wrapper">
        <h3>Длина очереди</h3>
        <canvas ref="queueLengthChart" width="400" height="200"></canvas>
      </div>
    </div>

    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th class="time-col">Время</th>
            <th class="load-col">Загрузка серверов (%)</th>
            <th class="queue-col">Длина очереди</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(timestamp, index) in store.history.timestamps.slice().reverse()" 
              :key="index" 
              :class="[index % 2 === 0 ? 'even-row' : 'odd-row']">
            <td>{{ formatTime(timestamp) }}</td>
            <td :class="getLoadClass(index)">
              {{ (store.history.serverUtilization[reverseIndex(index)] * 100).toFixed(1) }}%
            </td>
            <td>{{ store.history.queueLength[reverseIndex(index)] }}</td>
          </tr>
          <tr v-if="store.history.timestamps.length === 0">
            <td colspan="3" class="no-data">
              Нет данных для отображения. Нажмите "Обновить данные", чтобы собрать статистику.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useQueueStore } from '../stores/queue';
import Chart from 'chart.js/auto';

export default defineComponent({
  name: 'ChartsComponent',
  
  setup() {
    const store = useQueueStore();
    const autoUpdate = ref(false);
    const updateTimer = ref(null);
    
    // Ссылки на элементы графиков
    const serverLoadChart = ref(null);
    const queueLengthChart = ref(null);
    
    // Экземпляры графиков
    let serverLoadChartInstance = null;
    let queueLengthChartInstance = null;
    
    // Вычисление индекса в обратном порядке
    const reverseIndex = (index) => {
      return store.history.timestamps.length - 1 - index;
    };
    
    // Форматирование времени
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    };
    
    // Получение класса для ячейки с загрузкой
    const getLoadClass = (index) => {
      const actualIndex = reverseIndex(index);
      const load = store.history.serverUtilization[actualIndex] * 100;
      
      if (load >= 90) return 'high-load';
      if (load >= 50) return 'medium-load';
      return 'low-load';
    };
    
    // Вычисляемые свойства для статистики
    const avgServerLoad = computed(() => {
      if (store.history.serverUtilization.length === 0) return 0;
      
      const sum = store.history.serverUtilization.reduce((acc, val) => acc + val, 0);
      return (sum / store.history.serverUtilization.length * 100).toFixed(1);
    });
    
    const maxServerLoad = computed(() => {
      if (store.history.serverUtilization.length === 0) return 0;
      
      const max = Math.max(...store.history.serverUtilization);
      return (max * 100).toFixed(1);
    });
    
    const avgQueueLength = computed(() => {
      if (store.history.queueLength.length === 0) return 0;
      
      const sum = store.history.queueLength.reduce((acc, val) => acc + val, 0);
      return (sum / store.history.queueLength.length).toFixed(1);
    });
    
    const dataPoints = computed(() => {
      return store.history.timestamps.length;
    });
    
    // Инициализация графиков
    const initCharts = () => {
      if (serverLoadChartInstance) {
        serverLoadChartInstance.destroy();
      }
      
      if (queueLengthChartInstance) {
        queueLengthChartInstance.destroy();
      }
      
      // Пропускаем инициализацию, если нет данных
      if (store.history.timestamps.length === 0) return;
      
      // Форматирование данных для графиков
      const labels = store.history.timestamps.map(timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
      });
      
      const serverLoadData = store.history.serverUtilization.map(val => val * 100);
      const queueLengthData = store.history.queueLength;
      
      // График загрузки серверов
      const serverLoadCtx = serverLoadChart.value?.getContext('2d');
      if (serverLoadCtx) {
        serverLoadChartInstance = new Chart(serverLoadCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Загрузка серверов (%)',
              data: serverLoadData,
              borderColor: '#42b983',
              backgroundColor: 'rgba(66, 185, 131, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                title: {
                  display: true,
                  text: 'Загрузка (%)'
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
              }
            }
          }
        });
      }
      
      // График длины очереди
      const queueLengthCtx = queueLengthChart.value?.getContext('2d');
      if (queueLengthCtx) {
        queueLengthChartInstance = new Chart(queueLengthCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Длина очереди',
              data: queueLengthData,
              borderColor: '#3490dc',
              backgroundColor: 'rgba(52, 144, 220, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Количество клиентов'
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
              }
            }
          }
        });
      }
    };
    
    // Обновление графиков новыми данными
    const updateCharts = () => {
      if (!serverLoadChartInstance || !queueLengthChartInstance) {
        initCharts();
        return;
      }
      
      // Форматирование данных для графиков
      const labels = store.history.timestamps.map(timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
      });
      
      const serverLoadData = store.history.serverUtilization.map(val => val * 100);
      const queueLengthData = store.history.queueLength;
      
      // Обновление графика загрузки серверов
      serverLoadChartInstance.data.labels = labels;
      serverLoadChartInstance.data.datasets[0].data = serverLoadData;
      serverLoadChartInstance.update();
      
      // Обновление графика длины очереди
      queueLengthChartInstance.data.labels = labels;
      queueLengthChartInstance.data.datasets[0].data = queueLengthData;
      queueLengthChartInstance.update();
    };
    
    // Обновление данных
    const refreshData = () => {
      store.addChartDataPoint();
      updateCharts();
    };
    
    // Проверка состояния симуляции
    const checkSimulationState = () => {
      if (!store.isRunning && autoUpdate.value) {
        console.log('Автоматическая остановка обновления графиков, так как симуляция остановлена');
        autoUpdate.value = false;
        if (updateTimer.value) {
          clearInterval(updateTimer.value);
          updateTimer.value = null;
        }
      }
    };
    
    // Переключение автоматического обновления
    const autoUpdateToggle = () => {
      // Если симуляция не запущена, и пользователь пытается включить автообновление
      if (!store.isRunning && !autoUpdate.value) {
        alert('Сначала запустите симуляцию!');
        return;
      }
      
      autoUpdate.value = !autoUpdate.value;
      
      if (autoUpdate.value) {
        // Запуск автообновления каждые 3 секунды
        updateTimer.value = setInterval(() => {
          // Проверяем состояние симуляции перед каждым обновлением
          if (!store.isRunning) {
            checkSimulationState();
            return;
          }
          
          refreshData();
        }, 3000);
      } else {
        // Остановка автообновления
        if (updateTimer.value) {
          clearInterval(updateTimer.value);
          updateTimer.value = null;
        }
      }
    };
    
    // Экспорт данных в CSV
    const exportData = () => {
      if (store.history.timestamps.length === 0) {
        alert('Нет данных для экспорта');
        return;
      }
      
      // Формирование CSV данных
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Время,Загрузка серверов (%),Длина очереди\n';
      
      for (let i = 0; i < store.history.timestamps.length; i++) {
        const time = formatTime(store.history.timestamps[i]);
        const load = (store.history.serverUtilization[i] * 100).toFixed(1);
        const queue = store.history.queueLength[i];
        
        csvContent += `${time},${load},${queue}\n`;
      }
      
      // Создание ссылки для скачивания
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `smo-stats-${new Date().toISOString().slice(0, 19)}.csv`);
      document.body.appendChild(link);
      
      // Скачивание
      link.click();
      
      // Удаление ссылки
      document.body.removeChild(link);
    };
    
    // Отслеживаем изменение состояния симуляции
    watch(() => store.isRunning, (isRunning) => {
      console.log('Изменение состояния симуляции:', isRunning);
      if (!isRunning) {
        checkSimulationState();
      }
    });
    
    // Отслеживаем изменения в данных
    watch(() => store.history.timestamps.length, (newLength, oldLength) => {
      if (newLength !== oldLength) {
        updateCharts();
      }
    });
    
    onMounted(() => {
      // Инициализируем графики, если есть данные
      if (store.history.timestamps.length > 0) {
        initCharts();
      }
      
      // Сразу проверяем состояние симуляции
      checkSimulationState();
    });
    
    // Очистка при размонтировании компонента
    onBeforeUnmount(() => {
      if (updateTimer.value) {
        clearInterval(updateTimer.value);
        updateTimer.value = null;
      }
      
      // Уничтожаем экземпляры графиков
      if (serverLoadChartInstance) {
        serverLoadChartInstance.destroy();
      }
      
      if (queueLengthChartInstance) {
        queueLengthChartInstance.destroy();
      }
    });
    
    return {
      store,
      autoUpdate,
      serverLoadChart,
      queueLengthChart,
      formatTime,
      reverseIndex,
      getLoadClass,
      refreshData,
      autoUpdateToggle,
      exportData,
      avgServerLoad,
      maxServerLoad,
      avgQueueLength,
      dataPoints
    };
  }
});
</script>

<style scoped>
.charts-container {
  background: var(--card-bg, #2d3748);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px var(--shadow-color, rgba(0, 0, 0, 0.3));
  margin-top: 30px;
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.charts-header h2 {
  color: var(--text-color, #e2e8f0);
  margin: 0;
  font-size: 1.5rem;
}

.charts-controls {
  display: flex;
  gap: 10px;
}

.refresh-btn, .auto-update-btn, .export-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn {
  background: var(--primary-color, #42b983);
  color: white;
}

.auto-update-btn {
  background: var(--secondary-text, #a0aec0);
  color: var(--text-color, #e2e8f0);
}

.auto-update-btn.active {
  background: #3498db;
  color: white;
}

.export-btn {
  background: #9b59b6;
  color: white;
}

.refresh-btn:hover, .auto-update-btn:hover, .export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Статистика */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.summary-card {
  background: var(--bg-color, #1a202c);
  padding: 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px var(--shadow-hover, rgba(0, 0, 0, 0.4));
}

.summary-icon {
  font-size: 1.5rem;
}

.summary-info {
  flex: 1;
}

.summary-value {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--text-color, #e2e8f0);
}

.summary-label {
  font-size: 0.9rem;
  color: var(--secondary-text, #a0aec0);
}

/* Визуализация графиков */
.charts-visualization {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.chart-wrapper {
  background: var(--bg-color, #1a202c);
  border-radius: 10px;
  padding: 20px;
  height: 300px;
}

.chart-wrapper h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-color, #e2e8f0);
  font-size: 1.1rem;
  text-align: center;
}

/* Стили таблицы */
.data-table {
  overflow-x: auto;
  border-radius: 8px;
  background: var(--bg-color, #1a202c);
}

table {
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
}

th, td {
  padding: 12px 16px;
  text-align: left;
}

th {
  background: var(--card-bg, #2d3748);
  color: var(--primary-color, #42b983);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.even-row {
  background-color: var(--bg-color, #1a202c);
}

.odd-row {
  background-color: rgba(255, 255, 255, 0.02);
}

.time-col {
  min-width: 120px;
}

.load-col, .queue-col {
  min-width: 150px;
}

.high-load {
  color: #e74c3c;
  font-weight: 600;
}

.medium-load {
  color: #f1c40f;
  font-weight: 600;
}

.low-load {
  color: #2ecc71;
  font-weight: 600;
}

.no-data {
  padding: 30px;
  text-align: center;
  color: var(--secondary-text, #a0aec0);
  font-style: italic;
}

@media (max-width: 768px) {
  .charts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .charts-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .summary-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
  
  .charts-visualization {
    grid-template-columns: 1fr;
  }
}
</style>