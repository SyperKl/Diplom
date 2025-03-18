<template>
  <div class="system-controls">
    <!-- Селектор типа системы -->
    <div class="selector-card">
      <div class="selector-header">
        <h3>Тип системы обслуживания</h3>
        <div class="selector-info">
          <span class="info-icon" @click="showInfo = !showInfo">ℹ️</span>
        </div>
      </div>
      
      <div v-if="showInfo" class="info-panel">
        <div class="info-content">
          <h4>Типы систем массового обслуживания</h4>
          <p>Выберите тип СМО в зависимости от ваших задач моделирования:</p>
          <ul>
            <li><strong>Стандартная (M/M/n/m)</strong> - классическая система с обслуживанием FIFO</li>
            <li><strong>Приоритетная</strong> - обслуживание по приоритетам клиентов</li>
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
          <div class="option-icon">{{ type.icon }}</div>
          <div class="option-content">
            <div class="option-name">{{ type.name }}</div>
            <div class="option-description">{{ type.description }}</div>
          </div>
        </div>
      </div>
      
      <!-- Дополнительные настройки для выбранного типа -->
      <div v-if="selectedSystemType === 'priority'" class="extra-options">
        <h4>Настройки приоритетов</h4>
        <div class="priority-settings">
          <div class="setting-row">
            <label>Доля высокоприоритетных клиентов:</label>
            <div class="priority-slider">
              <input type="range" v-model="prioritySettings.highPriorityRate" min="0" max="100" step="5" />
              <span>{{ prioritySettings.highPriorityRate }}%</span>
            </div>
          </div>
          <div class="setting-row">
            <label>Доля среднеприоритетных клиентов:</label>
            <div class="priority-slider">
              <input type="range" v-model="prioritySettings.mediumPriorityRate" min="0" max="100" step="5" />
              <span>{{ prioritySettings.mediumPriorityRate }}%</span>
            </div>
          </div>
          <div class="setting-row">
            <label>Доля низкоприоритетных клиентов:</label>
            <div class="priority-slider">
              <input 
                type="range" 
                :value="100 - prioritySettings.highPriorityRate - prioritySettings.mediumPriorityRate" 
                disabled 
              />
              <span>{{ 100 - prioritySettings.highPriorityRate - prioritySettings.mediumPriorityRate }}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="selectedSystemType === 'closed'" class="extra-options">
        <h4>Настройки замкнутой системы</h4>
        <div class="closed-settings">
          <div class="setting-row">
            <label>Общее количество клиентов в системе:</label>
            <div class="number-input">
              <button @click="decrementCustomers" :disabled="closedSettings.totalCustomers <= 1" class="input-button">-</button>
              <input type="number" v-model.number="closedSettings.totalCustomers" min="1" max="50" />
              <button @click="incrementCustomers" :disabled="closedSettings.totalCustomers >= 50" class="input-button">+</button>
            </div>
          </div>
          <div class="setting-row">
            <label>Время возврата клиента в систему (сек):</label>
            <div class="number-input">
              <button @click="decrementReturnTime" :disabled="closedSettings.returnTimeSeconds <= 1" class="input-button">-</button>
              <input type="number" v-model.number="closedSettings.returnTimeSeconds" min="1" max="30" />
              <button @click="incrementReturnTime" :disabled="closedSettings.returnTimeSeconds >= 30" class="input-button">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Настройки системы -->
    <div class="system-parameters-card">
      <h3>Параметры системы</h3>
      
      <div class="parameters-grid">
        <div class="parameter-item">
          <label>Количество серверов:</label>
          <div class="number-input">
            <button @click="decrementServers" :disabled="servers <= 1" class="input-button">-</button>
            <input type="number" v-model.number="servers" min="1" max="10" />
            <button @click="incrementServers" :disabled="servers >= 10" class="input-button">+</button>
          </div>
        </div>
        
        <div class="parameter-item">
          <label>Максимальная длина очереди:</label>
          <div class="number-input">
            <button @click="decrementQueue" :disabled="maxQueueLength <= 1" class="input-button">-</button>
            <input type="number" v-model.number="maxQueueLength" min="1" max="50" />
            <button @click="incrementQueue" :disabled="maxQueueLength >= 50" class="input-button">+</button>
          </div>
        </div>
        
        <div class="parameter-item">
          <label>Интенсивность прихода клиентов (%):</label>
          <div class="parameter-slider">
            <input type="range" v-model.number="arrivalRatePercent" min="1" max="100" step="1" />
            <span>{{ arrivalRatePercent }}%</span>
          </div>
        </div>
        
        <div class="parameter-item">
          <label>Интенсивность обслуживания (%):</label>
          <div class="parameter-slider">
            <input type="range" v-model.number="serviceRatePercent" min="1" max="100" step="1" />
            <span>{{ serviceRatePercent }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Управление симуляцией -->
    <div class="simulation-controls">
      <button 
        @click="toggleSimulation" 
        :class="['control-button', isRunning ? 'stop' : 'start']"
      >
        {{ isRunning ? 'Остановить' : 'Запустить' }} симуляцию
      </button>
      
      <button 
        @click="resetSimulation" 
        class="control-button reset"
        :disabled="isRunning"
      >
        Сбросить
      </button>
      
      <button 
        @click="saveResults" 
        class="control-button save"
        :disabled="isRunning || !hasResults"
      >
        Сохранить результаты
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useQueueStore } from '../stores/queue';

export default {
  name: 'SystemControls',
  
  setup() {
    const store = useQueueStore();
    const showInfo = ref(false);
    
    // Базовые настройки
    const selectedSystemType = ref('standard');
    const servers = ref(store.servers);
    const maxQueueLength = ref(store.maxQueueLength);
    const arrivalRatePercent = ref(store.arrivalRate * 100);
    const serviceRatePercent = ref(store.serviceRate * 100);
    
    // Настройки приоритетов
    const prioritySettings = ref({
      highPriorityRate: 20,
      mediumPriorityRate: 30
    });
    
    // Настройки замкнутой системы
    const closedSettings = ref({
      totalCustomers: 10,
      returnTimeSeconds: 5
    });
    
    // Вычисляемые свойства
    const isRunning = computed(() => store.isRunning);
    
    const hasResults = computed(() => {
      return store.statistics.totalCustomers > 0;
    });
    
    // Методы управления серверами
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
    
    // Методы управления замкнутой системой
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
    
    // Выбор типа системы
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
      selectedSystemType.value = typeId;
      updateTypeSettings();
    };
    
    // Обновление настроек хранилища
    const updateStoreSettings = () => {
      store.servers = servers.value;
      store.maxQueueLength = maxQueueLength.value;
      store.arrivalRate = arrivalRatePercent.value / 100;
      store.serviceRate = serviceRatePercent.value / 100;
      store.initialize();
    };
    
    const updateTypeSettings = () => {
      let settings = {};
      
      switch(selectedSystemType.value) {
        case 'priority':
          settings = {
            highPriorityRate: prioritySettings.value.highPriorityRate / 100,
            mediumPriorityRate: prioritySettings.value.mediumPriorityRate / 100,
            lowPriorityRate: (100 - prioritySettings.value.highPriorityRate - prioritySettings.value.mediumPriorityRate) / 100
          };
          break;
        case 'closed':
          settings = {
            totalCustomers: closedSettings.value.totalCustomers,
            customerReturnDelay: closedSettings.value.returnTimeSeconds * 1000
          };
          break;
      }
      
      store.setSystemType(selectedSystemType.value, settings);
    };
    
    // Управление симуляцией
    const toggleSimulation = () => {
      store.toggleSimulation();
    };
    
    const resetSimulation = () => {
      if (!isRunning.value) {
        store.resetStatistics();
        store.initialize();
      }
    };
    
    const saveResults = async () => {
      if (!isRunning.value && hasResults.value) {
        try {
          const response = await fetch('http://localhost:3000/api/simulations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              parameters: {
                servers: servers.value,
                maxQueueLength: maxQueueLength.value,
                arrivalRate: arrivalRatePercent.value / 100,
                serviceRate: serviceRatePercent.value / 100,
                systemType: selectedSystemType.value
              },
              statistics: store.statistics
            })
          });
          
          if (response.ok) {
            alert('Результаты успешно сохранены');
          } else {
            alert('Ошибка при сохранении результатов');
          }
        } catch (error) {
          console.error('Ошибка при отправке данных:', error);
          alert('Ошибка соединения с сервером');
        }
      }
    };
    
    // Отслеживание изменений параметров для обновления хранилища
    watch(arrivalRatePercent, () => {
      store.arrivalRate = arrivalRatePercent.value / 100;
    });
    
    watch(serviceRatePercent, () => {
      store.serviceRate = serviceRatePercent.value / 100;
    });
    
    // Инициализация
    updateStoreSettings();
    
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
      systemTypes,
      selectSystemType,
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
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.info-icon:hover {
  opacity: 1;
}

.info-panel {
  background: var(--bg-color);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  border-left: 4px solid var(--primary-color);
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
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--card-bg);
  border-radius: 50%;
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
}

.extra-options h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: var(--text-color);
}

.setting-row, .parameter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.setting-row label, .parameter-item label {
  flex: 1;
  color: var(--text-color);
}

.priority-slider, .parameter-slider {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.priority-slider input, .parameter-slider input {
  flex: 1;
}

.number-input {
  display: flex;
  align-items: center;
}

.number-input button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.number-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.number-input input {
  width: 60px;
  text-align: center;
  margin: 0 10px;
  padding: 5px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.simulation-controls {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.control-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-button.start {
  background: var(--primary-color);
  color: white;
}

.control-button.stop {
  background: #e74c3c;
  color: white;
}

.control-button.reset {
  background: #f39c12;
  color: white;
}

.control-button.save {
  background: #3498db;
  color: white;
}

.control-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .system-types {
    grid-template-columns: 1fr;
  }
  
  .setting-row, .parameter-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .priority-slider, .parameter-slider, .number-input {
    width: 100%;
  }
  
  .parameters-grid {
    grid-template-columns: 1fr;
  }
  
  .simulation-controls {
    flex-direction: column;
  }
}
</style>