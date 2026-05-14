const { getAllActiveServices, getServiceById } = require('../models/serviceModel');

const getAllServices = async (req, res) => {
    try {
        const services = await getAllActiveServices();
        res.json(services);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getService = async (req, res) => {
    try {
        const service = await getServiceById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllServices, getService };
