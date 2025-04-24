import { API_URL } from '@/config'
class ApiService {
  /**

   * @private
   */
  _baseUrl = API_URL;

  /**
   *
   * @returns {Promise<Array>}
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
   *
   * @param {Object} simulation
   * @returns {Promise<Object>}
   */
  async saveSimulation(simulation) {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${this._baseUrl}/simulations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
   *
   * @param {string} id
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


export default new ApiService();
