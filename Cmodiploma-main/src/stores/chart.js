import { defineStore } from 'pinia'
import { useQueueStore } from './queue'

export const useChartStore = defineStore('chart', {
    state: () => ({
        history: {
            queueLength: [],
            serverUtilization: [],
            timestamps: [],
            highPriorityServed: [],
            mediumPriorityServed: [],
            lowPriorityServed: []
        },
        updateInterval: null,
        maxDataPoints: 50, // Максимальное количество точек данных
        lastUpdateTime: 0 // Для предотвращения слишком частого обновления
    }),
    
    getters: {
        // Вычисляемые статистические показатели
        averageServerLoad: (state) => {
            if (state.history.serverUtilization.length === 0) return 0;
            
            const sum = state.history.serverUtilization.reduce((a, b) => a + b, 0);
            return (sum / state.history.serverUtilization.length * 100).toFixed(1);
        },
        
        maxServerLoad: (state) => {
            if (state.history.serverUtilization.length === 0) return 0;
            
            const max = Math.max(...state.history.serverUtilization);
            return (max * 100).toFixed(1);
        },
        
        averageQueueLength: (state) => {
            if (state.history.queueLength.length === 0) return 0;
            
            const sum = state.history.queueLength.reduce((a, b) => a + b, 0);
            return (sum / state.history.queueLength.length).toFixed(1);
        }
    },
    
    actions: {
        startUpdates(interval = 2000) {
            const queueStore = useQueueStore();
            this.stopUpdates();
            
            this.updateInterval = setInterval(() => {
                if (!queueStore.isRunning) {
                    this.stopUpdates();
                    return;
                }
                
                this.addDataPoint(queueStore.statistics);
            }, interval);
        },
        
        stopUpdates() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        },
        
        addDataPoint(statistics) {
            // Предотвращение слишком частого обновления
            const now = Date.now();
            if (now - this.lastUpdateTime < 500) {
                return false;
            }
            this.lastUpdateTime = now;
            
            // Создаем новую точку данных
            const timestamp = new Date().toISOString();
            
            // Добавляем данные в историю
            this.history.timestamps.push(timestamp);
            this.history.queueLength.push(statistics.queueLength || 0);
            this.history.serverUtilization.push(statistics.serverUtilization || 0);
            
            // Добавляем данные о приоритетах, если они есть
            if ('highPriorityServed' in statistics) {
                this.history.highPriorityServed.push(statistics.highPriorityServed || 0);
                this.history.mediumPriorityServed.push(statistics.mediumPriorityServed || 0);
                this.history.lowPriorityServed.push(statistics.lowPriorityServed || 0);
            } else {
                // Заполняем нулями если данных нет
                this.history.highPriorityServed.push(0);
                this.history.mediumPriorityServed.push(0);
                this.history.lowPriorityServed.push(0);
            }
            
            // Ограничиваем количество точек данных
            if (this.history.timestamps.length > this.maxDataPoints) {
                this.history.timestamps.shift();
                this.history.queueLength.shift();
                this.history.serverUtilization.shift();
                this.history.highPriorityServed.shift();
                this.history.mediumPriorityServed.shift();
                this.history.lowPriorityServed.shift();
            }
            
            return true;
        },
        
        resetData() {
            this.history = {
                queueLength: [],
                serverUtilization: [],
                timestamps: [],
                highPriorityServed: [],
                mediumPriorityServed: [],
                lowPriorityServed: []
            };
            this.lastUpdateTime = 0;
        },
        
        // Экспорт данных в CSV
        exportToCSV() {
            if (this.history.timestamps.length === 0) {
                return null;
            }
            
            let csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += 'Время,Загрузка серверов (%),Длина очереди';
            
            // Добавляем заголовки для приоритетов, если есть данные
            if (Math.max(...this.history.highPriorityServed) > 0) {
                csvContent += ',Высокий приоритет,Средний приоритет,Низкий приоритет';
            }
            csvContent += '\n';
            
            for (let i = 0; i < this.history.timestamps.length; i++) {
                const time = new Date(this.history.timestamps[i]).toLocaleTimeString();
                const load = (this.history.serverUtilization[i] * 100).toFixed(1);
                const queue = this.history.queueLength[i];
                
                let row = `${time},${load},${queue}`;
                
                // Добавляем данные о приоритетах, если они используются
                if (Math.max(...this.history.highPriorityServed) > 0) {
                    row += `,${this.history.highPriorityServed[i]},${this.history.mediumPriorityServed[i]},${this.history.lowPriorityServed[i]}`;
                }
                
                csvContent += row + '\n';
            }
            
            return csvContent;
        },
        
        // Скачивание CSV
        downloadCSV() {
            const csvContent = this.exportToCSV();
            
            if (!csvContent) {
                console.warn('Нет данных для экспорта');
                return false;
            }
            
            // Создание ссылки для скачивания
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `smo-stats-${new Date().toISOString().slice(0, 19)}.csv`);
            document.body.appendChild(link);
            
            // Имитация клика для скачивания
            link.click();
            
            // Удаление элемента
            document.body.removeChild(link);
            
            return true;
        },
        
        // Формирование данных для графиков
        getChartData() {
            return {
                serverLoad: {
                    series: [{
                        name: 'Загрузка серверов (%)',
                        data: this.history.serverUtilization.map(val => parseFloat((val * 100).toFixed(1)))
                    }],
                    categories: this.history.timestamps.map(timestamp => {
                        return new Date(timestamp).toLocaleTimeString();
                    })
                },
                queueLength: {
                    series: [{
                        name: 'Длина очереди',
                        data: this.history.queueLength
                    }],
                    categories: this.history.timestamps.map(timestamp => {
                        return new Date(timestamp).toLocaleTimeString();
                    })
                },
                priority: {
                    series: [
                        {
                            name: 'Высокий приоритет',
                            data: this.history.highPriorityServed
                        },
                        {
                            name: 'Средний приоритет',
                            data: this.history.mediumPriorityServed
                        },
                        {
                            name: 'Низкий приоритет',
                            data: this.history.lowPriorityServed
                        }
                    ],
                    categories: this.history.timestamps.map(timestamp => {
                        return new Date(timestamp).toLocaleTimeString();
                    })
                }
            };
        }
    }
})