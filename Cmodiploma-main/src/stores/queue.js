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
        chartUpdateTimer: null
    }),

    actions: {
        initialize() {
            console.log('Store: Initializing with servers:', this.servers);
            this.serverStatus = new Array(this.servers).fill(false);
            this.queue = [];
            this.resetStatistics();
            
            // Останавливаем таймер обновления графиков, если он был запущен
            if (this.chartUpdateTimer) {
                clearInterval(this.chartUpdateTimer);
                this.chartUpdateTimer = null;
            }
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
            console.log('Store: Adding customer');
            this.statistics.totalCustomers++;
            const freeServer = this.serverStatus.indexOf(false);

            if (freeServer !== -1) {
                console.log('Store: Found free server:', freeServer);
                this.serverStatus[freeServer] = true;
                this.statistics.servedCustomers++;
                return true;
            } else if (this.queue.length < this.maxQueueLength) {
                console.log('Store: Adding to queue, current length:', this.queue.length);
                this.queue.push({
                    arrivalTime: Date.now()
                });
                return true;
            } else {
                console.log('Store: Customer rejected');
                this.statistics.rejectedCustomers++;
                return false;
            }
        },

        processServer() {
            console.log('Store: Processing servers');
            const busyServer = this.serverStatus.indexOf(true);
            if (busyServer !== -1) {
                if (this.queue.length > 0) {
                    console.log('Store: Processing customer from queue');
                    const customer = this.queue.shift();
                    const waitTime = Date.now() - customer.arrivalTime;
                    this.updateAverageWaitTime(waitTime);
                    // Клиент из очереди обслужен
                    this.statistics.servedCustomers++;
                } else {
                    console.log('Store: Freeing server:', busyServer);
                    this.serverStatus[busyServer] = false;
                }
            }

            this.updateStatistics();
        },

        updateAverageWaitTime(newWaitTime) {
            console.log('Store: Updating average wait time:', newWaitTime);
            // Расчет скользящего среднего времени ожидания
            const total = this.statistics.averageWaitTime * (this.statistics.servedCustomers - 1) + newWaitTime;
            this.statistics.averageWaitTime = total / this.statistics.servedCustomers;
        },

        updateStatistics() {
            console.log('Store: Updating statistics');
            const timestamp = new Date().toISOString();
            const busyServers = this.serverStatus.filter(status => status).length;

            this.statistics.queueLength = this.queue.length;
            this.statistics.serverUtilization = busyServers / this.servers;

            // Данные для графиков обновляем через таймер, чтобы не перегружать 
            // график слишком частыми обновлениями
        },
        
        // Обновление данных для графиков с установленной периодичностью
        startChartUpdates() {
            // Обновляем графики каждые 2 секунды
            this.chartUpdateTimer = setInterval(() => {
                this.addChartDataPoint();
            }, 2000);
            
            // Сразу добавляем первую точку данных
            this.addChartDataPoint();
        },
        
        stopChartUpdates() {
            if (this.chartUpdateTimer) {
                clearInterval(this.chartUpdateTimer);
                this.chartUpdateTimer = null;
            }
        },
        
        addChartDataPoint() {
            const timestamp = new Date().toISOString();
            
            this.history.queueLength.push(this.statistics.queueLength);
            this.history.serverUtilization.push(this.statistics.serverUtilization);
            this.history.timestamps.push(timestamp);

            // Ограничиваем историю до 100 точек
            if (this.history.timestamps.length > 100) {
                this.history.queueLength.shift();
                this.history.serverUtilization.shift();
                this.history.timestamps.shift();
            }
        },

        toggleSimulation() {
            const newState = !this.isRunning;
            console.log('Store: Toggle simulation from', this.isRunning, 'to', newState);
            this.isRunning = newState;
            
            // Управление таймером графиков
            if (this.isRunning) {
                this.startChartUpdates();
            } else {
                this.stopChartUpdates();
            }
        }
    }
})