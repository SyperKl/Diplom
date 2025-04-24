import { reactive } from 'vue';

/**
 *
 * @enum {string}
 */
export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 *
 */
class NotificationService {
  /**
   * @typedef {Object} Notification
   * @property {string} id
   * @property {string} message
   * @property {NotificationType} type
   * @property {number} timeout
   */

  constructor() {
    this.state = reactive({
      notifications: []
    });
    this.counter = 0;
  }

  /**
   *
   * @param {string} message
   * @param {NotificationType} type
   * @param {number} timeout
   * @returns {string}
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
   *
   * @param {string} id
   */
  remove(id) {
    const index = this.state.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.state.notifications.splice(index, 1);
    }
  }

  /**
   *
   */
  clear() {
    this.state.notifications = [];
  }

  /**
   *
   * @param {string} message
   * @param {number} timeout
   * @returns {string}
   */
  success(message, timeout = 5000) {
    return this.add(message, NotificationType.SUCCESS, timeout);
  }

  /**
   *
   * @param {string} message
   * @param {number} timeout
   * @returns {string}
   */
  error(message, timeout = 7000) {
    return this.add(message, NotificationType.ERROR, timeout);
  }

  /**
   *
   * @param {string} message
   * @param {number} timeout
   * @returns {string}
   */
  warning(message, timeout = 6000) {
    return this.add(message, NotificationType.WARNING, timeout);
  }

  /**
   *
   * @param {string} message
   * @param {number} timeout
   * @returns {string}
   */
  info(message, timeout = 5000) {
    return this.add(message, NotificationType.INFO, timeout);
  }
}


export default new NotificationService();
