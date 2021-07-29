const express = require('express');
const router = express.Router();

const { verifyLogin, isAdmin } = require('../middleware/auth.middleware');
const tripsController = require('../controllers/trips.controller');

router.get(
    '/',
    verifyLogin,
    tripsController.getTripsData
);

router.get(
    '/numbers',
    verifyLogin,
    tripsController.getTripsDataNumbers
);

router.get(
    '/vehicles-numbers',
    verifyLogin,
    tripsController.getVehicleTopNumbers
);

module.exports = router;