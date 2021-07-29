const express = require('express');
const router = express.Router();

const { verifyLogin, isAdmin } = require('../middleware/auth.middleware');
const tripsController = require('../controllers/trips.controller');

router.get(
    '/',
    tripsController.getTripsData
);

router.get(
    '/numbers',
    verifyLogin,
    tripsController.getTripsDataNumbers
);

router.get(
    '/vehicles-numbers',
    tripsController.getVehicleTopNumbers
);

module.exports = router;