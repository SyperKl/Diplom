/**
 * @typedef {Object} ChartDataPoint
 * @property {string} timestamp - ISO timestamp
 * @property {number} queueLength - Queue length
 * @property {number} serverUtilization - Server utilization (0-1)
 * @property {number} [highPriorityServed] - High priority customers served
 * @property {number} [mediumPriorityServed] - Medium priority customers served
 * @property {number} [lowPriorityServed] - Low priority customers served
 */

/**
 * @typedef {Object} QueueStatistics
 * @property {number} totalCustomers - Total number of customers
 * @property {number} servedCustomers - Number of served customers
 * @property {number} rejectedCustomers - Number of rejected customers
 * @property {number} averageWaitTime - Average wait time in ms
 * @property {number} queueLength - Current queue length
 * @property {number} serverUtilization - Server utilization ratio (0-1)
 * @property {number} [highPriorityServed] - High priority customers served (optional)
 * @property {number} [mediumPriorityServed] - Medium priority customers served (optional)
 * @property {number} [lowPriorityServed] - Low priority customers served (optional)
 * @property {number} [customersInSystem] - Customers in system (for closed systems)
 * @property {number} [customersServed] - Customers served in total (for closed systems)
 */

import { defineStore } from 'pinia';

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    /** @type {QueueStatistics} - Current statistics */
    statistics: {
      totalCustomers: 0,
      servedCustomers: 0,
      rejectedCustomers: 0,
      averageWaitTime: 0,
      queueLength: 0,
      serverUtilization: 0,
      highPriorityServed: 0,
      mediumPriorityServed: 0,
      lowPriorityServed: 0,
      customersInSystem: 0,
      customersServed: 0
    },
    
    /** @type {Array<ChartDataPoint>} - History of data points for charts */
    history: {
      queueLength: [],
      serverUtilization: [],
      timestamps: [],
      highPriorityServed: [],
      mediumPriorityServed: [],
      lowPriorityServed: []
    },
    
    /** @type {number} - Last time chart was updated (ms) */
    lastChartUpdate: 0,
    
    /** @type {number} - Maximum number of history points to keep */
    maxHistoryPoints: 50
  }),
  
  getters: {
    /**
     * Calculate average server load
     * @returns {number} Average load as percentage
     */
    averageServerLoad: (state) => {
      if (state.history.serverUtilization.length === 0) return 0;
      
      const sum = state.history.serverUtilization.reduce((a, b) => a + b, 0);
      return (sum / state.history.serverUtilization.length * 100);
    },
    
    /**
     * Calculate maximum server load
     * @returns {number} Maximum load as percentage
     */
    maxServerLoad: (state) => {
      if (state.history.serverUtilization.length === 0) return 0;
      
      const max = Math.max(...state.history.serverUtilization);
      return max * 100;
    },
    
    /**
     * Calculate average queue length
     * @returns {number} Average queue length
     */
    averageQueueLength: (state) => {
      if (state.history.queueLength.length === 0) return 0;
      
      const sum = state.history.queueLength.reduce((a, b) => a + b, 0);
      return sum / state.history.queueLength.length;
    },
    
    /**
     * Get service efficiency percentage
     * @returns {number} Service efficiency (0-100)
     */
    serviceEfficiency: (state) => {
      const { totalCustomers, servedCustomers } = state.statistics;
      if (totalCustomers === 0) return 0;
      
      return (servedCustomers / totalCustomers) * 100;
    },
    
    /**
     * Get chart data in format for ApexCharts
     * @returns {Object} Formatted chart data
     */
    chartData: (state) => {
      const timestamps = state.history.timestamps.map(t => new Date(t).toLocaleTimeString());
      
      return {
        serverLoad: {
          series: [{
            name: 'Загрузка серверов (%)',
            data: state.history.serverUtilization.map(v => +(v * 100).toFixed(1))
          }],
          categories: timestamps
        },
        queueLength: {
          series: [{
            name: 'Длина очереди',
            data: state.history.queueLength
          }],
          categories: timestamps
        },
        priority: {
          series: [
            {
              name: 'Высокий приоритет',
              data: state.history.highPriorityServed
            },
            {
              name: 'Средний приоритет',
              data: state.history.mediumPriorityServed
            },
            {
              name: 'Низкий приоритет',
              data: state.history.lowPriorityServed
            }
          ],
          categories: timestamps
        }
      };
    },
    
    /**
     * Get number of data points
     * @returns {number} Number of data points
     */
    dataPointsCount: (state) => state.history.timestamps.length
  },
  
  actions: {
    /**
     * Reset statistics to initial state
     */
    resetStatistics() {
      this.statistics = {
        totalCustomers: 0,
        servedCustomers: 0,
        rejectedCustomers: 0,
        averageWaitTime: 0,
        queueLength: 0,
        serverUtilization: 0,
        highPriorityServed: 0,
        mediumPriorityServed: 0,
        lowPriorityServed: 0,
        customersInSystem: 0,
        customersServed: 0
      };
      
      this.history = {
        queueLength: [],
        serverUtilization: [],
        timestamps: [],
        highPriorityServed: [],
        mediumPriorityServed: [],
        lowPriorityServed: []
      };
      
      this.lastChartUpdate = 0;
    },
    
    /**
     * Update current statistics from queue system
     * @param {QueueStatistics} stats - New statistics
     */
    updateCurrentStats(stats) {
      if (!stats) return;
      
      // Update statistics
      this.statistics = { ...this.statistics, ...stats };
    },
    
    /**
     * Add data point to history
     * @returns {boolean} Success
     */
    addDataPoint() {
      try {
        // Prevent too frequent updates
        const now = Date.now();
        if (now - this.lastChartUpdate < 500) {
          return false;
        }
        this.lastChartUpdate = now;
        
        console.log('StatisticsStore: Adding chart data point');
        
        const timestamp = new Date().toISOString();
        
        // Safe number conversion
        const queueLength = Number(this.statistics.queueLength || 0);
        const serverUtilization = Number(this.statistics.serverUtilization || 0);
        const highPriorityServed = Number(this.statistics.highPriorityServed || 0);
        const mediumPriorityServed = Number(this.statistics.mediumPriorityServed || 0);
        const lowPriorityServed = Number(this.statistics.lowPriorityServed || 0);
        
        // Add to history (using spread to create new arrays)
        this.history = {
          queueLength: [...this.history.queueLength, queueLength],
          serverUtilization: [...this.history.serverUtilization, serverUtilization],
          timestamps: [...this.history.timestamps, timestamp],
          highPriorityServed: [...this.history.highPriorityServed, highPriorityServed],
          mediumPriorityServed: [...this.history.mediumPriorityServed, mediumPriorityServed],
          lowPriorityServed: [...this.history.lowPriorityServed, lowPriorityServed]
        };
        
        // Limit history length
        if (this.history.timestamps.length > this.maxHistoryPoints) {
          this.history = {
            queueLength: this.history.queueLength.slice(-this.maxHistoryPoints),
            serverUtilization: this.history.serverUtilization.slice(-this.maxHistoryPoints),
            timestamps: this.history.timestamps.slice(-this.maxHistoryPoints),
            highPriorityServed: this.history.highPriorityServed.slice(-this.maxHistoryPoints),
            mediumPriorityServed: this.history.mediumPriorityServed.slice(-this.maxHistoryPoints),
            lowPriorityServed: this.history.lowPriorityServed.slice(-this.maxHistoryPoints)
          };
        }
        
        console.log('Chart data added:', {
          time: new Date(timestamp).toLocaleTimeString(),
          load: (serverUtilization * 100).toFixed(1) + '%',
          queue: queueLength
        });
        
        return true;
      } catch (error) {
        console.error('Error adding chart data point:', error);
        return false;
      }
    },
    
    /**
     * Export statistics data to CSV
     * @returns {string|null} CSV content or null if no data
     */
    exportToCsv() {
      if (this.history.timestamps.length === 0) {
        return null;
      }
      
      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Время,Загрузка серверов (%),Длина очереди';
      
      // Add headers for priorities if data exists
      if (Math.max(...this.history.highPriorityServed) > 0) {
        csvContent += ',Высокий приоритет,Средний приоритет,Низкий приоритет';
      }
      csvContent += '\n';
      
      for (let i = 0; i < this.history.timestamps.length; i++) {
        const time = new Date(this.history.timestamps[i]).toLocaleTimeString();
        const load = (this.history.serverUtilization[i] * 100).toFixed(1);
        const queue = this.history.queueLength[i];
        
        let row = `${time},${load},${queue}`;
        
        // Add priority data if used
        if (Math.max(...this.history.highPriorityServed) > 0) {
          row += `,${this.history.highPriorityServed[i]},${this.history.mediumPriorityServed[i]},${this.history.lowPriorityServed[i]}`;
        }
        
        csvContent += row + '\n';
      }
      
      return csvContent;
    }
  }
});