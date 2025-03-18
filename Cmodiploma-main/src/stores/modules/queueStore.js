/**
 * @typedef {Object} QueueSystemParams
 * @property {number} servers - Number of servers in the system
 * @property {number} maxQueueLength - Maximum queue length
 * @property {number} arrivalRate - Customer arrival rate (0-1)
 * @property {number} serviceRate - Service processing rate (0-1)
 */

/**
 * @typedef {Object} QueueStatistics
 * @property {number} totalCustomers - Total number of customers
 * @property {number} servedCustomers - Number of served customers
 * @property {number} rejectedCustomers - Number of rejected customers
 * @property {number} averageWaitTime - Average wait time in ms
 * @property {number} queueLength - Current queue length
 * @property {number} serverUtilization - Server utilization ratio (0-1)
 */

/**
 * @typedef {Object} SystemSettings
 * @property {number} [highPriorityRate] - High priority customer rate (0-1)
 * @property {number} [mediumPriorityRate] - Medium priority customer rate (0-1)
 * @property {number} [lowPriorityRate] - Low priority customer rate (0-1)
 * @property {number} [totalCustomers] - Total number of customers in closed system
 * @property {number} [customerReturnDelay] - Delay before customer returns (closed system)
 */

import { defineStore } from 'pinia';
import { QueueSystemFactory } from '@/services/QueueSystemFactory';
import { useStatisticsStore } from './statisticsStore';
import eventBus from '@/utils/eventBus';
import { EVENTS } from '@/constants';

export const useQueueStore = defineStore('queue', {
  state: () => ({
    /**
     * System configuration
     * @type {QueueSystemParams}
     */
    config: {
      servers: 2,
      maxQueueLength: 10,
      arrivalRate: 0.3,
      serviceRate: 0.2
    },
    
    /** @type {string} - Type of queue system */
    systemType: 'standard',
    
    /** @type {SystemSettings} */
    systemSettings: {},
    
    /** @type {boolean} - Is simulation running */
    isRunning: false,
    
    /** @type {Object|null} - Queue system instance */
    queueSystem: null,
    
    /** @type {Array} - Current queue (for backward compatibility) */
    queue: [],
    
    /** @type {Array<boolean>} - Server status array (for backward compatibility) */
    serverStatus: [],
    
    /** @type {Object} - Simulation interval timers */
    intervals: {
      simulation: null,
      charts: null
    }
  }),
  
  getters: {
    /**
     * Get current system parameters
     * @returns {QueueSystemParams}
     */
    systemParams: (state) => state.config,
    
    /**
     * Get current statistics
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
     * Initialize queue system
     */
    initialize() {
      console.log('QueueStore: Initializing with type:', this.systemType);
      
      // Create queue system instance through factory
      this.queueSystem = QueueSystemFactory.createQueueSystem(this.systemType, {
        servers: this.config.servers,
        maxQueueLength: this.config.maxQueueLength,
        arrivalRate: this.config.arrivalRate,
        serviceRate: this.config.serviceRate,
        ...this.systemSettings
      });
      
      // Initialize system
      this.queueSystem.initialize();
      
      // Update references for backward compatibility
      this.queue = this.queueSystem.queue || [];
      this.serverStatus = this.queueSystem.serverStatus || [];
      
      // Stop all intervals
      this.stopAllIntervals();
      
      // Reset statistics
      const statisticsStore = useStatisticsStore();
      statisticsStore.resetStatistics();
    },
    
    /**
     * Set system type and settings
     * @param {string} type - System type
     * @param {SystemSettings} settings - System settings
     */
    setSystemType(type, settings = {}) {
      this.systemType = type;
      this.systemSettings = settings;
      
      if (!this.isRunning) {
        this.initialize();
      }
    },
    
    /**
     * Update system configuration
     * @param {Partial<QueueSystemParams>} config - New configuration
     */
    updateConfig(config) {
      this.config = { ...this.config, ...config };
      
      if (!this.isRunning) {
        this.initialize();
      }
    },
    
    /**
     * Add customer to the system
     * @param {string} [priority='medium'] - Customer priority
     * @returns {boolean} Success
     */
    addCustomer(priority) {
      try {
        console.log('QueueStore: Adding customer');
        
        let result;
        
        // For priority system, determine priority if not provided
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
        
        // Add customer with or without priority
        result = priority 
          ? this.queueSystem.addCustomer(priority)
          : this.queueSystem.addCustomer();
        
        // Update backward compatibility references
        this.queue = this.queueSystem.queue || [];
        this.serverStatus = this.queueSystem.serverStatus || [];
        
        // Update stats in statistics store
        const statisticsStore = useStatisticsStore();
        statisticsStore.updateCurrentStats(this.queueSystem.statistics);
        
        // Emit event if customer was rejected
        if (!result && this.queueSystem.statistics.rejectedCustomers > 0) {
          eventBus.emit(EVENTS.CUSTOMER_REJECTED);
        }
        
        return result;
      } catch (error) {
        console.error('Error in addCustomer:', error);
        return false;
      }
    },
    
    /**
     * Process server (complete current service)
     */
    processServer() {
      try {
        console.log('QueueStore: Processing servers');
        
        this.queueSystem.processServer();
        
        // Update backward compatibility references
        this.queue = this.queueSystem.queue || [];
        this.serverStatus = this.queueSystem.serverStatus || [];
        
        // Update stats in statistics store
        const statisticsStore = useStatisticsStore();
        statisticsStore.updateCurrentStats(this.queueSystem.statistics);
      } catch (error) {
        console.error('Error in processServer:', error);
      }
    },
    
    /**
     * Start simulation
     */
    startSimulation() {
      this.stopAllIntervals();
      this.isRunning = true;
      
      // Emit event
      eventBus.emit(EVENTS.SIMULATION_STARTED);
      
      // Start simulation interval
      this.intervals.simulation = setInterval(() => {
        if (!this.isRunning) {
          this.stopAllIntervals();
          return;
        }
        
        // Add customer based on arrival rate
        if (Math.random() < this.config.arrivalRate) {
          this.addCustomer();
        }
        
        // Process server based on service rate
        if (Math.random() < this.config.serviceRate) {
          this.processServer();
        }
      }, 1000);
      
      // Start chart updates
      this.startChartUpdates();
    },
    
    /**
     * Stop all intervals
     */
    stopAllIntervals() {
      // Stop simulation interval
      if (this.intervals.simulation) {
        clearInterval(this.intervals.simulation);
        this.intervals.simulation = null;
      }
      
      // Stop chart updates
      this.stopChartUpdates();
    },
    
    /**
     * Start chart update interval
     */
    startChartUpdates() {
      // First ensure previous interval is stopped
      this.stopChartUpdates();
      
      // Update charts every 2 seconds
      this.intervals.charts = setInterval(() => {
        if (!this.isRunning) {
          this.stopChartUpdates();
          return;
        }
        
        const statisticsStore = useStatisticsStore();
        statisticsStore.addDataPoint();
      }, 2000);
    },
    
    /**
     * Stop chart update interval
     */
    stopChartUpdates() {
      if (this.intervals.charts) {
        clearInterval(this.intervals.charts);
        this.intervals.charts = null;
      }
    },
    
    /**
     * Toggle simulation (start/stop)
     */
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