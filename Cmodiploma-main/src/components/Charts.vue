<template>
  <div class="charts-container">
    <div class="charts-header">
      <h2>Мониторинг работы системы</h2>
      <div class="charts-controls">
        <button @click="refreshData" class="btn refresh-btn" :disabled="!store.isRunning">
          <span class="refresh-icon">🔄</span>
          Обновить данные
        </button>
        <button @click="autoUpdateToggle" :class="['btn auto-update-btn', { 'active': autoUpdate }]">
          {{ autoUpdate ? 'Остановить автообновление' : 'Автообновление' }}
        </button>
        <button @click="exportData" class="btn export-btn">
          <span class="export-icon">📊</span>
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

    <div v-if="store.history.timestamps.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>Нет данных для отображения</h3>
      <p>Запустите симуляцию и дождитесь сбора статистики для отображения графиков</p>
      <button @click="refreshData" class="btn primary-btn">Обновить данные</button>
    </div>

    <div class="charts-visualization" v-else>
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
      <div class="chart-wrapper" v-if="showPriorityChart">
        <h3>Обслужено клиентов по приоритетам</h3>
        <apexchart
          type="bar"
          height="300"
          :options="priorityChartOptions"
          :series="priorityChartSeries"
        ></apexchart>
      </div>
    </div>

    <div class="data-table" v-if="store.history.timestamps.length > 0">
      <h3>История наблюдений</h3>
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
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useQueueStore } from '../stores/queue';

export default defineComponent({
  name: 'ChartsComponent',

  setup() {
    const store = useQueueStore();
    const autoUpdate = ref(false);
    const updateTimer = ref(null);
    const showPriorityChart = computed(() => {
      return store.systemType === 'priority' &&
             store.history.highPriorityServed.length > 0;
    });
    const reverseIndex = (index) => {
      return store.history.timestamps.length - 1 - index;
    };
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    };
    const getLoadClass = (index) => {
      const actualIndex = reverseIndex(index);
      const load = store.history.serverUtilization[actualIndex] * 100;

      if (load >= 90) return 'high-load';
      if (load >= 50) return 'medium-load';
      return 'low-load';
    };
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
          },
          theme: {
            mode: 'light'
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
        }
      };
    });
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
          },
          theme: {
            mode: 'light'
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
          y: {
            formatter: function(val) {
              return val;
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
          title: {
            text: 'Количество клиентов'
          }
        }
      };
    });
    const priorityChartSeries = computed(() => {
      if (!showPriorityChart.value) return [];

      return [
        {
          name: 'Высокий приоритет',
          data: store.history.highPriorityServed
        },
        {
          name: 'Средний приоритет',
          data: store.history.mediumPriorityServed
        },
        {
          name: 'Низкий приоритет',
          data: store.history.lowPriorityServed
        }
      ];
    });

    const priorityChartOptions = computed(() => {
      return {
        chart: {
          type: 'bar',
          height: 300,
          stacked: true,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
          },
          toolbar: {
            show: true
          },
          theme: {
            mode: 'light'
          }
        },
        colors: ['#e74c3c', '#f39c12', '#3498db'],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: store.history.timestamps.map(timestamp => {
            return new Date(timestamp).toLocaleTimeString();
          }),
        },
        yaxis: {
          title: {
            text: 'Количество клиентов'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + " клиентов";
            }
          }
        }
      };
    });
    const refreshData = () => {
      store.addChartDataPoint();
    };
    const autoUpdateToggle = () => {
      if (!store.isRunning && !autoUpdate.value) {
        alert('Сначала запустите симуляцию!');
        return;
      }

      autoUpdate.value = !autoUpdate.value;

      if (autoUpdate.value) {
        updateTimer.value = setInterval(() => {
          if (!store.isRunning) {
            autoUpdate.value = false;
            if (updateTimer.value) {
              clearInterval(updateTimer.value);
              updateTimer.value = null;
            }
            return;
          }

          refreshData();
        }, 3000);
      } else {
        if (updateTimer.value) {
          clearInterval(updateTimer.value);
          updateTimer.value = null;
        }
      }
    };
    const exportData = () => {
      if (store.history.timestamps.length === 0) {
        alert('Нет данных для экспорта');
        return;
      }
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Время,Загрузка серверов (%),Длина очереди\n';

      for (let i = 0; i < store.history.timestamps.length; i++) {
        const time = formatTime(store.history.timestamps[i]);
        const load = (store.history.serverUtilization[i] * 100).toFixed(1);
        const queue = store.history.queueLength[i];

        csvContent += `${time},${load},${queue}\n`;
      }
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `smo-stats-${new Date().toISOString().slice(0, 19)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    watch(() => store.isRunning, (isRunning) => {
      if (!isRunning && autoUpdate.value) {
        autoUpdate.value = false;
        if (updateTimer.value) {
          clearInterval(updateTimer.value);
          updateTimer.value = null;
        }
      }
    });
    onUnmounted(() => {
      if (updateTimer.value) {
        clearInterval(updateTimer.value);
      }
    });

    return {
      store,
      autoUpdate,
      showPriorityChart,
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

      serverLoadSeries,
      serverLoadOptions,
      queueLengthSeries,
      queueLengthOptions,
      priorityChartSeries,
      priorityChartOptions
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
  margin-bottom: 25px;
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

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn {
  background: var(--primary-color);
  color: white;
}

.auto-update-btn {
  background: var(--secondary-text);
  color: white;
}

.auto-update-btn.active {
  background: #3498db;
  color: white;
}

.export-btn {
  background: #9b59b6;
  color: white;
}

.refresh-btn:hover:not(:disabled),
.auto-update-btn:hover,
.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
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

.primary-btn {
  background: var(--primary-color);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  display: inline-block;
}
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
.charts-visualization {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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

.data-table {
  overflow-x: auto;
  border-radius: 8px;
  background: var(--bg-color);
  padding: 20px;
  margin-top: 20px;
}

.data-table h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-color);
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

@media (max-width: 768px) {
  .charts-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .charts-controls {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .summary-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .charts-visualization {
    grid-template-columns: 1fr;
  }
}
</style>
