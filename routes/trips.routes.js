const express = require('express');
const router = express.Router();

const { verifyLogin, isAdmin } = require('../middleware/auth.middleware');
const tripsController = require('../controllers/trips.controller');

router.get(
    '/',
    tripsController.getTrips
);

module.exports = router;