const express = require('express');
const router = express.Router();
const SimulationController = require('../controllers/simulation');
const auth = require('../middleware/auth');
const { basicLimiter, strictLimiter } = require('../middleware/rateLimiter');

// Публичные маршруты с базовым ограничением
router.get('/', basicLimiter, SimulationController.getAllSimulations);
router.get('/:id', basicLimiter, SimulationController.getSimulationById);

// Защищенные маршруты со строгим ограничением
router.post('/', auth, SimulationController.createSimulation);
router.put('/:id', auth, strictLimiter, SimulationController.updateSimulation);
router.delete('/:id', auth, strictLimiter, SimulationController.deleteSimulation);

module.exports = router;
