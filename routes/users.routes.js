const express = require('express');
const router = express.Router();

const { verifyLogin, isAdmin } = require('../middleware/auth.middleware');
const usersController = require('../controllers/users.controller');

router.get(
    '/',
    verifyLogin,
    isAdmin,
    usersController.getUsers
);

router.get(
    '/:user_id',
    verifyLogin,
    isAdmin,
    usersController.getUserById
);

router.patch(
    '/',
    verifyLogin,
    isAdmin,
    usersController.updateUser
);

router.delete(
    '/',
    verifyLogin,
    isAdmin,
    usersController.deleteUser
);

module.exports = router;