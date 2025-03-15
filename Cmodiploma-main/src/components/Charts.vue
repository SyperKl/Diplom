<template>
  <div class="charts-container">
    <div class="charts-header">
      <h2>Данные для графиков</h2>
      <div class="charts-controls">
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
        <apexchart
          type="area"
          height="300"
          :options="serverLoadOptions"
          :series="serverLoadSeries"
        ></apexchart>
      </div>
      
      <div class="chart-wrapper">
        <h3>Длина очереди</h3>
        <apexchart
          type="area"
          height="300"
          :options="queueLengthOptions"
          :series="queueLengthSeries"
        ></apexchart>
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
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useQueueStore } from '../stores/queue';
import VueApexCharts from 'vue3-apexcharts';

export default defineComponent({
  name: 'ChartsComponent',
  components: {
    apexchart: VueApexCharts
  },
  
  setup() {
    const store = useQueueStore();
    const autoUpdate = ref(false);
    const updateTimer = ref(null);
    
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
    
    // Данные и опции для графика загрузки серверов с ApexCharts
    const serverLoadSeries = computed(() => {
      return [{
        name: 'Загрузка серверов (%)',
        data: store.history.serverUtilization.map(val => parseFloat((val * 100).toFixed(1)))
      }];
    });
    
    const serverLoadOptions = computed(() => {
      return {
        chart: {
          type: 'area',
          height: 300,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
          },
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          }
        },
        colors: ['#42b983'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
            stops: [0, 90, 100]
          }
        },
        markers: {
          size: 4,
          colors: ['#42b983'],
          strokeColors: '#fff',
          strokeWidth: 2
        },
        tooltip: {
          theme: 'dark',
          y: {
            formatter: function(val) {
              return val.toFixed(1) + '%';
            }
          }
        },
        grid: {
          borderColor: 'rgba(0,0,0,0.1)',
          row: {
            colors: ['transparent', 'transparent'],
            opacity: 0.5
          }
        },
        xaxis: {
          categories: store.history.timestamps.map(timestamp => {
            return new Date(timestamp).toLocaleTimeString();
          }),
          labels: {
            style: {
              colors: []
            }
          }
        },
        yaxis: {
          min: 0,
          max: 100,
          title: {
            text: 'Загрузка (%)'
          }
        },
        title: {
          text: 'Загрузка серверов',
          align: 'left'
        }
      };
    });
    
    // Данные и опции для графика длины очереди с ApexCharts
    const queueLengthSeries = computed(() => {
      return [{
        name: 'Длина очереди',
        data: store.history.queueLength
      }];
    });
    
    const queueLengthOptions = computed(() => {
      return {
        chart: {
          type: 'area',
          height: 300,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
          },
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          }
        },
        colors: ['#3490dc'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.3,
            stops: [0, 90, 100]
          }
        },
        markers: {
          size: 4,
          colors: ['#3490dc'],
          strokeColors: '#fff',
          strokeWidth: 2
        },
        tooltip: {
          theme: 'dark'
        },
        grid: {
          borderColor: 'rgba(0,0,0,0.1)',
          row: {
            colors: ['transparent', 'transparent'],
            opacity: 0.5
          }
        },
        xaxis: {
          categories: store.history.timestamps.map(timestamp => {
            return new Date(timestamp).toLocaleTimeString();
          }),
          labels: {
            style: {
              colors: []
            }
          }
        },
        yaxis: {
          min: 0,
          title: {
            text: 'Количество клиентов'
          }
        },
        title: {
          text: 'Длина очереди',
          align: 'left'
        }
      };
    });
    
    // Обновление данных
    const refreshData = () => {
      store.addChartDataPoint();
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
    
    // Безопасно отслеживаем изменения в данных
    watch(() => store.history.timestamps.length, (newLength, oldLength) => {
      if (newLength !== oldLength) {
        nextTick(() => {
          console.log('Обновление графиков после изменения данных');
        });
      }
    });
    
    onMounted(() => {
      // Сразу проверяем состояние симуляции
      checkSimulationState();
    });
    
    // Очистка при размонтировании компонента
    onUnmounted(() => {
      if (updateTimer.value) {
        clearInterval(updateTimer.value);
        updateTimer.value = null;
      }
    });
    
    return {
      store,
      autoUpdate,
      formatTime,
      reverseIndex,
      getLoadClass,
      refreshData,
      autoUpdateToggle,
      exportData,
      avgServerLoad,
      maxServerLoad,
      avgQueueLength,
      dataPoints,
      // ApexCharts
      serverLoadSeries,
      serverLoadOptions,
      queueLengthSeries,
      queueLengthOptions
    };
  }
});
</script>

<style scoped>
.charts-container {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px var(--shadow-color);
  margin-top: 30px;
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.charts-header h2 {
  color: var(--text-color);
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
  background: var(--primary-color);
  color: white;
}

.auto-update-btn {
  background: var(--secondary-text);
  color: var(--text-color);
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
  background: var(--bg-color);
  padding: 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s;
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px var(--shadow-hover);
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
  color: var(--text-color);
}

.summary-label {
  font-size: 0.9rem;
  color: var(--secondary-text);
}

/* Визуализация графиков */
.charts-visualization {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-bottom: 30px;
}

.chart-wrapper {
  background: var(--bg-color);
  border-radius: 10px;
  padding: 20px;
  height: auto;
}

.chart-wrapper h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-color);
  font-size: 1.1rem;
  text-align: center;
}

/* Стили таблицы */
.data-table {
  overflow-x: auto;
  border-radius: 8px;
  background: var(--bg-color);
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
  background: var(--card-bg);
  color: var(--primary-color);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.even-row {
  background-color: var(--bg-color);
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
  color: var(--secondary-text);
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