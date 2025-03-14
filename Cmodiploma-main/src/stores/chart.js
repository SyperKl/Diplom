import { defineStore } from 'pinia'
import { useQueueStore } from './queue'

export const useChartStore = defineStore('chart', {
    state: () => ({
        history: {
            queueLength: [],
            serverUtilization: [],
            timestamps: []
        },
        updateInterval: null
    }),
    
    actions: {
        startUpdates() {
            const queueStore = useQueueStore();
            this.stopUpdates();
            
            this.updateInterval = setInterval(() => {
                if (!queueStore.isRunning) {
                    this.stopUpdates();
                    return;
                }
                
                this.addDataPoint(queueStore.statistics);
            }, 2000);
        },
        
        stopUpdates() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        },
        
        addDataPoint(statistics) {
            // Логика добавления точки данных
        }
    }
});