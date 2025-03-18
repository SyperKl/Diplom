/**
 * Утилиты для работы с данными и форматированием
 */

/**
 * Форматирует время в миллисекундах в удобочитаемый формат
 * @param {number} milliseconds Время в миллисекундах
 * @returns {string} Отформатированное время
 */
export function formatTime(milliseconds) {
    if (!milliseconds) return '0.00 сек';
    
    if (milliseconds < 1000) {
      return `${milliseconds.toFixed(0)} мс`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(2)} сек`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = ((milliseconds % 60000) / 1000).toFixed(2);
      return `${minutes} мин ${seconds} сек`;
    }
  }
  
  /**
   * Форматирует дату в локальный формат
   * @param {string} dateString ISO строка даты
   * @returns {string} Отформатированная дата
   */
  export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  /**
   * Форматирует время в локальный формат
   * @param {string} dateString ISO строка даты
   * @returns {string} Отформатированное время
   */
  export function formatTimeString(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  }
  
  /**
   * Форматирует процент с фиксированной точностью
   * @param {number} value Значение от 0 до 1
   * @param {number} precision Количество знаков после запятой
   * @returns {string} Отформатированный процент
   */
  export function formatPercentage(value, precision = 1) {
    return (value * 100).toFixed(precision) + '%';
  }
  
  /**
   * Вычисляет среднее значение массива
   * @param {Array<number>} array Массив чисел
   * @returns {number} Среднее значение
   */
  export function average(array) {
    if (!array.length) return 0;
    const sum = array.reduce((a, b) => a + b, 0);
    return sum / array.length;
  }
  
  /**
   * Экспорт массива в CSV формат
   * @param {Array<Array<any>>} data Двумерный массив данных
   * @param {Array<string>} headers Заголовки столбцов
   * @returns {string} CSV строка
   */
  export function exportToCsv(data, headers) {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Добавляем заголовки
    csvContent += headers.join(',') + '\n';
    
    // Добавляем строки данных
    for (const row of data) {
      csvContent += row.join(',') + '\n';
    }
    
    return csvContent;
  }
  
  /**
   * Скачивает данные как CSV файл
   * @param {string} csvContent CSV контент
   * @param {string} filename Имя файла
   */
  export function downloadCsv(csvContent, filename) {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Глубокое клонирование объекта
   * @param {Object} obj Объект для клонирования
   * @returns {Object} Клонированный объект
   */
  export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  /**
   * Генерирует случайное целое число в заданном диапазоне
   * @param {number} min Минимальное значение (включительно)
   * @param {number} max Максимальное значение (включительно)
   * @returns {number} Случайное целое число
   */
  export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Ограничивает значение в заданном диапазоне
   * @param {number} value Значение
   * @param {number} min Минимальное значение
   * @param {number} max Максимальное значение
   * @returns {number} Ограниченное значение
   */
  export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }