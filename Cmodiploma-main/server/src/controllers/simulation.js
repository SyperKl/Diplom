import Simulation, { find, findById, findByIdAndUpdate, findByIdAndDelete } from '../models/Simulation';

// Получение всех симуляций
export async function getAllSimulations(req, res) {
    try {
        const simulations = await find();
        res.json(simulations);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
}

// Получение одной симуляции по ID
export async function getSimulationById(req, res) {
    try {
        const simulation = await findById(req.params.id);

        if (!simulation) {
            return res.status(404).json({ message: 'Симуляция не найдена' });
        }

        res.json(simulation);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
}

// Создание новой симуляции
export async function createSimulation(req, res) {
    try {
        const newSimulation = new Simulation({
            parameters: req.body.parameters,
            statistics: req.body.statistics
        });

        const savedSimulation = await newSimulation.save();
        res.json(savedSimulation);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
}

// Обновление симуляции
export async function updateSimulation(req, res) {
    try {
        const simulation = await findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!simulation) {
            return res.status(404).json({ message: 'Симуляция не найдена' });
        }

        res.json(simulation);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
}

// Удаление симуляции
export async function deleteSimulation(req, res) {
    try {
        const simulation = await findByIdAndDelete(req.params.id);

        if (!simulation) {
            return res.status(404).json({ message: 'Симуляция не найдена' });
        }

        res.json({ message: 'Симуляция успешно удалена' });
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
}
