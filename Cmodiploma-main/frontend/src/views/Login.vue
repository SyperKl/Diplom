<template>
  <div class="login-page">
    <div class="auth-container">
      <h2>Вход в систему</h2>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="login" class="auth-form">
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            class="form-control"
            placeholder="Введите имя пользователя"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="form-control"
            placeholder="Введите пароль"
          />
        </div>

        <button type="submit" class="btn primary-btn" :disabled="loading">
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>

      <div class="auth-links">
        <p>Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_URL } from '../config';
import notificationService from '../services/notifications';

export default {
  name: 'LoginView',

  setup() {
    const username = ref('');
    const password = ref('');
    const error = ref('');
    const loading = ref(false);
    const router = useRouter();

    const login = async () => {
      try {
        loading.value = true;
        error.value = '';

        console.log('Отправка запроса на вход:', username.value);

        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: username.value,
            password: password.value
          })
        });

        console.log('Ответ получен, статус:', response.status);

        const data = await response.json();
        console.log('Данные ответа:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Ошибка при входе');
        }

        // Сохранение токена и имени пользователя
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username.value);
        console.log('Токен и имя пользователя сохранены');

        notificationService.success('Вход выполнен успешно!');

        // Перенаправление на главную страницу с полной перезагрузкой
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } catch (err) {
        error.value = err.message || 'Произошла ошибка при входе';
        console.error('Login error:', err);
        notificationService.error(error.value);
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      error,
      loading,
      login
    };
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.auth-container {
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
}

.error-message {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-color);
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  transition: all 0.3s;
}

.form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
  outline: none;
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.primary-btn {
  background: var(--primary-color);
  color: white;
}

.primary-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: translateY(0);
  box-shadow: none;
}

.auth-links {
  margin-top: 30px;
  text-align: center;
  color: var(--secondary-text);
}

.auth-links a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.auth-links a:hover {
  text-decoration: underline;
}
</style>
