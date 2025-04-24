/**
 * @typedef {Object} QueueSystemParams
 * @property {number} servers
 * @property {number} maxQueueLength
 * @property {number} arrivalRate
 * @property {number} serviceRate
 */

/**
 * @typedef {Object} QueueStatistics
 * @property {number} totalCustomers
 * @property {number} servedCustomers
 * @property {number} rejectedCustomers
 * @property {number} averageWaitTime
 * @property {number} queueLength
 * @property {number} serverUtilization
 */

/**
 * @typedef {Object} SystemSettings
 * @property {number} [highPriorityRate]
 * @property {number} [mediumPriorityRate]
 * @property {number} [lowPriorityRate]
 * @property {number} [totalCustomers]
 * @property {number} [customerReturnDelay]
 */

import { defineStore } from 'pinia';
import { QueueSystemFactory } from '@/services/QueueSystemFactory';
import { useStatisticsStore } from './statisticsStore';
import eventBus from '@/utils/eventBus';
import { EVENTS } from '@/constants';

export const useQueueStore = defineStore('queue', {
  state: () => ({
    /**
     *
     * @type {QueueSystemParams}
     */
    config: {
      servers: 2,
      maxQueueLength: 10,
      arrivalRate: 0.3,
      serviceRate: 0.2
    },

    /** @type {string} */
    systemType: 'standard',

    /** @type {SystemSettings} */
    systemSettings: {},

    /** @type {boolean}  */
    isRunning: false,

    /** @type {Object|null}  */
    queueSystem: null,

    /** @type {Array}  */
    queue: [],

    /** @type {Array<boolean>}  */
    serverStatus: [],

    /** @type {Object}  */
    intervals: {
      simulation: null,
      charts: null
    }
  }),

  getters: {
    /**
     *
     * @returns {QueueSystemParams}
     */
    systemParams: (state) => state.config,

    /**
     *
     * @returns {QueueStatistics}
     */
    statistics: (state) => state.queueSystem?.statistics || {
      totalCustomers: 0,
      servedCustomers: 0,
      rejectedCustomers: 0,
      averageWaitTime: 0,
      queueLength: 0,
      serverUtilization: 0
    }
  },

  actions: {
    /**
     *
     */
    initialize() {
      console.log('QueueStore: Initializing with type:', this.systemType);


      this.queueSystem = QueueSystemFactory.createQueueSystem(this.systemType, {
        servers: this.config.servers,
        maxQueueLength: this.config.maxQueueLength,
        arrivalRate: this.config.arrivalRate,
        serviceRate: this.config.serviceRate,
        ...this.systemSettings
      });


      this.queueSystem.initialize();


      this.queue = this.queueSystem.queue || [];
      this.serverStatus = this.queueSystem.serverStatus || [];


      this.stopAllIntervals();


      const statisticsStore = useStatisticsStore();
      statisticsStore.resetStatistics();
    },

    /**
     *
     * @param {string} type
     * @param {SystemSettings} settings
     */
    setSystemType(type, settings = {}) {
      this.systemType = type;
      this.systemSettings = settings;

      if (!this.isRunning) {
        this.initialize();
      }
    },

    /**
     *
     * @param {Partial<QueueSystemParams>} config
     */
    updateConfig(config) {
      this.config = { ...this.config, ...config };

      if (!this.isRunning) {
        this.initialize();
      }
    },

    /**
     *
     * @param {string} [priority='medium']
     * @returns {boolean} Success
     */
    addCustomer(priority) {
      try {
        console.log('QueueStore: Adding customer');

        let result;


        if (this.systemType === 'priority' && !priority) {
          const rand = Math.random();

          if (rand < this.systemSettings.highPriorityRate) {
            priority = 'high';
          } else if (rand < this.systemSettings.highPriorityRate + this.systemSettings.mediumPriorityRate) {
            priority = 'medium';
          } else {
            priority = 'low';
          }
        }


        result = priority
          ? this.queueSystem.addCustomer(priority)
          : this.queueSystem.addCustomer();


        this.queue = this.queueSystem.queue || [];
        this.serverStatus = this.queueSystem.serverStatus || [];


        const statisticsStore = useStatisticsStore();
        statisticsStore.updateCurrentStats(this.queueSystem.statistics);


        if (!result && this.queueSystem.statistics.rejectedCustomers > 0) {
          eventBus.emit(EVENTS.CUSTOMER_REJECTED);
        }

        return result;
      } catch (error) {
        console.error('Error in addCustomer:', error);
        return false;
      }
    },
    processServer() {
      try {
        console.log('QueueStore: Processing servers');

        this.queueSystem.processServer();


        this.queue = this.queueSystem.queue || [];
        this.serverStatus = this.queueSystem.serverStatus || [];


        const statisticsStore = useStatisticsStore();
        statisticsStore.updateCurrentStats(this.queueSystem.statistics);
      } catch (error) {
        console.error('Error in processServer:', error);
      }
    },
    startSimulation() {
      this.stopAllIntervals();
      this.isRunning = true;
      eventBus.emit(EVENTS.SIMULATION_STARTED);
      this.intervals.simulation = setInterval(() => {
        if (!this.isRunning) {
          this.stopAllIntervals();
          return;
        }
        if (Math.random() < this.config.arrivalRate) {
          this.addCustomer();
        }
        if (Math.random() < this.config.serviceRate) {
          this.processServer();
        }
      }, 1000);
      this.startChartUpdates();
    },
    stopAllIntervals() {
      if (this.intervals.simulation) {
        clearInterval(this.intervals.simulation);
        this.intervals.simulation = null;
      }
      this.stopChartUpdates();
    },
    startChartUpdates() {
      this.stopChartUpdates();
      this.intervals.charts = setInterval(() => {
        if (!this.isRunning) {
          this.stopChartUpdates();
          return;
        }

        const statisticsStore = useStatisticsStore();
        statisticsStore.addDataPoint();
      }, 2000);
    },
    stopChartUpdates() {
      if (this.intervals.charts) {
        clearInterval(this.intervals.charts);
        this.intervals.charts = null;
      }
    },
    toggleSimulation() {
      try {
        console.log('QueueStore: Toggle simulation from', this.isRunning, 'to', !this.isRunning);

        if (this.isRunning) {
          this.isRunning = false;
          this.stopAllIntervals();
          eventBus.emit(EVENTS.SIMULATION_STOPPED);
        } else {
          this.startSimulation();
        }
      } catch (error) {
        console.error('Error toggling simulation:', error);
        this.isRunning = false;
        this.stopAllIntervals();
      }
    }
  }
});
