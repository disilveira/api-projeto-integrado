const express = require('express');
const router = express.Router();

const { verifyLogin, isAdmin } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

router.post('/signup', 
    verifyLogin,
    isAdmin, 
    authController.signup
);

router.post('/signin', authController.signin);

router.get('/load-session', 
    verifyLogin, 
    authController.loadSession
);

module.exports = router;