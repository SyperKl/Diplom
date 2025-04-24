/**
 * Application-wide event constants
 */
export const EVENTS = {
    SIMULATION_STARTED: 'simulation:started',
    SIMULATION_STOPPED: 'simulation:stopped',
    SIMULATION_RESET: 'simulation:reset',
    CUSTOMER_ADDED: 'customer:added',
    CUSTOMER_SERVED: 'customer:served',
    CUSTOMER_REJECTED: 'customer:rejected',
    SERVER_BUSY: 'server:busy',
    SERVER_IDLE: 'server:idle',
    QUEUE_UPDATED: 'queue:updated',
    STATISTICS_UPDATED: 'statistics:updated'
  };
  
  /**
   * System types constants
   */
  export const SYSTEM_TYPES = {
    STANDARD: 'standard',
    PRIORITY: 'priority',
    LIFO: 'lifo',
    CLOSED: 'closed'
  };
  
  /**
   * Application settings
   */
  export const SETTINGS = {
    MAX_SERVERS: 10,
    MAX_QUEUE_LENGTH: 50,
    MIN_RATE: 0.01,
    MAX_RATE: 1,
    DEFAULT_CHART_UPDATE_INTERVAL: 2000,
    MAX_CHART_POINTS: 50
  };