import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true } // требуется авторизация
    },
    {
      path: '/simulation',
      name: 'simulation',
      component: () => import('../views/Simulation.vue'),
      meta: { requiresAuth: true } // требуется авторизация
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/StatisticsView.vue'),
      meta: { requiresAuth: true } // требуется авторизация
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue')
    }
  ]
});

// Защита маршрутов - активирована
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  console.log(`Навигация: ${from.path} -> ${to.path}, аутентифицирован: ${isAuthenticated}`);

  // Если маршрут требует аутентификации и пользователь не аутентифицирован
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Доступ запрещен, перенаправление на страницу входа');
    next('/login');
  }
  // Если пользователь аутентифицирован и пытается перейти на страницу входа/регистрации
  else if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    console.log('Уже авторизован, перенаправление на главную');
    next('/');
  }
  else {
    next();
  }
});

export default router;
