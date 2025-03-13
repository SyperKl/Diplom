import { defineStore } from 'pinia'

export const useQueueStore = defineStore('queue', {
    state: () => ({
        // Параметры системы
        servers: 2,
        maxQueueLength: 10,
        arrivalRate: 0.3,
        serviceRate: 0.2,
        isRunning: false,

        // Текущее состояние
        queue: [],
        serverStatus: [],

        // Статистика
        statistics: {
            totalCustomers: 0,
            servedCustomers: 0,
            rejectedCustomers: 0,
            averageWaitTime: 0,
            queueLength: 0,
            serverUtilization: 0
        },

        // История для графиков
        history: {
            queueLength: [],
            serverUtilization: [],
            timestamps: []
        },
        
        // Таймер для обновления графиков
        chartUpdateInterval: null
    }),

    actions: {
        initialize() {
            console.log('Store: Initializing with servers:', this.servers);
            this.serverStatus = new Array(this.servers).fill(false);
            this.queue = [];
            this.resetStatistics();
            
            // Останавливаем интервал обновления графиков, если он был запущен
            this.stopChartUpdates();
        },

        resetStatistics() {
            console.log('Store: Resetting statistics');
            this.statistics = {
                totalCustomers: 0,
                servedCustomers: 0,
                rejectedCustomers: 0,
                averageWaitTime: 0,
                queueLength: 0,
                serverUtilization: 0
            };
            this.history = {
                queueLength: [],
                serverUtilization: [],
                timestamps: []
            };
        },

        addCustomer() {
            try {
                console.log('Store: Adding customer');
                this.statistics.totalCustomers++;
                const freeServer = this.serverStatus.indexOf(false);

                if (freeServer !== -1) {
                    console.log('Store: Found free server:', freeServer);
                    this.serverStatus[freeServer] = true;
                    this.statistics.servedCustomers++;
                    this._calculateStats();
                    return true;
                } else if (this.queue.length < this.maxQueueLength) {
                    console.log('Store: Adding to queue, current length:', this.queue.length);
                    this.queue.push({
                        arrivalTime: Date.now()
                    });
                    this._calculateStats();
                    return true;
                } else {
                    console.log('Store: Customer rejected');
                    this.statistics.rejectedCustomers++;
                    this._calculateStats();
                    return false;
                }
            } catch (error) {
                console.error('Error in addCustomer:', error);
                return false;
            }
        },

        processServer() {
            try {
                console.log('Store: Processing servers');
                const busyServerIndex = this.serverStatus.indexOf(true);
                
                if (busyServerIndex === -1) {
                    return; // Нет занятых серверов
                }
                
                if (this.queue.length > 0) {
                    console.log('Store: Processing customer from queue');
                    const customer = this.queue.shift();
                    const waitTime = Date.now() - customer.arrivalTime;
                    
                    // Обновление среднего времени ожидания
                    if (this.statistics.servedCustomers > 0) {
                        const totalWaitTime = this.statistics.averageWaitTime * this.statistics.servedCustomers;
                        this.statistics.averageWaitTime = (totalWaitTime + waitTime) / (this.statistics.servedCustomers + 1);
                    } else {
                        this.statistics.averageWaitTime = waitTime;
                    }
                    
                    this.statistics.servedCustomers++;
                } else {
                    console.log('Store: Freeing server:', busyServerIndex);
                    this.serverStatus[busyServerIndex] = false;
                }
                
                this._calculateStats();
            } catch (error) {
                console.error('Error in processServer:', error);
            }
        },
        
        _calculateStats() {
            // Вспомогательный метод для обновления статистики
            const busyServers = this.serverStatus.filter(status => status).length;
            this.statistics.queueLength = this.queue.length;
            this.statistics.serverUtilization = busyServers / this.servers;
        },
        
        // Обновление данных для графиков с установленной периодичностью
        startChartUpdates() {
            // Сначала убедимся, что предыдущий интервал остановлен
            this.stopChartUpdates();
            
            // Обновляем графики каждые 2 секунды
            this.chartUpdateInterval = setInterval(() => {
                // Прекращаем обновление, если симуляция остановлена
                if (!this.isRunning) {
                    this.stopChartUpdates();
                    return;
                }

                try {
                    this.addChartDataPoint();
                } catch (error) {
                    console.error('Error in chart update interval:', error);
                    this.stopChartUpdates();
                }
            }, 2000);
        },
        
        stopChartUpdates() {
            if (this.chartUpdateInterval) {
                clearInterval(this.chartUpdateInterval);
                this.chartUpdateInterval = null;
            }
        },
        
        addChartDataPoint() {
            try {
                console.log('Store: Adding chart data point');
                
                // Защита от переполнения истории
                if (this.history.timestamps.length >= 1000) {
                    console.warn('History limit reached');
                    return false;
                }
                
                const timestamp = new Date().toISOString();
                
                // Безопасное копирование текущих значений
                const queueLength = Number(this.statistics.queueLength);
                const serverUtilization = Number(this.statistics.serverUtilization);
                
                // Добавляем данные в историю
                this.history.queueLength.push(queueLength);
                this.history.serverUtilization.push(serverUtilization);
                this.history.timestamps.push(timestamp);

                // Ограничиваем историю до 50 точек
                if (this.history.timestamps.length > 50) {
                    this.history.queueLength.shift();
                    this.history.serverUtilization.shift();
                    this.history.timestamps.shift();
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

        toggleSimulation() {
            try {
                const newState = !this.isRunning;
                console.log('Store: Toggle simulation from', this.isRunning, 'to', newState);
                this.isRunning = newState;
                
                if (this.isRunning) {
                    this.startChartUpdates();
                } else {
                    this.stopChartUpdates();
                }
            } catch (error) {
                console.error('Error toggling simulation:', error);
                this.isRunning = false;
                this.stopChartUpdates();
            }
        }
    }
})