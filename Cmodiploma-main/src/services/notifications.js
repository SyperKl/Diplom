import { reactive } from 'vue';

/**
 * Типы уведомлений
 * @enum {string}
 */
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Сервис уведомлений для приложения
 */
class NotificationService {
  /**
   * @typedef {Object} Notification
   * @property {string} id Уникальный идентификатор
   * @property {string} message Текст уведомления
   * @property {NotificationType} type Тип уведомления
   * @property {number} timeout Время отображения в мс
   */

  constructor() {
    this.state = reactive({
      notifications: []
    });
    this.counter = 0;
  }

  /**
   * Добавление уведомления
   * @param {string} message Текст уведомления
   * @param {NotificationType} type Тип уведомления
   * @param {number} timeout Время отображения в мс (0 - не скрывать)
   * @returns {string} ID уведомления
   */
  add(message, type = NotificationType.INFO, timeout = 5000) {
    const id = `notification-${++this.counter}`;

    const notification = {
      id,
      message,
      type,
      timeout
    };

    this.state.notifications.push(notification);

    if (timeout > 0) {
      setTimeout(() => {
        this.remove(id);
      }, timeout);
    }

    return id;
  }

  /**
   * Удаление уведомления по ID
   * @param {string} id ID уведомления
   */
  remove(id) {
    const index = this.state.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.state.notifications.splice(index, 1);
    }
  }

  /**
   * Удаление всех уведомлений
   */
  clear() {
    this.state.notifications = [];
  }

  /**
   * Добавление успешного уведомления
   * @param {string} message Текст уведомления
   * @param {number} timeout Время отображения в мс
   * @returns {string} ID уведомления
   */
  success(message, timeout = 5000) {
    return this.add(message, NotificationType.SUCCESS, timeout);
  }

  /**
   * Добавление уведомления об ошибке
   * @param {string} message Текст уведомления
   * @param {number} timeout Время отображения в мс
   * @returns {string} ID уведомления
   */
  error(message, timeout = 7000) {
    return this.add(message, NotificationType.ERROR, timeout);
  }

  /**
   * Добавление предупреждения
   * @param {string} message Текст уведомления
   * @param {number} timeout Время отображения в мс
   * @returns {string} ID уведомления
   */
  warning(message, timeout = 6000) {
    return this.add(message, NotificationType.WARNING, timeout);
  }

  /**
   * Добавление информационного уведомления
   * @param {string} message Текст уведомления
   * @param {number} timeout Время отображения в мс
   * @returns {string} ID уведомления
   */
  info(message, timeout = 5000) {
    return this.add(message, NotificationType.INFO, timeout);
  }
}

// Экспортируем синглтон
export default new NotificationService();
