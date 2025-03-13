<template>
  <div class="charts-container">
    <div class="chart-selection">
      <button 
        v-for="(option, index) in chartOptions" 
        :key="index"
        :class="['chart-tab', { active: activeChart === index }]"
        @click="activeChart = index"
      >
        {{ option.label }}
      </button>
    </div>
    
    <div class="chart-wrapper">
      <div class="chart-header">
        <h3>{{ chartOptions[activeChart].label }}</h3>
        <div class="chart-controls">
          <button class="chart-control-btn" @click="updateChartPeriod('all')">
            Все
          </button>
          <button class="chart-control-btn" @click="updateChartPeriod('10')">
            10 точек
          </button>
        </div>
      </div>
      
      <div v-if="isRunning" class="chart-status">
        <p>Симуляция запущена - график обновляется автоматически</p>
      </div>
      
      <div class="chart-area">
        <LineChart
          v-if="hasData"
          :data="processedChartData"
          :options="currentChartOptions"
          :height="300"
          :width="800"
        />
        <div v-else class="no-data-message">
          Недостаточно данных для построения графика. Запустите симуляцию, чтобы собрать данные.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useQueueStore } from '../stores/queue';
import { storeToRefs } from 'pinia';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line as LineChart } from 'vue-chartjs';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default defineComponent({
  name: 'ChartsComponent',
  components: { LineChart },
  
  setup() {
    const store = useQueueStore();
    const { history, statistics, isRunning } = storeToRefs(store);
    
    const activeChart = ref(0);
    const displayPeriod = ref('all');
    
    // Chart configuration options
    const chartOptions = [
      { 
        label: 'Загрузка серверов',
        dataKey: 'serverUtilization',
        color: '#42b983',
        yLabel: 'Загрузка (%)',
        formatter: (value) => `${(value * 100).toFixed(1)}%`,
        max: 1
      },
      { 
        label: 'Длина очереди',
        dataKey: 'queueLength',
        color: '#3498db',
        yLabel: 'Кол-во заявок',
        formatter: (value) => value,
        max: store.maxQueueLength
      }
    ];
    
    // Base chart options
    const baseChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      },
      elements: {
        line: {
          tension: 0.4 // Smoother curves
        },
        point: {
          radius: 3,
          hoverRadius: 6
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 15,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            padding: 10
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            padding: 10,
            maxRotation: 0
          }
        }
      }
    };
    
    // Computed for current chart option configuration
    const currentChartOptions = computed(() => {
      const option = chartOptions[activeChart.value];
      const customOptions = structuredClone(baseChartOptions);
      
      // Update Y axis label and formatting
      customOptions.scales.y.title = {
        display: true,
        text: option.yLabel
      };
      
      customOptions.scales.y.max = option.max;
      
      // Update tooltip formatting
      customOptions.plugins.tooltip.callbacks = {
        label: (context) => {
          const value = context.raw;
          return option.formatter(value);
        }
      };
      
      return customOptions;
    });
    
    // Process chart data based on active chart and display period
    const processedChartData = computed(() => {
      if (!history.value || !history.value.timestamps || history.value.timestamps.length === 0) {
        return {
          labels: [],
          datasets: [{
            label: chartOptions[activeChart.value].label,
            data: [],
            borderColor: chartOptions[activeChart.value].color,
            backgroundColor: chartOptions[activeChart.value].color + '20'
          }]
        };
      }
      
      // Get data for the selected chart
      const option = chartOptions[activeChart.value];
      let dataPoints = history.value[option.dataKey];
      let timeLabels = history.value.timestamps;
      
      // Apply period filtering if needed
      if (displayPeriod.value !== 'all' && history.value.timestamps.length > parseInt(displayPeriod.value)) {
        const count = parseInt(displayPeriod.value);
        dataPoints = dataPoints.slice(-count);
        timeLabels = timeLabels.slice(-count);
      }
      
      // Format time labels
      const formattedLabels = timeLabels.map(timestamp => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      });
      
      // Return formatted chart data
      return {
        labels: formattedLabels,
        datasets: [{
          label: option.label,
          data: dataPoints,
          borderColor: option.color,
          backgroundColor: option.color + '20',
          fill: true
        }]
      };
    });
    
    // Check if chart has data to display
    const hasData = computed(() => {
      return history.value.timestamps && history.value.timestamps.length > 0;
    });
    
    // Update chart period filter
    const updateChartPeriod = (period) => {
      displayPeriod.value = period;
    };
    
    return {
      // State
      activeChart,
      chartOptions,
      history,
      statistics,
      isRunning,
      
      // Computed
      currentChartOptions,
      processedChartData,
      hasData,
      
      // Methods
      updateChartPeriod,
    };
  }
});
</script>

<style scoped>
.charts-container {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px var(--shadow-color);
}

.chart-selection {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--bg-color);
}

.chart-tab {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: var(--bg-color);
  color: var(--secondary-text);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.chart-tab.active {
  background: var(--card-bg);
  color: var(--primary-color);
  font-weight: 600;
}

.chart-tab:hover:not(.active) {
  background: var(--border-color);
}

.chart-wrapper {
  padding: 25px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header h3 {
  color: var(--text-color);
  font-weight: 600;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 10px;
}

.chart-control-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
}

.chart-control-btn:hover {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.chart-status {
  background-color: rgba(66, 185, 131, 0.1);
  border-left: 4px solid var(--primary-color);
  padding: 10px 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.chart-area {
  height: 300px;
  position: relative;
}

.no-data-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
  color: var(--secondary-text);
  text-align: center;
  padding: 20px;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .chart-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>