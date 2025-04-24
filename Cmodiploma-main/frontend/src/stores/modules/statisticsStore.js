/**
 * @typedef {Object} ChartDataPoint
 * @property {string} timestamp
 * @property {number} queueLength
 * @property {number} serverUtilization
 * @property {number} [highPriorityServed]
 * @property {number} [mediumPriorityServed]
 * @property {number} [lowPriorityServed]
 */

/**
 * @typedef {Object} QueueStatistics
 * @property {number} totalCustomers
 * @property {number} servedCustomers
 * @property {number} rejectedCustomers
 * @property {number} averageWaitTime
 * @property {number} queueLength
 * @property {number} serverUtilization
 * @property {number} [highPriorityServed]
 * @property {number} [mediumPriorityServed]
 * @property {number} [lowPriorityServed]
 * @property {number} [customersInSystem]
 * @property {number} [customersServed]
 */

import { defineStore } from 'pinia';

export const useStatisticsStore = defineStore('statistics', {
  state: () => ({
    /** @type {QueueStatistics} */
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

    /** @type {Array<ChartDataPoint>}  */
    history: {
      queueLength: [],
      serverUtilization: [],
      timestamps: [],
      highPriorityServed: [],
      mediumPriorityServed: [],
      lowPriorityServed: []
    },

    /** @type {number}  */
    lastChartUpdate: 0,

    /** @type {number}  */
    maxHistoryPoints: 50
  }),

  getters: {
    /**
     *
     * @returns {number}
     */
    averageServerLoad: (state) => {
      if (state.history.serverUtilization.length === 0) return 0;

      const sum = state.history.serverUtilization.reduce((a, b) => a + b, 0);
      return (sum / state.history.serverUtilization.length * 100);
    },

    /**
     *
     * @returns {number}
     */
    maxServerLoad: (state) => {
      if (state.history.serverUtilization.length === 0) return 0;

      const max = Math.max(...state.history.serverUtilization);
      return max * 100;
    },

    /**
     *
     * @returns {number}
     */
    averageQueueLength: (state) => {
      if (state.history.queueLength.length === 0) return 0;

      const sum = state.history.queueLength.reduce((a, b) => a + b, 0);
      return sum / state.history.queueLength.length;
    },

    /**
     *
     * @returns {number}
     */
    serviceEfficiency: (state) => {
      const { totalCustomers, servedCustomers } = state.statistics;
      if (totalCustomers === 0) return 0;

      return (servedCustomers / totalCustomers) * 100;
    },

    /**
     *
     * @returns {Object}
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
     *
     * @returns {number}
     */
    dataPointsCount: (state) => state.history.timestamps.length
  },

  actions: {
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
     *
     * @param {QueueStatistics} stats
     */
    updateCurrentStats(stats) {
      if (!stats) return;


      this.statistics = { ...this.statistics, ...stats };
    },

    /**
     *
     * @returns {boolean}
     */
    addDataPoint() {
      try {

        const now = Date.now();
        if (now - this.lastChartUpdate < 500) {
          return false;
        }
        this.lastChartUpdate = now;

        console.log('StatisticsStore: Adding chart data point');

        const timestamp = new Date().toISOString();


        const queueLength = Number(this.statistics.queueLength || 0);
        const serverUtilization = Number(this.statistics.serverUtilization || 0);
        const highPriorityServed = Number(this.statistics.highPriorityServed || 0);
        const mediumPriorityServed = Number(this.statistics.mediumPriorityServed || 0);
        const lowPriorityServed = Number(this.statistics.lowPriorityServed || 0);


        this.history = {
          queueLength: [...this.history.queueLength, queueLength],
          serverUtilization: [...this.history.serverUtilization, serverUtilization],
          timestamps: [...this.history.timestamps, timestamp],
          highPriorityServed: [...this.history.highPriorityServed, highPriorityServed],
          mediumPriorityServed: [...this.history.mediumPriorityServed, mediumPriorityServed],
          lowPriorityServed: [...this.history.lowPriorityServed, lowPriorityServed]
        };


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
     *
     * @returns {string|null}
     */
    exportToCsv() {
      if (this.history.timestamps.length === 0) {
        return null;
      }

      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'Время,Загрузка серверов (%),Длина очереди';


      if (Math.max(...this.history.highPriorityServed) > 0) {
        csvContent += ',Высокий приоритет,Средний приоритет,Низкий приоритет';
      }
      csvContent += '\n';

      for (let i = 0; i < this.history.timestamps.length; i++) {
        const time = new Date(this.history.timestamps[i]).toLocaleTimeString();
        const load = (this.history.serverUtilization[i] * 100).toFixed(1);
        const queue = this.history.queueLength[i];

        let row = `${time},${load},${queue}`;


        if (Math.max(...this.history.highPriorityServed) > 0) {
          row += `,${this.history.highPriorityServed[i]},${this.history.mediumPriorityServed[i]},${this.history.lowPriorityServed[i]}`;
        }

        csvContent += row + '\n';
      }

      return csvContent;
    }
  }
});
