const express = require('express');
const router = express.Router();
const SimulationController = require('../controllers/simulation');
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

// Публичные маршруты
router.get('/', SimulationController.getAllSimulations);
router.get('/:id', SimulationController.getSimulationById);

// Защищенные маршруты
router.post('/', auth, rateLimiter, SimulationController.createSimulation);
router.put('/:id', auth, SimulationController.updateSimulation);
router.delete('/:id', auth, SimulationController.deleteSimulation);

module.exports = router;