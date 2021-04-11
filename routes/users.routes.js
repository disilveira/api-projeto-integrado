const express = require('express');
const router = express.Router();

const verifyLogin = require('../middleware/auth.middleware');
const usersController = require('../controllers/users.controller');

router.get(
    '/',
    verifyLogin,
    usersController.getUsers
);

module.exports = router;