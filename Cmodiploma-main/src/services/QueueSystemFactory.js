
class QueueSystemStrategy {
    constructor(params) {
      this.params = params;
    }


    initialize() {}
    addCustomer() {}
    processServer() {}
    calculateStatistics() {}
  }


  class StandardQueueSystem extends QueueSystemStrategy {
    initialize() {

      this.queue = [];
      this.serverStatus = new Array(this.params.servers).fill(false);
      this.statistics = {
        totalCustomers: 0,
        servedCustomers: 0,
        rejectedCustomers: 0,
        averageWaitTime: 0,
        queueLength: 0,
        serverUtilization: 0
      };
    }

    addCustomer() {
      this.statistics.totalCustomers++;
      const freeServer = this.serverStatus.indexOf(false);

      if (freeServer !== -1) {
        this.serverStatus[freeServer] = true;
        this.statistics.servedCustomers++;
        this.calculateStatistics();
        return true;
      } else if (this.queue.length < this.params.maxQueueLength) {
        this.queue.push({
          arrivalTime: Date.now()
        });
        this.calculateStatistics();
        return true;
      } else {
        this.statistics.rejectedCustomers++;
        this.calculateStatistics();
        return false;
      }
    }

    processServer() {
      const busyServerIndex = this.serverStatus.indexOf(true);

      if (busyServerIndex === -1) {
        return;
      }

      if (this.queue.length > 0) {
        const customer = this.queue.shift();
        const waitTime = Date.now() - customer.arrivalTime;

        if (this.statistics.servedCustomers > 0) {
          const totalWaitTime = this.statistics.averageWaitTime * this.statistics.servedCustomers;
          this.statistics.averageWaitTime = (totalWaitTime + waitTime) / (this.statistics.servedCustomers + 1);
        } else {
          this.statistics.averageWaitTime = waitTime;
        }

        this.statistics.servedCustomers++;
      } else {
        this.serverStatus[busyServerIndex] = false;
      }

      this.calculateStatistics();
    }

    calculateStatistics() {
      const busyServers = this.serverStatus.filter(status => status).length;
      this.statistics.queueLength = this.queue.length;
      this.statistics.serverUtilization = busyServers / this.params.servers;
    }
  }


  class PriorityQueueSystem extends StandardQueueSystem {
    initialize() {
      super.initialize();

      this.priorityQueue = {
        high: [],
        medium: [],
        low: []
      };

      this.statistics.highPriorityServed = 0;
      this.statistics.mediumPriorityServed = 0;
      this.statistics.lowPriorityServed = 0;
    }

    addCustomer(priority = 'medium') {
      this.statistics.totalCustomers++;
      const freeServer = this.serverStatus.indexOf(false);

      if (freeServer !== -1) {
        this.serverStatus[freeServer] = true;
        this.statistics.servedCustomers++;
        this.statistics[`${priority}PriorityServed`]++;
        this.calculateStatistics();
        return true;
      } else {

        const totalQueueLength =
          this.priorityQueue.high.length +
          this.priorityQueue.medium.length +
          this.priorityQueue.low.length;

        if (totalQueueLength < this.params.maxQueueLength) {
          this.priorityQueue[priority].push({
            arrivalTime: Date.now(),
            priority
          });
          this.calculateStatistics();
          return true;
        } else {
          this.statistics.rejectedCustomers++;
          this.calculateStatistics();
          return false;
        }
      }
    }

    processServer() {
      const busyServerIndex = this.serverStatus.indexOf(true);

      if (busyServerIndex === -1) {
        return;
      }


      let nextCustomer = null;
      let priority = null;

      if (this.priorityQueue.high.length > 0) {
        nextCustomer = this.priorityQueue.high.shift();
        priority = 'high';
      } else if (this.priorityQueue.medium.length > 0) {
        nextCustomer = this.priorityQueue.medium.shift();
        priority = 'medium';
      } else if (this.priorityQueue.low.length > 0) {
        nextCustomer = this.priorityQueue.low.shift();
        priority = 'low';
      }

      if (nextCustomer) {
        const waitTime = Date.now() - nextCustomer.arrivalTime;

        if (this.statistics.servedCustomers > 0) {
          const totalWaitTime = this.statistics.averageWaitTime * this.statistics.servedCustomers;
          this.statistics.averageWaitTime = (totalWaitTime + waitTime) / (this.statistics.servedCustomers + 1);
        } else {
          this.statistics.averageWaitTime = waitTime;
        }

        this.statistics.servedCustomers++;
        this.statistics[`${priority}PriorityServed`]++;
      } else {
        this.serverStatus[busyServerIndex] = false;
      }

      this.calculateStatistics();
    }

    calculateStatistics() {
      super.calculateStatistics();
      // Общая длина очереди для всех приоритетов
      this.statistics.queueLength =
        this.priorityQueue.high.length +
        this.priorityQueue.medium.length +
        this.priorityQueue.low.length;
    }
  }

  // Пример реализации для СМО с обслуживанием LIFO
  class LIFOQueueSystem extends StandardQueueSystem {
    processServer() {
      const busyServerIndex = this.serverStatus.indexOf(true);

      if (busyServerIndex === -1) {
        return; // Нет занятых серверов
      }

      if (this.queue.length > 0) {
        // Берем последнего клиента из очереди (LIFO)
        const customer = this.queue.pop();
        const waitTime = Date.now() - customer.arrivalTime;

        if (this.statistics.servedCustomers > 0) {
          const totalWaitTime = this.statistics.averageWaitTime * this.statistics.servedCustomers;
          this.statistics.averageWaitTime = (totalWaitTime + waitTime) / (this.statistics.servedCustomers + 1);
        } else {
          this.statistics.averageWaitTime = waitTime;
        }

        this.statistics.servedCustomers++;
      } else {
        this.serverStatus[busyServerIndex] = false;
      }

      this.calculateStatistics();
    }
  }

  // Пример реализации для замкнутой СМО
  class ClosedQueueSystem extends StandardQueueSystem {
    initialize() {
      super.initialize();
      // Общее количество клиентов в системе фиксировано
      this.totalSystemCustomers = this.params.totalCustomers || 10;
      this.customersInSystem = this.totalSystemCustomers;
      this.customersServed = 0;
    }

    addCustomer() {
      // В замкнутой системе клиенты не приходят извне,
      // а возвращаются после обслуживания
      if (this.customersInSystem > 0) {
        const freeServer = this.serverStatus.indexOf(false);

        if (freeServer !== -1) {
          this.serverStatus[freeServer] = true;
          this.customersInSystem--;
          this.calculateStatistics();
          return true;
        } else if (this.queue.length < this.params.maxQueueLength) {
          this.queue.push({
            arrivalTime: Date.now()
          });
          this.customersInSystem--;
          this.calculateStatistics();
          return true;
        }
      }
      return false;
    }

    processServer() {
      const busyServerIndex = this.serverStatus.indexOf(true);

      if (busyServerIndex === -1) {
        return; // Нет занятых серверов
      }

      if (this.queue.length > 0) {
        const customer = this.queue.shift();
        const waitTime = Date.now() - customer.arrivalTime;

        if (this.statistics.servedCustomers > 0) {
          const totalWaitTime = this.statistics.averageWaitTime * this.statistics.servedCustomers;
          this.statistics.averageWaitTime = (totalWaitTime + waitTime) / (this.statistics.servedCustomers + 1);
        } else {
          this.statistics.averageWaitTime = waitTime;
        }

        this.customersServed++;
        setTimeout(() => {
          // Клиент возвращается в систему через некоторое время
          this.customersInSystem++;
        }, this.params.customerReturnDelay || 5000);
      } else {
        this.serverStatus[busyServerIndex] = false;
        this.customersInSystem++;
      }

      this.calculateStatistics();
    }

    calculateStatistics() {
      super.calculateStatistics();
      this.statistics.customersInSystem = this.customersInSystem;
      this.statistics.customersServed = this.customersServed;
    }
  }

  // Фабрика для создания нужного типа СМО
  class QueueSystemFactory {
    static createQueueSystem(type, params) {
      switch(type) {
        case 'standard':
          return new StandardQueueSystem(params);
        case 'priority':
          return new PriorityQueueSystem(params);
        case 'lifo':
          return new LIFOQueueSystem(params);
        case 'closed':
          return new ClosedQueueSystem(params);
        default:
          return new StandardQueueSystem(params);
      }
    }
  }

  export { QueueSystemFactory };
