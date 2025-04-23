// routes/simulations.js
import { Router } from 'express';
const router = Router();
import { getAllSimulations, getSimulationById, createSimulation, updateSimulation, deleteSimulation } from '../controllers/simulation';
import auth from '../middleware/auth';
import { basicLimiter, strictLimiter } from '../middleware/rateLimiter';

// Публичные маршруты с базовым ограничением
router.get('/', basicLimiter, getAllSimulations);
router.get('/:id', basicLimiter, getSimulationById);

// Защищенные маршруты со строгим ограничением
router.post('/', auth, strictLimiter, createSimulation);
router.put('/:id', auth, strictLimiter, updateSimulation);
router.delete('/:id', auth, strictLimiter, deleteSimulation);

export default router;
