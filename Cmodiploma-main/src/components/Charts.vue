<template>
  <div class="charts-container">
    <div class="charts-header">
      <h2>Данные мониторинга</h2>
      <div class="charts-controls">
        <button @click="refreshData" class="refresh-btn" :disabled="!store.isRunning">
          <span class="refresh-icon">⟳</span>
          Обновить данные
        </button>
        <button @click="autoUpdateToggle" :class="['auto-update-btn', { 'active': autoUpdate }]">
          <span class="auto-icon">⏱</span>
          {{ autoUpdate ? 'Остановить авто-обновление' : 'Включить авто-обновление' }}
        </button>
        <button @click="exportData" class="export-btn" :disabled="store.history.timestamps.length === 0">
          <span class="export-icon">⬇️</span>
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

    <div v-if="store.systemType === 'priority' && store.history.timestamps.length > 0" class="priority-chart-wrapper">
      <div class="chart-wrapper">
        <h3>Обслуживание по приоритетам</h3>
        <apexchart
          type="pie"
          height="300"
          :options="priorityChartOptions"
          :series="priorityChartSeries"
        ></apexchart>
      </div>
    </div>

    <div class="no-data-message" v-if="store.history.timestamps.length === 0">
      <div class="empty-state">
        <div class="empty-icon">📈</div>
        <h3>Нет данных для отображения</h3>
        <p>Запустите симуляцию для сбора данных о загрузке серверов и длине очереди.</p>
        <button @click="refreshData" class="action-button">Обновить данные</button>
      </div>
    </div>

    <div class="data-table" v-if="store.history.timestamps.length > 0">
      <h3>История симуляции</h3>
      <table>
        <thead>
          <tr>
            <th class="time-col">Время</th>
            <th class="load-col">Загрузка серверов (%)</th>
            <th class="queue-col">Длина очереди</th>
            <th v-if="store.systemType === 'priority'" class="priority-col">Высокий приоритет</th>
            <th v-if="store.systemType === 'priority'" class="priority-col">Средний приоритет</th>
            <th v-if="store.systemType === 'priority'" class="priority-col">Низкий приоритет</th>
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
            <td v-if="store.systemType === 'priority'">
              {{ store.history.highPriorityServed[reverseIndex(index)] || 0 }}
            </td>
            <td v-if="store.systemType === 'priority'">
              {{ store.history.mediumPriorityServed[reverseIndex(index)] || 0 }}
            </td>
            <td v-if="store.systemType === 'priority'">
              {{ store.history.lowPriorityServed[reverseIndex(index)] || 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="save-section" v-if="store.history.timestamps.length > 0">
      <button @click="saveSimulationResults" class="save-btn">
        <span class="save-icon">💾</span>
        Сохранить результаты симуляции
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useQueueStore } from '../stores/queue';
import { API_URL } from '../config';

export default defineComponent({
  name: 'ChartsComponent',
  
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
          },
          dropShadow: {
            enabled: true,
            top: 3,
            left: 2,
            blur: 4,
            opacity: 0.1
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
          text: 'Загрузка серверов в реальном времени',
          align: 'left',
          style: {
            fontSize: '14px'
          }
        },
        annotations: {
          yaxis: [{
            y: 90,
            borderColor: '#e74c3c',
            label: {
              borderColor: '#e74c3c',
              style: {
                color: '#fff',
                background: '#e74c3c'
              },
              text: 'Критический уровень'
            }
          }]
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
          },
          dropShadow: {
            enabled: true,
            top: 3,
            left: 2,
            blur: 4,
            opacity: 0.1
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
          text: 'Изменение длины очереди',
          align: 'left',
          style: {
            fontSize: '14px'
          }
        },
        annotations: {
          yaxis: [{
            y: store.maxQueueLength,
            borderColor: '#f1c40f',
            label: {
              borderColor: '#f1c40f',
              style: {
                color: '#fff',
                background: '#f1c40f'
              },
              text: 'Максимальная длина'
            }
          }]
        }
      };
    });

    // Данные и опции для графика приоритетной очереди
    const priorityChartSeries = computed(() => {
      // Получаем последние значения для каждого приоритета
      const high = store.history.highPriorityServed.length > 0 
        ? store.history.highPriorityServed[store.history.highPriorityServed.length - 1] : 0;
        
      const medium = store.history.mediumPriorityServed.length > 0 
        ? store.history.mediumPriorityServed[store.history.mediumPriorityServed.length - 1] : 0;
        
      const low = store.history.lowPriorityServed.length > 0 
        ? store.history.lowPriorityServed[store.history.lowPriorityServed.length - 1] : 0;
        
      return [high, medium, low];
    });
    
    const priorityChartOptions = computed(() => {
      return {
        chart: {
          type: 'pie',
          height: 300
        },
        labels: ['Высокий приоритет', 'Средний приоритет', 'Низкий приоритет'],
        colors: ['#e74c3c', '#f1c40f', '#3498db'],
        legend: {
          position: 'bottom'
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }],
        tooltip: {
          y: {
            formatter: function(val) {
              return val + ' клиентов';
            }
          }
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
        // Запуск автообновления каждые 2 секунды
        updateTimer.value = setInterval(() => {
          // Проверяем состояние симуляции перед каждым обновлением
          if (!store.isRunning) {
            checkSimulationState();
            return;
          }
          
          refreshData();
        }, 2000);
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
      
      // Заголовки столбцов
      let headers = 'Время,Загрузка серверов (%),Длина очереди';
      
      // Добавляем заголовки для приоритетной очереди, если применимо
      if (store.systemType === 'priority') {
        headers += ',Высокий приоритет,Средний приоритет,Низкий приоритет';
      }
      
      csvContent += headers + '\n';
      
      for (let i = 0; i < store.history.timestamps.length; i++) {
        const time = formatTime(store.history.timestamps[i]);
        const load = (store.history.serverUtilization[i] * 100).toFixed(1);
        const queue = store.history.queueLength[i];
        
        let row = `${time},${load},${queue}`;
        
        // Добавляем данные приоритетов, если применимо
        if (store.systemType === 'priority') {
          const high = store.history.highPriorityServed[i] || 0;
          const medium = store.history.mediumPriorityServed[i] || 0;
          const low = store.history.lowPriorityServed[i] || 0;
          row += `,${high},${medium},${low}`;
        }
        
        csvContent += row + '\n';
      }
      
      // Создание ссылки для скачивания
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `smo-stats-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
      document.body.appendChild(link);
      
      // Скачивание
      link.click();
      
      // Удаление ссылки
      document.body.removeChild(link);
    };
    
    // Сохранение результатов симуляции на сервере
    const saveSimulationResults = async () => {
      try {
        if (store.history.timestamps.length === 0) {
          console.log('Нет данных для сохранения');
          return;
        }
        
        const simulationData = {
          parameters: {
            servers: store.servers,
            maxQueueLength: store.maxQueueLength,
            arrivalRate: store.arrivalRate,
            serviceRate: store.serviceRate
          },
          statistics: {
            totalCustomers: store.statistics.totalCustomers,
            servedCustomers: store.statistics.servedCustomers,
            rejectedCustomers: store.statistics.rejectedCustomers,
            averageWaitTime: store.statistics.averageWaitTime,
            serverUtilization: store.statistics.serverUtilization
          }
        };
        
        const response = await fetch(`${API_URL}/simulations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(simulationData)
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Simulation saved successfully:', data);
          alert('Результаты симуляции успешно сохранены!');
        } else {
          console.error('Error saving simulation:', response.statusText);
          alert('Ошибка при сохранении результатов симуляции');
        }
      } catch (error) {
        console.error('Error saving simulation:', error);
        alert('Ошибка при сохранении результатов симуляции');
      }
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
      
      // Если симуляция запущена, сразу обновляем данные
      if (store.isRunning) {
        refreshData();
      }
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
      saveSimulationResults,
      avgServerLoad,
      maxServerLoad,
      avgQueueLength,
      dataPoints,
      // ApexCharts
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
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.charts-header h2 {
  color: var(--text-color);
  margin: 0;
  font-size: 1.5rem;
  position: relative;
  padding-bottom: 10px;
}

.charts-header h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 1.5px;
}

.charts-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.refresh-btn, .auto-update-btn, .export-btn, .save-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.refresh-btn {
  background: var(--primary-color);
  color: white;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.export-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.save-btn {
  background: #2ecc71;
  color: white;
  font-size: 1rem;
  padding: 10px 20px;
}

.refresh-btn:not(:disabled):hover, 
.auto-update-btn:hover, 
.export-btn:not(:disabled):hover,
.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.refresh-icon, .auto-icon, .export-icon, .save-icon {
  font-size: 1.1rem;
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
  padding: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px var(--shadow-hover);
}

.summary-icon {
  font-size: 1.5rem;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.summary-info {
  flex: 1;
}

.summary-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 5px;
}

.summary-label {
  font-size: 0.9rem;
  color: var(--secondary-text);
}

/* Визуализация графиков */
.charts-visualization, .priority-chart-wrapper {
  display: grid;
  gap: 25px;
  margin-bottom: 30px;
}

.charts-visualization {
  grid-template-columns: 1fr 1fr;
}

.priority-chart-wrapper {
  grid-template-columns: 1fr;
}

.chart-wrapper {
  background: var(--bg-color);
  border-radius: 10px;
  padding: 20px;
  height: auto;
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s;
}

.chart-wrapper:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px var(--shadow-hover);
}

.chart-wrapper h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-color);
  font-size: 1.1rem;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

/* Сообщение об отсутствии данных */
.no-data-message {
  margin: 40px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-color);
  border-radius: 10px;
  box-shadow: 0 2px 8px var(--shadow-color);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.6;
  color: var(--secondary-text);
}

.empty-state h3 {
  margin-bottom: 15px;
  color: var(--text-color);
  font-size: 1.5rem;
}

.empty-state p {
  max-width: 500px;
  margin: 0 auto 30px;
  line-height: 1.6;
  color: var(--secondary-text);
}

.action-button {
  display: inline-block;
  padding: 10px 20px;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.action-button:hover {
  background: var(--primary-hover);
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(66, 185, 131, 0.3);
}

.action-button:active {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(66, 185, 131, 0.2);
}

.action-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.3);
}

.action-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>