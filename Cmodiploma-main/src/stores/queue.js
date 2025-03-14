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
        
        // Интервалы
        intervals: {
            simulation: null,
            charts: null
        },
        
        // Для защиты от слишком частых обновлений графиков
        lastChartUpdate: 0
    }),

    actions: {
        initialize() {
            console.log('Store: Initializing with servers:', this.servers);
            this.serverStatus = new Array(this.servers).fill(false);
            this.queue = [];
            this.resetStatistics();
            
            // Останавливаем все интервалы
            this.stopAllIntervals();
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
            this.lastChartUpdate = 0;
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
        
        // Централизованное управление симуляцией
        startSimulation() {
            // Сначала остановим все существующие интервалы
            this.stopAllIntervals();
            
            this.isRunning = true;
            
            // Запускаем интервал симуляции
            this.intervals.simulation = setInterval(() => {
                if (!this.isRunning) {
                    this.stopAllIntervals();
                    return;
                }
                
                if (Math.random() < this.arrivalRate) {
                    this.addCustomer();
                }
                if (Math.random() < this.serviceRate) {
                    this.processServer();
                }
            }, 1000);
            
            // Запускаем интервал обновления графиков
            this.startChartUpdates();
        },
        
        stopAllIntervals() {
            // Останавливаем интервал симуляции
            if (this.intervals.simulation) {
                clearInterval(this.intervals.simulation);
                this.intervals.simulation = null;
            }
            
            // Останавливаем интервал графиков
            this.stopChartUpdates();
        },
        
        // Обновление данных для графиков
        startChartUpdates() {
            // Сначала убедимся, что предыдущий интервал остановлен
            this.stopChartUpdates();

            // Обновляем графики каждые 2 секунды
            this.intervals.charts = setInterval(() => {
                if (!this.isRunning) {
                    this.stopChartUpdates();
                    return;
                }

                this.addChartDataPoint();
            }, 2000);
        },
        
        stopChartUpdates() {
            if (this.intervals.charts) {
                clearInterval(this.intervals.charts);
                this.intervals.charts = null;
            }
        },
        
        // Исправленный метод добавления точки на график
        addChartDataPoint() {
            try {
                // Защита от слишком частого обновления
                const now = Date.now();
                if (now - this.lastChartUpdate < 500) {
                    return false;
                }
                this.lastChartUpdate = now;
                
                console.log('Store: Adding chart data point');
                
                const timestamp = new Date().toISOString();
                
                // Безопасное копирование текущих значений
                const queueLength = Number(this.statistics.queueLength || 0);
                const serverUtilization = Number(this.statistics.serverUtilization || 0);
                
                // Добавляем данные в историю
                this.history.queueLength.push(queueLength);
                this.history.serverUtilization.push(serverUtilization);
                this.history.timestamps.push(timestamp);

                // Ограничиваем историю до 50 точек
                const maxPoints = 50;
                if (this.history.timestamps.length > maxPoints) {
                    this.history.queueLength = this.history.queueLength.slice(-maxPoints);
                    this.history.serverUtilization = this.history.serverUtilization.slice(-maxPoints);
                    this.history.timestamps = this.history.timestamps.slice(-maxPoints);
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
                console.log('Store: Toggle simulation from', this.isRunning, 'to', !this.isRunning);
                
                if (this.isRunning) {
                    this.isRunning = false;
                    this.stopAllIntervals();
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
})