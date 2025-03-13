# Система массового обслуживания (СМО)

Веб-приложение для моделирования и анализа систем массового обслуживания, разработанное с использованием современных веб-технологий.

## Функциональность

- Настройка параметров системы обслуживания:
 - Количество серверов
 - Максимальная длина очереди
 - Интенсивность входящего потока

- Визуализация процесса обслуживания в реальном времени
- Сбор и отображение статистики:
 - Количество обслуженных клиентов
 - Количество отказов
 - Средняя загрузка серверов
 - Среднее время ожидания

- Графическое представление результатов
- Сохранение результатов симуляций

## Технологии

### Frontend
- Vue 3
- Vue Router
- Pinia
- Chart.js

### Backend
- Node.js
- Express
- MongoDB

## Установка и запуск

### Frontend
```bash
cd Cmodiploma
npm install
npm run dev
```
### Backend
```bash
cd server
npm install
npm run dev
```
### Структура проекта
```bash
Cmodiploma/
├── src/
│   ├── components/     # Vue компоненты
│   ├── views/          # Страницы приложения
│   ├── stores/         # Хранилище состояния
│   └── router/         # Маршрутизация
├── server/
│   ├── models/         # Модели данных
│   ├── routes/         # API маршруты
│   └── config/         # Конфигурация
```
## Лицензия MIT
Этот README.md содержит:
1. Описание проекта
2. Основные функции
3. Используемые технологии
4. Инструкции по установке
5. Структуру проекта


