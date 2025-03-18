/**
 * @typedef {'standard'|'priority'|'lifo'|'closed'} SystemType
 */

/**
 * @typedef {Object} SystemTypeOption
 * @property {SystemType} id - System type ID
 * @property {string} name - Display name
 * @property {string} description - Brief description
 * @property {string} icon - Emoji icon
 */

/**
 * @typedef {Object} ThemeSettings
 * @property {boolean} isDarkMode - Is dark mode active
 */

import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    /** @type {ThemeSettings} */
    theme: {
      isDarkMode: false
    },
    
    /** @type {boolean} - Is help info panel visible */
    showHelp: false,
    
    /** @type {SystemType} - Selected system type */
    selectedSystemType: 'standard',
    
    /** @type {Array<SystemTypeOption>} - Available system types */
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
    
    /** @type {Object} - Priority system settings */
    prioritySettings: {
      highPriorityRate: 20,
      mediumPriorityRate: 30
    },
    
    /** @type {Object} - Closed system settings */
    closedSettings: {
      totalCustomers: 10,
      returnTimeSeconds: 5
    },
    
    /** @type {boolean} - Is auto-update active for charts */
    chartsAutoUpdate: false
  }),
  
  getters: {
    /**
     * Get selected system type information
     * @returns {SystemTypeOption}
     */
    selectedSystemTypeInfo: (state) => {
      return state.systemTypes.find(type => type.id === state.selectedSystemType) || state.systemTypes[0];
    },
    
    /**
     * Calculate low priority rate from high and medium
     * @returns {number}
     */
    lowPriorityRate: (state) => {
      return 100 - state.prioritySettings.highPriorityRate - state.prioritySettings.mediumPriorityRate;
    },
    
    /**
     * Get current priority settings in decimal format
     * @returns {Object}
     */
    normalizedPrioritySettings: (state) => ({
      highPriorityRate: state.prioritySettings.highPriorityRate / 100,
      mediumPriorityRate: state.prioritySettings.mediumPriorityRate / 100,
      lowPriorityRate: (100 - state.prioritySettings.highPriorityRate - state.prioritySettings.mediumPriorityRate) / 100
    }),
    
    /**
     * Get current closed system settings with proper units
     * @returns {Object}
     */
    normalizedClosedSettings: (state) => ({
      totalCustomers: state.closedSettings.totalCustomers,
      customerReturnDelay: state.closedSettings.returnTimeSeconds * 1000 // convert to ms
    })
  },
  
  actions: {
    /**
     * Toggle dark mode
     * @returns {boolean} New dark mode state
     */
    toggleDarkMode() {
      this.theme.isDarkMode = !this.theme.isDarkMode;
      
      // Update document element class for CSS
      document.documentElement.classList.toggle('dark-theme', this.theme.isDarkMode);
      
      // Save preference to local storage
      localStorage.setItem('darkMode', this.theme.isDarkMode);
      
      return this.theme.isDarkMode;
    },
    
    /**
     * Load theme settings from localStorage
     */
    loadThemeSettings() {
      const savedMode = localStorage.getItem('darkMode');
      
      if (savedMode !== null) {
        this.theme.isDarkMode = savedMode === 'true';
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme.isDarkMode = prefersDark;
      }
      
      // Apply theme
      document.documentElement.classList.toggle('dark-theme', this.theme.isDarkMode);
    },
    
    /**
     * Toggle help information visibility
     */
    toggleHelp() {
      this.showHelp = !this.showHelp;
    },
    
    /**
     * Select system type
     * @param {SystemType} typeId - System type to select
     */
    selectSystemType(typeId) {
      if (this.systemTypes.some(type => type.id === typeId)) {
        this.selectedSystemType = typeId;
      }
    },
    
    /**
     * Update priority settings
     * @param {Object} settings - New settings
     */
    updatePrioritySettings(settings) {
      // Ensure values stay within valid range
      if (settings.highPriorityRate !== undefined) {
        settings.highPriorityRate = Math.min(100, Math.max(0, settings.highPriorityRate));
      }
      
      if (settings.mediumPriorityRate !== undefined) {
        settings.mediumPriorityRate = Math.min(100, Math.max(0, settings.mediumPriorityRate));
      }
      
      // Ensure total doesn't exceed 100%
      const total = (settings.highPriorityRate || this.prioritySettings.highPriorityRate) + 
                    (settings.mediumPriorityRate || this.prioritySettings.mediumPriorityRate);
      
      if (total > 100) {
        // Adjust medium priority rate if total exceeds 100%
        if (settings.mediumPriorityRate !== undefined) {
          settings.mediumPriorityRate = Math.max(0, 100 - (settings.highPriorityRate || this.prioritySettings.highPriorityRate));
        } else if (settings.highPriorityRate !== undefined) {
          settings.highPriorityRate = Math.max(0, 100 - this.prioritySettings.mediumPriorityRate);
        }
      }
      
      this.prioritySettings = { ...this.prioritySettings, ...settings };
    },
    
    /**
     * Update closed system settings
     * @param {Object} settings - New settings
     */
    updateClosedSettings(settings) {
      if (settings.totalCustomers !== undefined) {
        settings.totalCustomers = Math.min(50, Math.max(1, settings.totalCustomers));
      }
      
      if (settings.returnTimeSeconds !== undefined) {
        settings.returnTimeSeconds = Math.min(30, Math.max(1, settings.returnTimeSeconds));
      }
      
      this.closedSettings = { ...this.closedSettings, ...settings };
    },
    
    /**
     * Toggle charts auto-update
     * @returns {boolean} New auto-update state
     */
    toggleChartsAutoUpdate() {
      this.chartsAutoUpdate = !this.chartsAutoUpdate;
      return this.chartsAutoUpdate;
    }
  }
});