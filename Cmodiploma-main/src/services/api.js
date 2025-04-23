import { API_URL } from '@/config'
class ApiService {
  /**
   * Базовый URL API
   * @private
   */
  _baseUrl = API_URL;

  /**
   * Получение всех симуляций
   * @returns {Promise<Array>} Список симуляций
   */
  async getSimulations() {
    try {
      const response = await fetch(`${this._baseUrl}/simulations`);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching simulations:', error);
      throw error;
    }
  }

  /**
   * Сохранение результатов симуляции
   * @param {Object} simulation Данные симуляции
   * @returns {Promise<Object>} Сохраненная симуляция
   */
  async saveSimulation(simulation) {
    try {
      const response = await fetch(`${this._baseUrl}/simulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulation),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving simulation:', error);
      throw error;
    }
  }

  /**
   * Удаление симуляции
   * @param {string} id ID симуляции
   * @returns {Promise<void>}
   */
  async deleteSimulation(id) {
    try {
      const response = await fetch(`${this._baseUrl}/simulations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting simulation:', error);
      throw error;
    }
  }
}

// Экспортируем синглтон
export default new ApiService();