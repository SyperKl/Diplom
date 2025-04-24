
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const simulationSchema = new Schema({
    parameters: {
        servers: { type: Number, required: true },
        maxQueueLength: { type: Number, required: true },
        arrivalRate: { type: Number, required: true },
        serviceRate: { type: Number, required: true }
    },
    statistics: {
        totalCustomers: { type: Number, default: 0 },
        servedCustomers: { type: Number, default: 0 },
        rejectedCustomers: { type: Number, default: 0 },
        averageWaitTime: { type: Number, default: 0 },
        serverUtilization: { type: Number, default: 0 }
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});


simulationSchema.index({ createdAt: -1 });


simulationSchema.index({ user: 1, createdAt: -1 });


simulationSchema.index({ 'parameters.servers': 1, 'parameters.maxQueueLength': 1 });


simulationSchema.index({ 'statistics.serverUtilization': -1 });

module.exports = mongoose.model('Simulation', simulationSchema);
