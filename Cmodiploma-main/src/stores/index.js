/**
 * Main store module that exports all Pinia stores
 * This allows for easier imports in components
 */

// Re-export all store modules
export { useQueueStore } from './modules/queueStore';
export { useStatisticsStore } from './modules/statisticsStore';
export { useUiStore } from './modules/uiStore';

// Constants for event bus
export const EVENTS = {
  SIMULATION_STARTED: 'simulation:started',
  SIMULATION_STOPPED: 'simulation:stopped',
  CUSTOMER_ADDED: 'customer:added',
  CUSTOMER_SERVED: 'customer:served',
  CUSTOMER_REJECTED: 'customer:rejected',
  STATISTICS_UPDATED: 'statistics:updated'
};