const Simulation = require('../models/Simulation');


exports.getAllSimulations = async (req, res) => {
    try {
        const simulations = await Simulation.find();
        res.json(simulations);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
};


exports.getSimulationById = async (req, res) => {
    try {
        const simulation = await Simulation.findById(req.params.id);

        if (!simulation) {
            return res.status(404).json({ message: 'Симуляция не найдена' });
        }

        res.json(simulation);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
};


exports.createSimulation = async (req, res) => {
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
};


exports.updateSimulation = async (req, res) => {
    try {
        const simulation = await Simulation.findByIdAndUpdate(
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
};


exports.deleteSimulation = async (req, res) => {
    try {
        const simulation = await Simulation.findByIdAndDelete(req.params.id);

        if (!simulation) {
            return res.status(404).json({ message: 'Симуляция не найдена' });
        }

        res.json({ message: 'Симуляция успешно удалена' });
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
};
