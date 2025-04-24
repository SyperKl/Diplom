/**
 * @typedef {'standard'|'priority'|'lifo'|'closed'} SystemType
 */

/**
 * @typedef {Object} SystemTypeOption
 * @property {SystemType} id
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 */

/**
 * @typedef {Object} ThemeSettings
 * @property {boolean} isDarkMode
 */

import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    /** @type {ThemeSettings} */
    theme: {
      isDarkMode: false
    },

    /** @type {boolean}  */
    showHelp: false,

    /** @type {SystemType}  */
    selectedSystemType: 'standard',

    /** @type {Array<SystemTypeOption>}  */
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

    /** @type {Object}  */
    prioritySettings: {
      highPriorityRate: 20,
      mediumPriorityRate: 30
    },

    /** @type {Object}  */
    closedSettings: {
      totalCustomers: 10,
      returnTimeSeconds: 5
    },

    /** @type {boolean}  */
    chartsAutoUpdate: false
  }),

  getters: {
    /**
     *
     * @returns {SystemTypeOption}
     */
    selectedSystemTypeInfo: (state) => {
      return state.systemTypes.find(type => type.id === state.selectedSystemType) || state.systemTypes[0];
    },

    /**
     *
     * @returns {number}
     */
    lowPriorityRate: (state) => {
      return 100 - state.prioritySettings.highPriorityRate - state.prioritySettings.mediumPriorityRate;
    },

    /**
     *
     * @returns {Object}
     */
    normalizedPrioritySettings: (state) => ({
      highPriorityRate: state.prioritySettings.highPriorityRate / 100,
      mediumPriorityRate: state.prioritySettings.mediumPriorityRate / 100,
      lowPriorityRate: (100 - state.prioritySettings.highPriorityRate - state.prioritySettings.mediumPriorityRate) / 100
    }),

    /**
     *
     * @returns {Object}
     */
    normalizedClosedSettings: (state) => ({
      totalCustomers: state.closedSettings.totalCustomers,
      customerReturnDelay: state.closedSettings.returnTimeSeconds * 1000
    })
  },

  actions: {
    /**
     *
     * @returns {boolean}
     */
    toggleDarkMode() {
      this.theme.isDarkMode = !this.theme.isDarkMode;


      document.documentElement.classList.toggle('dark-theme', this.theme.isDarkMode);


      localStorage.setItem('darkMode', this.theme.isDarkMode);

      return this.theme.isDarkMode;
    },

    /**
     *
     */
    loadThemeSettings() {
      const savedMode = localStorage.getItem('darkMode');

      if (savedMode !== null) {
        this.theme.isDarkMode = savedMode === 'true';
      } else {

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.theme.isDarkMode = prefersDark;
      }


      document.documentElement.classList.toggle('dark-theme', this.theme.isDarkMode);
    },


    toggleHelp() {
      this.showHelp = !this.showHelp;
    },

    /**
     *
     * @param {SystemType} typeId - System type to select
     */
    selectSystemType(typeId) {
      if (this.systemTypes.some(type => type.id === typeId)) {
        this.selectedSystemType = typeId;
      }
    },

    /**
     *
     * @param {Object} settings
     */
    updatePrioritySettings(settings) {

      if (settings.highPriorityRate !== undefined) {
        settings.highPriorityRate = Math.min(100, Math.max(0, settings.highPriorityRate));
      }

      if (settings.mediumPriorityRate !== undefined) {
        settings.mediumPriorityRate = Math.min(100, Math.max(0, settings.mediumPriorityRate));
      }


      const total = (settings.highPriorityRate || this.prioritySettings.highPriorityRate) +
                    (settings.mediumPriorityRate || this.prioritySettings.mediumPriorityRate);

      if (total > 100) {

        if (settings.mediumPriorityRate !== undefined) {
          settings.mediumPriorityRate = Math.max(0, 100 - (settings.highPriorityRate || this.prioritySettings.highPriorityRate));
        } else if (settings.highPriorityRate !== undefined) {
          settings.highPriorityRate = Math.max(0, 100 - this.prioritySettings.mediumPriorityRate);
        }
      }

      this.prioritySettings = { ...this.prioritySettings, ...settings };
    },

    /**
     *
     * @param {Object} settings
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
     *
     * @returns {boolean}
     */
    toggleChartsAutoUpdate() {
      this.chartsAutoUpdate = !this.chartsAutoUpdate;
      return this.chartsAutoUpdate;
    }
  }
});
