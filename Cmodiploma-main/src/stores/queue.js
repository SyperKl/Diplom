import { defineStore } from 'pinia'
import { QueueSystemFactory } from '../services/QueueSystemFactory'

export const useQueueStore = defineStore('queue', {
    state: () => ({
        // Параметры системы
        servers: 2,
        maxQueueLength: 10,
        arrivalRate: 0.3,
        serviceRate: 0.2,
        systemType: 'standard', // Новое поле - тип системы
        systemSettings: {}, // Настройки для выбранного типа системы
        
        isRunning: false,

        // Текущее состояние
        queueSystem: null, // Инстанс системы обслуживания
        queue: [], // Оставляем для обратной совместимости
        serverStatus: [], // Оставляем для обратной совместимости
        
        // Статистика
        statistics: {
            totalCustomers: 0,
            servedCustomers: 0,
            rejectedCustomers: 0,
            averageWaitTime: 0,
            queueLength: 0,
            serverUtilization: 0,
            // Дополнительные поля для специфических типов СМО
            highPriorityServed: 0,
            mediumPriorityServed: 0,
            lowPriorityServed: 0,
            customersInSystem: 0,
            customersServed: 0
        },

        // История для графиков
        history: {
            queueLength: [],
            serverUtilization: [],
            timestamps: [],
            // Дополнительные массивы для специфических типов СМО
            highPriorityServed: [],
            mediumPriorityServed: [],
            lowPriorityServed: []
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
            console.log('Store: Initializing with type:', this.systemType);
            
            // Создаем нужный тип СМО через фабрику
            this.queueSystem = QueueSystemFactory.createQueueSystem(this.systemType, {
                servers: this.servers,
                maxQueueLength: this.maxQueueLength,
                arrivalRate: this.arrivalRate,
                serviceRate: this.serviceRate,
                ...this.systemSettings // Дополнительные настройки для конкретного типа
            });
            
            // Инициализируем систему
            this.queueSystem.initialize();
            
            // Обновляем переменные для обратной совместимости
            this.queue = this.queueSystem.queue || [];
            this.serverStatus = this.queueSystem.serverStatus || [];
            
            this.resetStatistics();
            
            // Останавливаем все интервалы
            this.stopAllIntervals();
        },

        // Устанавливает тип СМО и соответствующие настройки
        setSystemType(type, settings = {}) {
            this.systemType = type;
            this.systemSettings = settings;
            if (!this.isRunning) {
                this.initialize(); // Реинициализируем систему при смене типа
            }
        },

        resetStatistics() {
            console.log('Store: Resetting statistics');
            
            // Базовая статистика
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
            
            // Очищаем историю графиков
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

        addCustomer() {
            try {
                console.log('Store: Adding customer');
                
                // Используем метод из выбранной системы
                let result;
                
                // Для приоритетной системы нужно определить приоритет
                if (this.systemType === 'priority') {
                    const rand = Math.random();
                    let priority;
                    
                    // Определяем приоритет согласно настройкам
                    if (rand < this.systemSettings.highPriorityRate) {
                        priority = 'high';
                    } else if (rand < this.systemSettings.highPriorityRate + this.systemSettings.mediumPriorityRate) {
                        priority = 'medium';
                    } else {
                        priority = 'low';
                    }
                    
                    result = this.queueSystem.addCustomer(priority);
                } else {
                    result = this.queueSystem.addCustomer();
                }
                
                // Обновляем состояние для обратной совместимости
                this.queue = this.queueSystem.queue || [];
                this.serverStatus = this.queueSystem.serverStatus || [];
                
                // Обновляем статистику
                Object.assign(this.statistics, this.queueSystem.statistics);
                
                return result;
            } catch (error) {
                console.error('Error in addCustomer:', error);
                return false;
            }
        },

        processServer() {
            try {
                console.log('Store: Processing servers');
                
                // Используем метод из выбранной системы
                this.queueSystem.processServer();
                
                // Обновляем состояние для обратной совместимости
                this.queue = this.queueSystem.queue || [];
                this.serverStatus = this.queueSystem.serverStatus || [];
                
                // Обновляем статистику
                Object.assign(this.statistics, this.queueSystem.statistics);
            } catch (error) {
                console.error('Error in processServer:', error);
            }
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
                
                // Дополнительные данные для специфических типов СМО
                const highPriorityServed = Number(this.statistics.highPriorityServed || 0);
                const mediumPriorityServed = Number(this.statistics.mediumPriorityServed || 0);
                const lowPriorityServed = Number(this.statistics.lowPriorityServed || 0);
                
                // Создаем новые массивы вместо изменения существующих
                this.history = {
                    queueLength: [...this.history.queueLength, queueLength],
                    serverUtilization: [...this.history.serverUtilization, serverUtilization],
                    timestamps: [...this.history.timestamps, timestamp],
                    highPriorityServed: [...this.history.highPriorityServed, highPriorityServed],
                    mediumPriorityServed: [...this.history.mediumPriorityServed, mediumPriorityServed],
                    lowPriorityServed: [...this.history.lowPriorityServed, lowPriorityServed]
                };

                // Ограничиваем историю до 50 точек
                const maxPoints = 50;
                if (this.history.timestamps.length > maxPoints) {
                    this.history = {
                        queueLength: this.history.queueLength.slice(-maxPoints),
                        serverUtilization: this.history.serverUtilization.slice(-maxPoints),
                        timestamps: this.history.timestamps.slice(-maxPoints),
                        highPriorityServed: this.history.highPriorityServed.slice(-maxPoints),
                        mediumPriorityServed: this.history.mediumPriorityServed.slice(-maxPoints),
                        lowPriorityServed: this.history.lowPriorityServed.slice(-maxPoints)
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

        // Остальные методы остаются без изменений
        stopAllIntervals() {
            // Останавливаем интервал симуляции
            if (this.intervals.simulation) {
                clearInterval(this.intervals.simulation);
                this.intervals.simulation = null;
            }
            
            // Останавливаем интервал графиков
            this.stopChartUpdates();
        },
        
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