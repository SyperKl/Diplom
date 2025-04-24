<template>
  <div class="system-controls">

    <div class="selector-card">
      <div class="selector-header">
        <h3>Тип системы обслуживания</h3>
        <div class="selector-info">
          <button class="info-icon" @click="showInfo = !showInfo" aria-label="Информация о типах систем">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="showInfo" class="info-panel">
        <div class="info-content">
          <h4>Типы систем массового обслуживания</h4>
          <p>Выберите тип СМО в зависимости от ваших задач моделирования:</p>
          <ul>
            <li><strong>Стандартная (M/M/n/m)</strong> - классическая система с обслуживанием FIFO (первым пришел - первым обслужен)</li>
            <li><strong>Приоритетная</strong> - обслуживание по приоритетам клиентов (высокий, средний, низкий)</li>
            <li><strong>LIFO</strong> - обслуживание в обратном порядке (последний пришел - первый обслужен)</li>
            <li><strong>Замкнутая</strong> - ограниченное количество клиентов, возвращающихся в систему</li>
          </ul>
          <button class="close-info" @click="showInfo = false">Закрыть</button>
        </div>
      </div>

      <div class="system-types">
        <div
          v-for="type in systemTypes"
          :key="type.id"
          :class="['system-type-option', { 'active': selectedSystemType === type.id }]"
          @click="selectSystemType(type.id)"
        >
          <div class="option-icon">
            <svg v-if="type.id === 'standard'" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <svg v-else-if="type.id === 'priority'" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <svg v-else-if="type.id === 'lifo'" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="17 7 17 17 7 17"></polyline>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
            <svg v-else-if="type.id === 'closed'" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div class="option-content">
            <div class="option-name">{{ type.name }}</div>
            <div class="option-description">{{ type.description }}</div>
          </div>
        </div>
      </div>


      <transition name="fade">
        <div v-if="selectedSystemType === 'priority'" class="extra-options">
          <h4>Настройки приоритетов</h4>
          <div class="priority-settings">
            <div class="setting-row">
              <label>
                <span class="priority-label high-priority">Высокий приоритет:</span>
                <div class="priority-slider">
                  <input type="range" v-model="prioritySettings.highPriorityRate" min="0" max="100" step="5"
                    @input="updatePrioritySettings" />
                  <span>{{ prioritySettings.highPriorityRate }}%</span>
                </div>
              </label>
            </div>
            <div class="setting-row">
              <label>
                <span class="priority-label medium-priority">Средний приоритет:</span>
                <div class="priority-slider">
                  <input type="range" v-model="prioritySettings.mediumPriorityRate" min="0" max="100" step="5"
                    @input="updatePrioritySettings" />
                  <span>{{ prioritySettings.mediumPriorityRate }}%</span>
                </div>
              </label>
            </div>
            <div class="setting-row">
              <label>
                <span class="priority-label low-priority">Низкий приоритет:</span>
                <div class="priority-slider">
                  <input
                    type="range"
                    :value="lowPriorityRate"
                    disabled
                  />
                  <span>{{ lowPriorityRate }}%</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="selectedSystemType === 'closed'" class="extra-options">
          <h4>Настройки замкнутой системы</h4>
          <div class="closed-settings">
            <div class="setting-row">
              <label>Общее количество клиентов в системе:</label>
              <div class="number-input">
                <button @click="decrementCustomers" :disabled="closedSettings.totalCustomers <= 1 || isRunning" class="input-button">-</button>
                <input type="number" v-model.number="closedSettings.totalCustomers" min="1" max="50" :disabled="isRunning" />
                <button @click="incrementCustomers" :disabled="closedSettings.totalCustomers >= 50 || isRunning" class="input-button">+</button>
              </div>
            </div>
            <div class="setting-row">
              <label>Время возврата клиента в систему (сек):</label>
              <div class="number-input">
                <button @click="decrementReturnTime" :disabled="closedSettings.returnTimeSeconds <= 1 || isRunning" class="input-button">-</button>
                <input type="number" v-model.number="closedSettings.returnTimeSeconds" min="1" max="30" :disabled="isRunning" />
                <button @click="incrementReturnTime" :disabled="closedSettings.returnTimeSeconds >= 30 || isRunning" class="input-button">+</button>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>


    <div class="system-parameters-card">
      <h3>Параметры системы</h3>

      <div class="parameters-grid">
        <div class="parameter-item">
          <label for="servers-input">Количество серверов:</label>
          <div class="number-input">
            <button @click="decrementServers" :disabled="servers <= 1 || isRunning" class="input-button">-</button>
            <input id="servers-input" type="number" v-model.number="servers" min="1" max="10" :disabled="isRunning" />
            <button @click="incrementServers" :disabled="servers >= 10 || isRunning" class="input-button">+</button>
          </div>
        </div>

        <div class="parameter-item">
          <label for="queue-input">Максимальная длина очереди:</label>
          <div class="number-input">
            <button @click="decrementQueue" :disabled="maxQueueLength <= 1 || isRunning" class="input-button">-</button>
            <input id="queue-input" type="number" v-model.number="maxQueueLength" min="1" max="50" :disabled="isRunning" />
            <button @click="incrementQueue" :disabled="maxQueueLength >= 50 || isRunning" class="input-button">+</button>
          </div>
        </div>

        <div class="parameter-item">
          <label for="arrival-input">Интенсивность прихода клиентов:</label>
          <div class="parameter-slider">
            <input id="arrival-input" type="range" v-model.number="arrivalRatePercent" min="1" max="100" step="1" :disabled="isRunning" />
            <span class="parameter-value">{{ arrivalRatePercent }}%</span>
          </div>
        </div>

        <div class="parameter-item">
          <label for="service-input">Интенсивность обслуживания:</label>
          <div class="parameter-slider">
            <input id="service-input" type="range" v-model.number="serviceRatePercent" min="1" max="100" step="1" :disabled="isRunning" />
            <span class="parameter-value">{{ serviceRatePercent }}%</span>
          </div>
        </div>
      </div>

      <div class="parameters-summary">
        <div class="summary-item">
          <div class="summary-label">Нагрузка системы (ρ):</div>
          <div :class="['summary-value', getLoadClass(systemLoad)]">{{ systemLoad.toFixed(2) }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Режим работы:</div>
          <div :class="['summary-value', getLoadClass(systemLoad)]">
            {{ systemLoad < 1 ? 'Недогрузка' : systemLoad === 1 ? 'Критическая нагрузка' : 'Перегрузка' }}
          </div>
        </div>
      </div>
    </div>
    <div class="simulation-controls">
      <button
        @click="toggleSimulation"
        :class="['control-button', isRunning ? 'stop' : 'start']"
      >
        <svg v-if="isRunning" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
        <svg v-else viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        {{ isRunning ? 'Остановить' : 'Запустить' }} симуляцию
      </button>

      <button
        @click="resetSimulation"
        class="control-button reset"
        :disabled="isRunning"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 2v6h6"></path>
          <path d="M3 13a9 9 0 1 0 3-7.7L3 8"></path>
        </svg>
        Сбросить
      </button>

      <button
        @click="saveResults"
        class="control-button save"
        :disabled="isRunning || !hasResults"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Сохранить результаты
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useQueueStore } from '../stores/queue';
import { useChartStore } from '../stores/chart';
import { EVENTS } from '../constants';
import eventBus from '../utils/eventBus';
import notificationService from '../services/notifications';
import apiService from '../services/api';

export default {
  name: 'SystemControls',

  setup() {
    const queueStore = useQueueStore();
    const chartStore = useChartStore();
    const showInfo = ref(false);


    const selectedSystemType = ref(queueStore.systemType || 'standard');
    const servers = ref(queueStore.servers);
    const maxQueueLength = ref(queueStore.maxQueueLength);
    const arrivalRatePercent = ref(queueStore.arrivalRate * 100);
    const serviceRatePercent = ref(queueStore.serviceRate * 100);


    const prioritySettings = ref({
      highPriorityRate: 20,
      mediumPriorityRate: 30
    });


    const closedSettings = ref({
      totalCustomers: 10,
      returnTimeSeconds: 5
    });


    const isRunning = computed(() => queueStore.isRunning);

    const hasResults = computed(() => {
      return queueStore.statistics.totalCustomers > 0;
    });

    const lowPriorityRate = computed(() => {
      const highRate = prioritySettings.value.highPriorityRate;
      const mediumRate = prioritySettings.value.mediumPriorityRate;
      const lowRate = 100 - highRate - mediumRate;
      return lowRate < 0 ? 0 : lowRate;
    });

    const systemLoad = computed(() => {
      const lambda = arrivalRatePercent.value / 100;
      const mu = serviceRatePercent.value / 100;
      const m = servers.value;

      return lambda / (mu * m);
    });


    const incrementServers = () => {
      if (servers.value < 10) {
        servers.value++;
        updateStoreSettings();
      }
    };

    const decrementServers = () => {
      if (servers.value > 1) {
        servers.value--;
        updateStoreSettings();
      }
    };

    // Методы управления очередью
    const incrementQueue = () => {
      if (maxQueueLength.value < 50) {
        maxQueueLength.value++;
        updateStoreSettings();
      }
    };

    const decrementQueue = () => {
      if (maxQueueLength.value > 1) {
        maxQueueLength.value--;
        updateStoreSettings();
      }
    };


    const incrementCustomers = () => {
      if (closedSettings.value.totalCustomers < 50) {
        closedSettings.value.totalCustomers++;
        updateTypeSettings();
      }
    };

    const decrementCustomers = () => {
      if (closedSettings.value.totalCustomers > 1) {
        closedSettings.value.totalCustomers--;
        updateTypeSettings();
      }
    };

    const incrementReturnTime = () => {
      if (closedSettings.value.returnTimeSeconds < 30) {
        closedSettings.value.returnTimeSeconds++;
        updateTypeSettings();
      }
    };

    const decrementReturnTime = () => {
      if (closedSettings.value.returnTimeSeconds > 1) {
        closedSettings.value.returnTimeSeconds--;
        updateTypeSettings();
      }
    };


    const systemTypes = [
      {
        id: 'standard',
        name: 'Стандартная (M/M/n/m)',
        description: 'Классическая система с очередью FIFO',
        icon: '🔄'
      },
      {
        id: 'priority',
        name: 'Приоритетная',
        description: 'Обслуживание с учетом приоритета',
        icon: '⭐'
      },
      {
        id: 'lifo',
        name: 'LIFO',
        description: 'Последний пришел - первый обслужен',
        icon: '📚'
      },
      {
        id: 'closed',
        name: 'Замкнутая',
        description: 'Ограниченное число клиентов в системе',
        icon: '🔄'
      }
    ];

    const selectSystemType = (typeId) => {
      if (isRunning.value) {
        notificationService.warning('Нельзя изменить тип системы во время симуляции', 3000);
        return;
      }

      selectedSystemType.value = typeId;
      updateTypeSettings();
    };


    const getLoadClass = (load) => {
      if (load < 0.7) return 'low-load';
      if (load < 1) return 'medium-load';
      return 'high-load';
    };


    const updatePrioritySettings = () => {

      const total = prioritySettings.value.highPriorityRate + prioritySettings.value.mediumPriorityRate;
      if (total > 100) {

        prioritySettings.value.mediumPriorityRate = 100 - prioritySettings.value.highPriorityRate;
      }
      updateTypeSettings();
    };


    const updateStoreSettings = () => {
      queueStore.servers = servers.value;
      queueStore.maxQueueLength = maxQueueLength.value;
      queueStore.arrivalRate = arrivalRatePercent.value / 100;
      queueStore.serviceRate = serviceRatePercent.value / 100;
      queueStore.initialize();
    };

    const updateTypeSettings = () => {
      let settings = {};

      switch(selectedSystemType.value) {
        case 'priority':
          settings = {
            highPriorityRate: prioritySettings.value.highPriorityRate / 100,
            mediumPriorityRate: prioritySettings.value.mediumPriorityRate / 100,
            lowPriorityRate: lowPriorityRate.value / 100
          };
          break;
        case 'closed':
          settings = {
            totalCustomers: closedSettings.value.totalCustomers,
            customerReturnDelay: closedSettings.value.returnTimeSeconds * 1000
          };
          break;
      }

      queueStore.setSystemType(selectedSystemType.value, settings);
    };


    const toggleSimulation = () => {
      if (!isRunning.value) {

        if (systemLoad.value > 1.5) {
          notificationService.warning('Система сильно перегружена! Рекомендуется увеличить количество серверов или скорость обслуживания.', 5000);
        }


        chartStore.startUpdates();
        eventBus.emit(EVENTS.SIMULATION_STARTED);
      } else {
        chartStore.stopUpdates();
        eventBus.emit(EVENTS.SIMULATION_STOPPED);
      }

      queueStore.toggleSimulation();
    };

    const resetSimulation = () => {
      if (!isRunning.value) {
        queueStore.resetStatistics();
        chartStore.resetData();
        queueStore.initialize();
        notificationService.info('Симуляция сброшена', 2000);
      }
    };

    const saveResults = async () => {
      if (!isRunning.value && hasResults.value) {
        try {
          const response = await apiService.saveSimulation({
            parameters: {
              servers: servers.value,
              maxQueueLength: maxQueueLength.value,
              arrivalRate: arrivalRatePercent.value / 100,
              serviceRate: serviceRatePercent.value / 100,
              systemType: selectedSystemType.value
            },
            statistics: queueStore.statistics
          });

          if (response) {
            notificationService.success('Результаты успешно сохранены');
          }
        } catch (error) {
          console.error('Ошибка при отправке данных:', error);
          notificationService.error('Ошибка соединения с сервером');
        }
      } else if (!hasResults.value) {
        notificationService.warning('Нет данных для сохранения');
      }
    };


    watch(arrivalRatePercent, () => {
      if (!isRunning.value) {
        queueStore.arrivalRate = arrivalRatePercent.value / 100;
      }
    });

    watch(serviceRatePercent, () => {
      if (!isRunning.value) {
        queueStore.serviceRate = serviceRatePercent.value / 100;
      }
    });


    onMounted(() => {

      if (queueStore.systemType === 'priority' && queueStore.systemSettings) {
        prioritySettings.value.highPriorityRate = Math.round(queueStore.systemSettings.highPriorityRate * 100) || 20;
        prioritySettings.value.mediumPriorityRate = Math.round(queueStore.systemSettings.mediumPriorityRate * 100) || 30;
      } else if (queueStore.systemType === 'closed' && queueStore.systemSettings) {
        closedSettings.value.totalCustomers = queueStore.systemSettings.totalCustomers || 10;
        closedSettings.value.returnTimeSeconds =
          queueStore.systemSettings.customerReturnDelay
            ? Math.round(queueStore.systemSettings.customerReturnDelay / 1000)
            : 5;
      }


      eventBus.on(EVENTS.CUSTOMER_REJECTED, () => {
        if (isRunning.value) {
          notificationService.warning('Клиент отклонен: очередь заполнена', 2000);
        }
      });

      updateStoreSettings();
    });

    return {
      showInfo,
      selectedSystemType,
      servers,
      maxQueueLength,
      arrivalRatePercent,
      serviceRatePercent,
      prioritySettings,
      closedSettings,
      isRunning,
      hasResults,
      lowPriorityRate,
      systemLoad,
      systemTypes,
      selectSystemType,
      getLoadClass,
      updatePrioritySettings,
      incrementServers,
      decrementServers,
      incrementQueue,
      decrementQueue,
      incrementCustomers,
      decrementCustomers,
      incrementReturnTime,
      decrementReturnTime,
      toggleSimulation,
      resetSimulation,
      saveResults
    };
  }
};
</script>

<style scoped>
.system-controls {
  margin-bottom: 30px;
}

.selector-card, .system-parameters-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px var(--shadow-color);
  margin-bottom: 20px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.selector-header h3, .system-parameters-card h3 {
  margin: 0;
  color: var(--text-color);
}

.info-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.info-icon:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.05);
}

.info-panel {
  background: var(--bg-color);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  border-left: 4px solid var(--primary-color);
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-content h4 {
  margin-top: 0;
  color: var(--primary-color);
}

.info-content ul {
  padding-left: 20px;
}

.info-content li {
  margin-bottom: 10px;
}

.close-info {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.close-info:hover {
  background-color: var(--primary-hover);
}

.system-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.system-type-option {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  background: var(--bg-color);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.system-type-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px var(--shadow-hover);
}

.system-type-option.active {
  border-color: var(--primary-color);
  background: rgba(66, 185, 131, 0.1);
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--card-bg);
  border-radius: 50%;
  color: var(--primary-color);
}

.option-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 5px;
}

.option-description {
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.extra-options {
  background: var(--bg-color);
  border-radius: 10px;
  padding: 20px;
  margin-top: 20px;
  animation: slideDown 0.3s ease-in-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.extra-options h4 {
  margin-top: 0;
  color: var(--primary-color);
}

.priority-settings, .closed-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.priority-label {
  font-weight: 500;
  color: var(--text-color);
}

.priority-label.high-priority {
  color: var(--error-color);
}

.priority-label.medium-priority {
  color: var(--warning-color);
}

.priority-label.low-priority {
  color: var(--success-color);
}

.priority-slider {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 70%;
}

.priority-slider input[type="range"] {
  flex: 1;
}

.priority-slider span {
  width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.number-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.number-input input {
  width: 60px;
  text-align: center;
  padding: 5px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--card-bg);
  color: var(--text-color);
}

.input-button {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.input-button:hover {
  background-color: var(--primary-hover);
}

.input-button:disabled {
  background-color: var(--secondary-text);
  cursor: not-allowed;
}

.system-parameters-card {
  margin-top: 20px;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.parameter-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.parameter-item label {
  font-weight: 500;
  color: var(--text-color);
}

.parameter-slider {
  display: flex;
  align-items: center;
  gap: 10px;
}

.parameter-slider input[type="range"] {
  flex: 1;
}

.parameter-value {
  width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: var(--secondary-text);
}

.parameters-summary {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-label {
  font-weight: 500;
  color: var(--text-color);
}

.summary-value {
  font-weight: 600;
  color: var(--primary-color);
}

.summary-value.low-load {
  color: var(--success-color);
}

.summary-value.medium-load {
  color: var(--warning-color);
}

.summary-value.high-load {
  color: var(--error-color);
}

.simulation-controls {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.control-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.control-button.start {
  background: var(--primary-color);
  color: white;
}

.control-button.start:hover {
  background-color: var(--primary-hover);
}

.control-button.stop {
  background: var(--error-color);
  color: white;
}

.control-button.stop:hover {
  background-color: #ffffff;
}

.control-button.reset {
  background: var(--secondary-color);
  color: white;
}

.control-button.reset:hover {
  background-color: #1c7ed6;
}

.control-button.save {
  background: var(--accent-color);
  color: white;
}

.control-button.save:hover {
  background-color: #7c3aed;
}

.control-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Анимации */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .system-types {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .parameters-grid {
    grid-template-columns: 1fr;
  }

  .simulation-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-button {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .selector-card, .system-parameters-card {
    padding: 15px;
  }

  .system-types {
    grid-template-columns: 1fr;
  }

  .priority-slider {
    width: 60%;
  }

  .number-input input {
    width: 50px;
  }
}
</style>
