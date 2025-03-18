<template>
  <div class="statistics-page">
    <h1 class="title">Статистика СМО</h1>

    <div class="stats-content">
      <h2>Общая статистика работы системы</h2>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Загрузка данных...</p>
      </div>

      <div v-else-if="simulations.length === 0" class="no-data">
        Пока нет сохраненных результатов симуляций
      </div>

      <div v-else class="simulations-grid">
        <div v-for="simulation in simulations" :key="simulation._id" class="simulation-card">
          <div class="simulation-header">
            <span class="date">
              {{ formatDate(simulation.createdAt) }}
            </span>
          </div>

          <div class="simulation-body">
            <div class="parameters">
              <h3>Параметры симуляции</h3>
              <div class="param-item">
                <span>Серверов:</span>
                <span>{{ simulation.parameters.servers }}</span>
              </div>
              <div class="param-item">
                <span>Макс. очередь:</span>
                <span>{{ simulation.parameters.maxQueueLength }}</span>
              </div>
              <div class="param-item">
                <span>Интенсивность:</span>
                <span>{{ formatPercentage(simulation.parameters.arrivalRate) }}</span>
              </div>
            </div>

            <div class="results">
              <h3>Результаты</h3>
              <div class="result-item">
                <span>Всего клиентов:</span>
                <span>{{ simulation.statistics.totalCustomers }}</span>
              </div>
              <div class="result-item">
                <span>Обслужено:</span>
                <span>{{ simulation.statistics.servedCustomers }}</span>
              </div>
              <div class="result-item">
                <span>Отказов:</span>
                <span>{{ simulation.statistics.rejectedCustomers }}</span>
              </div>
              <div class="result-item">
                <span>Загрузка серверов:</span>
                <span>{{ formatPercentage(simulation.statistics.serverUtilization) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import apiService from '@/services/api'
import notificationService from '@/services/notifications'
import { formatDate, formatPercentage } from '@/utils'

export default {
  name: 'StatisticsView',

  setup() {
    const simulations = ref([])
    const loading = ref(true)

    const fetchSimulations = async () => {
      loading.value = true;
      try {
        simulations.value = await apiService.getSimulations();
      } catch (error) {
        console.error('Error fetching simulations:', error);
        notificationService.error('Не удалось загрузить данные симуляций');
      } finally {
        loading.value = false;
      }
    }

    onMounted(() => {
      fetchSimulations();
    });

    return {
      simulations,
      loading,
      fetchSimulations,
      formatDate,
      formatPercentage
    }
  },
}
</script>

<style scoped>
/* Стили остаются неизменными */
</style>