<template>
    <div class="notifications-container">
      <transition-group name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
        >
          <div class="notification-content">
            <div class="notification-icon">
              <svg
                v-if="notification.type === 'success'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <svg
                v-else-if="notification.type === 'error'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              <svg
                v-else-if="notification.type === 'warning'"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <div class="notification-message">
              {{ notification.message }}
            </div>
            <button @click="closeNotification(notification.id)" class="notification-close">
              ×
            </button>
          </div>
          <div
            v-if="notification.timeout > 0"
            class="notification-progress"
          >
            <div
              class="notification-progress-bar"
              :style="`animation-duration: ${notification.timeout}ms`"
            ></div>
          </div>
        </div>
      </transition-group>
    </div>
  </template>
  
  <script>
  import { computed } from 'vue';
  import notificationService from '@/services/notifications';
  
  export default {
    name: 'NotificationsComponent',
    
    setup() {
      const notifications = computed(() => notificationService.state.notifications);
      
      const closeNotification = (id) => {
        notificationService.remove(id);
      };
      
      return {
        notifications,
        closeNotification
      };
    }
  }
  </script>
  
  <style scoped>
  .notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 350px;
    width: 100%;
  }
  
  .notification {
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    padding: 15px;
  }
  
  .notification-icon {
    margin-right: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .notification-message {
    flex: 1;
    font-size: 0.95rem;
  }
  
  .notification-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.3s;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }
  
  .notification-close:hover {
    opacity: 1;
  }
  
  .notification-progress {
    height: 4px;
    width: 100%;
    background: rgba(255, 255, 255, 0.2);
  }
  
  .notification-progress-bar {
    height: 100%;
    width: 100%;
    transform-origin: left;
    animation-name: progress;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
  }
  
  @keyframes progress {
    0% {
      transform: scaleX(1);
    }
    100% {
      transform: scaleX(0);
    }
  }
  
  .notification-enter-active, 
  .notification-leave-active {
    transition: all 0.3s ease;
  }
  
  .notification-enter-from {
    opacity: 0;
    transform: translateX(30px);
  }
  
  .notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  
  /* Типы уведомлений */
  .notification-success {
    background-color: #42b983;
    color: white;
  }
  
  .notification-success .notification-progress-bar {
    background-color: #2c9d6a;
  }
  
  .notification-error {
    background-color: #e74c3c;
    color: white;
  }
  
  .notification-error .notification-progress-bar {
    background-color: #c0392b;
  }
  
  .notification-warning {
    background-color: #f39c12;
    color: white;
  }
  
  .notification-warning .notification-progress-bar {
    background-color: #d35400;
  }
  
  .notification-info {
    background-color: #3498db;
    color: white;
  }
  
  .notification-info .notification-progress-bar {
    background-color: #2980b9;
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .notifications-container {
      left: 20px;
      right: 20px;
      max-width: unset;
    }
  }
  </style>