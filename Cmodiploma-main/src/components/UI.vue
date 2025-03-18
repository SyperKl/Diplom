<template>
  <div class="system-type-selector">
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
  </div>
</template>

<script>
export default {
  name: 'SystemTypeSelector',
  
  data() {
    return {
      showInfo: false,
      selectedSystemType: 'standard',
      systemTypes: [
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
      ],
      prioritySettings: {
        highPriorityRate: 20,
        mediumPriorityRate: 30
      },
      closedSettings: {
        totalCustomers: 10,
        returnTimeSeconds: 5
      }
    };
  },
  
  methods: {
    selectSystemType(typeId) {
      this.selectedSystemType = typeId;
      this.$emit('system-type-changed', {
        type: typeId,
        settings: this.getTypeSettings()
      });
    },
    
    getTypeSettings() {
      switch(this.selectedSystemType) {
        case 'priority':
          return {
            highPriorityRate: this.prioritySettings.highPriorityRate / 100,
            mediumPriorityRate: this.prioritySettings.mediumPriorityRate / 100,
            lowPriorityRate: (100 - this.prioritySettings.highPriorityRate - this.prioritySettings.mediumPriorityRate) / 100
          };
        case 'closed':
          return {
            totalCustomers: this.closedSettings.totalCustomers,
            customerReturnDelay: this.closedSettings.returnTimeSeconds * 1000
          };
        default:
          return {};
      }
    },
    
    decrementCustomers() {
      if (this.closedSettings.totalCustomers > 1) {
        this.closedSettings.totalCustomers--;
      }
    },
    
    incrementCustomers() {
      if (this.closedSettings.totalCustomers < 50) {
        this.closedSettings.totalCustomers++;
      }
    },
    
    decrementReturnTime() {
      if (this.closedSettings.returnTimeSeconds > 1) {
        this.closedSettings.returnTimeSeconds--;
      }
    },
    
    incrementReturnTime() {
      if (this.closedSettings.returnTimeSeconds < 30) {
        this.closedSettings.returnTimeSeconds++;
      }
    }
  },
  
  watch: {
    'prioritySettings.highPriorityRate'(newVal) {
      // Убедимся, что сумма не превышает 100%
      if (newVal + this.prioritySettings.mediumPriorityRate > 100) {
        this.prioritySettings.mediumPriorityRate = 100 - newVal;
      }
      this.$emit('system-type-changed', {
        type: this.selectedSystemType,
        settings: this.getTypeSettings()
      });
    },
    
    'prioritySettings.mediumPriorityRate'(newVal) {
      // Убедимся, что сумма не превышает 100%
      if (this.prioritySettings.highPriorityRate + newVal > 100) {
        this.prioritySettings.highPriorityRate = 100 - newVal;
      }
      this.$emit('system-type-changed', {
        type: this.selectedSystemType,
        settings: this.getTypeSettings()
      });
    },
    
    'closedSettings.totalCustomers'() {
      this.$emit('system-type-changed', {
        type: this.selectedSystemType,
        settings: this.getTypeSettings()
      });
    },
    
    'closedSettings.returnTimeSeconds'() {
      this.$emit('system-type-changed', {
        type: this.selectedSystemType,
        settings: this.getTypeSettings()
      });
    }
  }
};
</script>

<style scoped>
.system-type-selector {
  margin-bottom: 30px;
}

.selector-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 15px var(--shadow-color);
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.selector-header h3 {
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

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.setting-row label {
  flex: 1;
  color: var(--text-color);
}

.priority-slider {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.priority-slider input {
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

@media (max-width: 768px) {
  .system-types {
    grid-template-columns: 1fr;
  }
  
  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .priority-slider, .number-input {
    width: 100%;
  }
}
</style>