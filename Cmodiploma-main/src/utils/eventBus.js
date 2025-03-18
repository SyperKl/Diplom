/**
 * Простая шина событий для коммуникации между компонентами
 */
class EventBus {
    constructor() {
      this.events = {};
    }
  
    /**
     * Подписка на событие
     * @param {string} event Название события
     * @param {Function} callback Функция обратного вызова
     */
    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    }
  
    /**
     * Отписка от события
     * @param {string} event Название события
     * @param {Function} callback Функция обратного вызова
     */
    off(event, callback) {
      if (!this.events[event]) return;
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  
    /**
     * Однократная подписка на событие
     * @param {string} event Название события
     * @param {Function} callback Функция обратного вызова
     */
    once(event, callback) {
      const wrapper = (...args) => {
        callback(...args);
        this.off(event, wrapper);
      };
      this.on(event, wrapper);
    }
  
    /**
     * Вызов события
     * @param {string} event Название события
     * @param {any} args Аргументы для передачи в обработчики
     */
    emit(event, ...args) {
      if (!this.events[event]) return;
      this.events[event].forEach(callback => {
        callback(...args);
      });
    }
  
    /**
     * Очистка всех обработчиков
     */
    clear() {
      this.events = {};
    }
  }
  
  // Экспортируем синглтон
  export default new EventBus();